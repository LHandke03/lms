from __future__ import annotations

import json
import mimetypes
from dataclasses import dataclass
from typing import Optional, Tuple

import frappe


def _log(debug: bool, title: str, message: str):
    if debug:
        frappe.log_error(message=message, title=title)


def _safe_str(v) -> str:
    return ("" if v is None else str(v)).strip()


def _guess_member(doc) -> str:
    # typische Feldnamen (je nach LMS-Version/Customizing)
    for f in ("member", "user", "learner", "student", "recipient"):
        if getattr(doc, f, None):
            return _safe_str(getattr(doc, f))
    return ""


def _guess_print_format(doc, settings) -> str:
    # je nach Zertifikats-Doctype/Custom fields
    for f in ("template", "print_format", "certificate_template", "format"):
        if getattr(doc, f, None) and _safe_str(getattr(doc, f)) not in ("None", ""):
            return _safe_str(getattr(doc, f))
    return _safe_str(getattr(settings, "default_print_format", ""))


def _get_egon_data(member: str) -> Tuple[Optional[str], Optional[str]]:
    if not member:
        return None, None

    rows = frappe.get_all(
        "Egon Link",
        filters={"user": member},
        fields=["egonid", "egon_salesnumber"],
        limit=1,
    )
    if not rows:
        return None, None

    return rows[0].get("egonid"), rows[0].get("egon_salesnumber")


def _render_certificate_pdf_bytes(certificate_name: str, print_format: str) -> bytes:
    """
    Rendert das PDF server-intern, ohne HTTP call.
    Falls dein Setup zwingend weasyprint/download_pdf braucht, sag Bescheid,
    dann bau ich dir die interne route-Call Variante.
    """
    # HTML vom Print Format erzeugen
    html = frappe.get_print(
        doctype="LMS Certificate",
        name=certificate_name,
        print_format=print_format,
        doc=None,
        as_pdf=False,
    )

    # HTML -> PDF
    from frappe.utils.pdf import get_pdf
    pdf = get_pdf(html)
    return pdf


def _upload_pdf_to_target(
    *,
    settings,
    pdf_bytes: bytes,
    filename: str,
    customer_id: Optional[str],
    reseller_id: Optional[str],
    meta: dict,
) -> dict:
    """
    Macht multipart/form-data POST:
    - customerId
    - resellerId
    - file
    plus optional api_key in querystring
    """
    target_url = _safe_str(settings.target_api_url)
    if not target_url:
        raise frappe.ValidationError("Target API URL fehlt in Certificate Upload Settings")

    try:
        import requests
    except Exception as e:
        raise frappe.ValidationError(f"Python package 'requests' fehlt: {e}")

    headers = {}
    auth = settings.get_password("target_api_auth") if getattr(settings, "target_api_auth", None) else ""
    if auth:
        headers["Authorization"] = auth

    params = {}
    if _safe_str(settings.target_api_key):
        params["api_key"] = _safe_str(settings.target_api_key)

    data = {}
    if customer_id:
        data["customerId"] = str(customer_id)
    if reseller_id:
        data["resellerId"] = str(reseller_id)

    # optional metadata: wenn du’s wieder brauchst
    # for k, v in (meta or {}).items():
    #     if v is None:
    #         continue
    #     data[str(k)] = str(v)

    ctype = mimetypes.guess_type(filename)[0] or "application/pdf"
    files = {
        "file": (filename, pdf_bytes, ctype),
    }

    resp = requests.post(
        target_url,
        params=params,
        headers=headers,
        data=data,
        files=files,
        timeout=60,
    )

    body_text = resp.text or ""
    if resp.status_code >= 400:
        raise frappe.ValidationError(
            f"Target API returned {resp.status_code}: {body_text[:2000]}"
        )

    # best-effort JSON parse
    try:
        parsed = resp.json()
    except Exception:
        parsed = body_text

    return {
        "status": resp.status_code,
        "body": parsed,
    }


