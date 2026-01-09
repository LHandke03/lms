<template>
  <div class="border-t mt-4">
    <!-- EditorJS -->
    <div v-if="mode === 'editorjs'" class="w-5/6 mx-auto pt-4">
      <label class="block font-medium text-ink-gray-5 mb-1">
        {{ __('Content') }}
      </label>

      <div
        ref="editorHolder"
        class="ProseMirror prose prose-table:table-fixed prose-td:p-2 prose-th:p-2 prose-td:border prose-th:border
               prose-td:border-outline-gray-2 prose-th:border-outline-gray-2 prose-td:relative prose-th:relative
               prose-th:bg-surface-gray-2 prose-sm max-w-none !whitespace-normal py-3"
      />
    </div>

    <!-- HTML -->
    <div v-else-if="mode === 'html'" class="w-5/6 mx-auto pt-4">
      <label class="block font-medium text-ink-gray-5 mb-1">
        {{ __('Content (HTML)') }}
      </label>

      <CodeEditor
        type="HTML"
        v-model="bodyProxy"
        height="500px"
        :showLineNumbers="true"
        :key="editorKey"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onBeforeUnmount, nextTick, computed } from "vue"
import EditorJS from "@editorjs/editorjs"
import CodeEditor from "@/components/Controls/CodeEditor.vue"
import { getEditorTools, enablePlyr } from "@/utils"

const props = defineProps({
  mode: { type: String, required: true }, // 'editorjs' | 'html'
  editorKey: { type: String, default: "new-lesson" }, // damit CodeEditor sauber resetten kann
  body: { type: String, default: "" },     // HTML
  content: { type: String, default: "" },  // EditorJS JSON als string
})

const emit = defineEmits(["update:body", "update:content"])

const editorHolder = ref(null)
const editor = ref(null)

const bodyProxy = computed({
  get: () => props.body,
  set: (val) => emit("update:body", val),
})

const destroyEditor = async () => {
  if (!editor.value) return
  try {
    await editor.value.destroy()
  } catch (_) {
    // ignore
  }
  editor.value = null
}

const initEditor = async () => {
  if (editor.value || !editorHolder.value) return

  editor.value = new EditorJS({
    holder: editorHolder.value,
    tools: getEditorTools(true),
    defaultBlock: "markdown",
    onChange: async () => enablePlyr(),
  })

  await editor.value.isReady

  // initial render wenn content da ist
  if (props.content?.trim()) {
    try {
      const parsed = JSON.parse(props.content)
      await editor.value.render(parsed)
    } catch (e) {
      console.warn("Invalid EditorJS content JSON:", e)
    }
  }
}

watch(
  () => props.mode,
  async (newMode) => {
    if (newMode === "editorjs") {
      await nextTick()
      await initEditor()
    } else {
      await destroyEditor()
    }
  },
  { immediate: true }
)

// Wenn content von außen nachgeladen wird (resource onSuccess) und wir im editorjs sind:
watch(
  () => props.content,
  async (val) => {
    if (props.mode !== "editorjs") return
    if (!editor.value) return
    if (!val?.trim()) return
    try {
      const parsed = JSON.parse(val)
      await editor.value.render(parsed)
    } catch (_) {
      // ignore
    }
  }
)

onBeforeUnmount(async () => {
  await destroyEditor()
})

// Optional helper: Parent kann beim Speichern editor.save() nutzen,
// oder du könntest hier eine expose()-Methode anbieten.
// Fürs Expose siehe unten im Abschnitt "save".
defineExpose({
  async saveEditorJS() {
    if (!editor.value) return null
    const output = await editor.value.save()
    return output
  },
})
</script>
<style>
.embed-tool__caption,
.cdx-simple-image__caption {
	display: none;
}

.ce-block__content {
	max-width: none;
}

.codex-editor--narrow .ce-toolbar__actions {
	right: 100%;
}

.ce-toolbar__content {
	max-width: none;
}

.codeBoxHolder {
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: flex-start;
}

.codeBoxTextArea {
	width: 100%;
	min-height: 30px;
	padding: 10px;
	border-radius: 2px 2px 2px 0;
	border: none !important;
	outline: none !important;
	font: 14px monospace;
}

.codeBoxSelectDiv {
	display: flex;
	flex-direction: column;
	justify-content: flex-start;
	align-items: flex-start;
	position: relative;
}

.codeBoxSelectInput {
	border-radius: 0 0 20px 2px;
	padding: 2px 26px;
	padding-top: 0;
	padding-right: 0;
	text-align: left;
	cursor: pointer;
	border: none !important;
	outline: none !important;
}

.codeBoxSelectDropIcon {
	position: absolute !important;
	left: 10px !important;
	bottom: 0 !important;
	width: unset !important;
	height: unset !important;
	font-size: 16px !important;
}

.codeBoxSelectPreview {
	display: none;
	flex-direction: column;
	justify-content: flex-start;
	align-items: flex-start;
	border-radius: 2px;
	box-shadow: 0 3px 15px -3px rgba(13, 20, 33, 0.13);
	position: absolute;
	top: 100%;
	margin: 5px 0;
	max-height: 30vh;
	overflow-x: hidden;
	overflow-y: auto;
	z-index: 10000;
}

.codeBoxSelectItem {
	width: 100%;
	padding: 5px 20px;
	margin: 0;
	cursor: pointer;
}

.codeBoxSelectedItem {
	background-color: lightblue !important;
}

.codeBoxShow {
	display: flex !important;
}

.dark {
	color: #abb2bf;
	background-color: #282c34;
}

.light {
	color: #383a42;
	background-color: #fafafa;
}

.codeBoxTextArea {
	line-height: 1.7;
}

.prose :where(pre):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
	overflow-x: unset;
}

iframe {
	border: none !important;
}

.tc-table {
	border-left: 1px solid #e8e8eb;
}

.ce-toolbox__button[data-tool='markdown'] {
	display: none !important;
}

.ce-popover-item[data-item-name='markdown'] {
	display: none !important;
}

.plyr__volume input[type='range'] {
	display: none;
}

.plyr__control--overlaid {
	background: radial-gradient(
		circle,
		rgba(0, 0, 0, 0.4) 0%,
		rgba(0, 0, 0, 0.5) 50%
	);
}

.plyr__control:hover {
	background: none;
}

.plyr--video {
	border: 1px solid theme('colors.gray.200');
	border-radius: 8px;
}

.ce-popover__container {
	border-radius: 12px;
	padding: 8px;
}

.cdx-search-field {
	border: none;
}

.cdx-search-field__input {
	font-weight: 400;
	font-size: 13px;
}

.cdx-search-field__input::before {
	font-weight: 400;
}

.cdx-search-field__input:focus {
	--tw-ring-color: theme('colors.gray.100');
}

.ce-popover-item__title {
	font-size: 13px;
	font-weight: 400;
}

.ce-popover-item__icon svg {
	width: 15px;
	height: 15px;
}

.ce-popover--opened > .ce-popover__container {
	max-height: unset;
}

.cdx-search-field__icon svg {
	width: 15px;
	height: 15px;
}

.cdx-search-field__icon {
	margin-right: 5px;
}

.cdx-block.embed-tool {
	position: relative;
	display: inline-block;
	width: 100%;
}

:root {
	--plyr-range-fill-background: white;
	--plyr-video-control-background-hover: transparent;
}
</style>