def handle_certificate_submit(doc, method=None):
    """
    Hook entrypoint. Wird von Frappe aufgerufen.
    """
    try:
        # settings = frappe.get_single("Certificate Upload Settings")
        frappe.log_error("Before get all", "Cert Upload debug")
        setting = frappe.db.get_all("Certificate Upload Settings")
        frappe.log_error("After get all ", setting)
        if not setting:
            frappe.log_error("No Certificate Upload Settings found", "Cert Upload debug")
            return

        settings = frappe.get_doc("Certificate Upload Settings",setting[0].name)
        frappe.log_error("Settings Fields",f"{settings.name},{settings.frappe_api_token},{settings.frappe_api_secret},{settings.default_print_format},{settings.target_api_url},{settings.target_api_auth},{settings.target_api_key}")
        frappe.log_error("Settings",settings)
        if not getattr(settings, "enabled", 0):
            return

        if getattr(settings, "run_async", 1):
            # nach commit, damit doc sicher existiert
            frappe.enqueue(
                "lms.lms.lms.certificate_upload.process_certificate_upload",
                queue="short",
                job_name=f"CertUpload:{doc.name}",
                certificate_name=doc.name,
                now=False,
                enqueue_after_commit=True,
            )
        else:
            process_certificate_upload(doc.name)
    except Exception:
        frappe.log_error(frappe.get_traceback(), "Cert Upload submit error")
        raise


def process_certificate_upload(certificate_name: str):
    try:
        _log(True,"Before get all", "Cert Upload debug")
        setting = frappe.db.get_all("Certificate Upload Settings")
        _log(True,"After get all ", setting)
        if not setting:
            frappe.log_error("No Certificate Upload Settings found", "Cert Upload debug")
            return

        settings = frappe.get_doc("Certificate Upload Settings",setting[0].name)
        _log(settings.debug_log,"Settings Fields",f"{settings.name},{settings.frappe_api_token},{settings.frappe_api_secret},{settings.default_print_format},{settings.target_api_url},{settings.target_api_auth},{settings.target_api_key}")
        _log(settings.debug_log,"Settings",settings)
    except Exception:
        frappe.log_error(frappe.get_traceback(), "Cert Upload settings error")
        raise
    debug = bool(getattr(settings, "debug_log", 0))

    cert = frappe.get_doc("LMS Certificate", certificate_name)

    member = _guess_member(cert)
    print_format = _guess_print_format(cert, settings)

    if not print_format:
        raise frappe.ValidationError(
            "Kein Print Format gefunden (weder am Zertifikat noch Default in Settings)."
        )

    _log(debug, "Cert Upload", f"Start upload for cert={cert.name}, member={member}, format={print_format}")

    egonid, salesnumber = _get_egon_data(member)
    _log(debug, "Cert Upload", f"Egon: egonid={egonid}, salesnumber={salesnumber}")

    filename = f"{print_format}_{cert.name}.pdf".replace(" ", "_")

    pdf_bytes = _render_certificate_pdf_bytes(cert.name, print_format)
    _log(debug, "Cert Upload", f"Rendered PDF bytes={len(pdf_bytes)}")

    result = _upload_pdf_to_target(
        settings=settings,
        pdf_bytes=pdf_bytes,
        filename=filename,
        customer_id=egonid,
        reseller_id=salesnumber,
        meta={"name": cert.name, "template": print_format},
    )

    # optional: Ergebnis irgendwo speichern/loggen
    _log(debug, "Cert Upload", f"Upload result: {json.dumps(result, ensure_ascii=False)[:3000]}")

    # Wenn du willst: ein Feld am Zertifikat setzen (Custom Field), z.B. upload_status/upload_response
    # cert.db_set("upload_status", "Uploaded")
    # cert.db_set("upload_response", json.dumps(result, ensure_ascii=False))
