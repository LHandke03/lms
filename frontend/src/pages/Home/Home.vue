<template>
	<header
		class="sticky top-0 z-10 border-b border-blue-100 bg-blue-400/90 px-3 py-2.5 backdrop-blur sm:px-5"
	>
		<div class="flex items-center justify-between">
			<Breadcrumbs :items="[{ label: __('Dashboard'), route: { name: 'Home' } }]" />
			<div v-if="canCreateCourse" class="hidden items-center gap-2 text-ink-gray-9 sm:flex">
				<button
					class="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
					@click="createCourse"
				>
					<UserPlus class="h-4 w-4 stroke-1.5" />
					<span>{{ __('Kurs erstellen') }}</span>
				</button>
			</div>
		</div>
	</header>
	<div class="min-h-screen w-full bg-slate-100 px-5 pt-6 pb-10">
		<section
			class="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-300 via-blue-200 to-slate-100 px-6 py-6 shadow-sm"
		>
			<div class="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<div class="text-2xl font-bold text-ink-gray-9">
						{{ __('Dashboard') }}
					</div>
					<div class="mt-1 text-sm text-ink-gray-7">
						{{ __('Verwalte deine Kurse und Aufgaben.') }}
					</div>
				</div>
				<div v-if="canCreateCourse" class="flex flex-wrap items-center gap-2 sm:hidden">
					<button
						class="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
						@click="createCourse"
					>
						<UserPlus class="h-4 w-4 stroke-1.5" />
						<span>{{ __('Kurs erstellen') }}</span>
					</button>
				</div>
			</div>
			<div class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
				<div
					v-for="stat in displayStats"
					:key="stat.label"
					class="flex items-center gap-4 rounded-xl border border-blue-100 bg-white/80 px-4 py-3 shadow-sm"
				>
					<div
						class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600"
					>
						<component :is="stat.icon" class="h-5 w-5 stroke-1.5" />
					</div>
					<div>
						<div class="text-sm font-semibold text-ink-gray-8">
							{{ stat.label }}
						</div>
						<div class="text-xl font-bold text-ink-gray-9">
							{{ stat.value }}
						</div>
					</div>
				</div>
			</div>
		</section>

		<section class="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr]">
			<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
				<div class="flex flex-wrap items-center justify-between gap-3">
					<div class="text-lg font-semibold text-ink-gray-9">
						{{ __('Meine Kurse') }} ({{ filteredCourses.length }})
					</div>
					<div class="flex items-center gap-2">
						<Dropdown :options="courseFilterOptions">
							<template #default>
								<button
									class="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-ink-gray-6"
								>
									<Filter class="h-3.5 w-3.5 stroke-1.5" />
									<span>{{ filterLabel }}</span>
									<ChevronDown class="h-3.5 w-3.5 stroke-1.5" />
								</button>
							</template>
						</Dropdown>
						<button
							class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-ink-gray-6 transition hover:bg-slate-50"
						>
							<MoreHorizontal class="h-4 w-4 stroke-1.5" />
						</button>
					</div>
				</div>
				<div
					class="mt-4 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
				>
					<Search class="h-4 w-4 stroke-1.5 text-ink-gray-5" />
					<input
						type="text"
						:placeholder="__('Kurse suchen')"
						v-model="courseSearch"
						class="w-full border-0 bg-transparent text-sm text-ink-gray-8 placeholder:text-ink-gray-5 focus:outline-none"
					/>
				</div>
				<div
					v-if="filteredCourses.length"
					class="mt-4 grid gap-4 md:grid-cols-2"
				>
					<router-link
						v-for="course in filteredCourses"
						:key="course.name"
						:to="{ name: 'CourseDetail', params: { courseName: course.name } }"
						class="rounded-xl border border-slate-200 bg-slate-50/70 p-3 transition hover:border-blue-200"
					>
						<div class="flex items-start justify-between gap-2">
							<div class="text-sm font-semibold text-ink-gray-9">
								{{ course.title || course.name }}
							</div>
							<div class="flex items-center gap-2">
								<Dropdown
									v-if="isCourseCreator(course)"
									:options="getCourseActions(course)"
								>
									<template #default>
										<button
											class="inline-flex h-7 w-7 items-center justify-center rounded-md text-ink-gray-6 transition hover:bg-white"
											@click.stop
										>
											<MoreHorizontal class="h-4 w-4 stroke-1.5" />
										</button>
									</template>
								</Dropdown>
							</div>
						</div>
						<div class="mt-3 flex items-center gap-3">
							<div
								class="flex h-16 w-24 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-blue-100 via-blue-200 to-slate-100 text-blue-600"
							>
								<img
									v-if="course.image"
									:src="course.image"
									:alt="course.title || course.name"
									class="h-full w-full object-cover"
								/>
								<BookOpen v-else class="h-6 w-6 stroke-1.5" />
							</div>
							<div class="space-y-1">
								<div class="text-sm font-semibold text-ink-gray-9">
									{{ course.subtitle || course.title || course.name }}
								</div>
								<div class="text-xs text-ink-gray-6">
									{{ __('Ersteller: {0}').format(getCreatorName(course)) }}
								</div>
								<div class="flex items-center gap-2 text-xs text-ink-gray-6">
									<BookOpen class="h-3.5 w-3.5 stroke-1.5" />
									<span>{{ course.lessons || 0 }} {{ __('Lektionen') }}</span>
								</div>
							</div>
						</div>
					</router-link>
				</div>
				<div
					v-else
					class="mt-6 rounded-lg border border-dashed border-slate-200 p-6 text-sm text-ink-gray-6"
				>
					{{ __('Noch keine Kurse vorhanden.') }}
				</div>
			</div>

			<div class="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
				<div class="flex items-center justify-between">
					<div class="text-lg font-semibold text-ink-gray-9">
						{{ __('Zertifikate & Fortschritt') }}
					</div>
				</div>
				<div class="mt-4 max-h-[420px] space-y-4 overflow-y-auto pr-1">
					<div>
						<div class="text-sm font-semibold text-ink-gray-7">
							{{ __('Aktuelle Zertifikate') }}
						</div>
						<div v-if="certificates.data?.length" class="mt-3 space-y-3">
							<div
								v-for="certificate in certificates.data"
								:key="certificate.name"
								class="rounded-lg border border-slate-200 bg-slate-50/70 p-3"
							>
								<div class="text-sm font-semibold text-ink-gray-9">
									{{ certificate.course_title || certificate.batch_title }}
								</div>
								<div class="mt-1 text-xs text-ink-gray-6">
									{{ __('Ausgestellt am {0}').format(dayjs(certificate.issue_date).format('DD MMM YYYY')) }}
								</div>
							</div>
						</div>
						<div
							v-else
							class="mt-3 rounded-lg border border-dashed border-slate-200 p-3 text-xs text-ink-gray-6"
						>
							{{ __('Noch keine Zertifikate verfügbar.') }}
						</div>
					</div>

					<div>
						<div class="text-sm font-semibold text-ink-gray-7">
							{{ __('Zertifikatskurse in Arbeit') }}
						</div>
						<div v-if="incompleteCertificateCourses.length" class="mt-3 space-y-3">
							<div
								v-for="course in incompleteCertificateCourses"
								:key="course.name"
								class="rounded-lg border border-slate-200 bg-slate-50/70 p-3"
							>
								<div class="text-sm font-semibold text-ink-gray-9">
									{{ course.title || course.name }}
								</div>
								<div class="mt-2">
									<ProgressBar :progress="course.membership?.progress || 0" />
								</div>
								<div class="mt-1 text-xs text-ink-gray-6">
									{{ Math.ceil(course.membership?.progress || 0) }}% {{ __('abgeschlossen') }}
								</div>
							</div>
						</div>
						<div
							v-else
							class="mt-3 rounded-lg border border-dashed border-slate-200 p-3 text-xs text-ink-gray-6"
						>
							{{ __('Keine aktiven Zertifikatskurse gefunden.') }}
						</div>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>
<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import {
	Breadcrumbs,
	createListResource,
	createResource,
	Dropdown,
	usePageMeta,
} from 'frappe-ui'
import { sessionStore } from '@/stores/session'
import {
	Award,
	BookOpen,
	ChevronDown,
	Filter,
	MoreHorizontal,
	Search,
	UserPlus,
	Users,
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import ProgressBar from '@/components/ProgressBar.vue'

const { brand } = sessionStore()
const router = useRouter()
const user = inject<any>('$user')
const dayjs = inject<any>('$dayjs')
const courseSearch = ref('')
const selectedCourseFilter = ref<'all' | 'created' | 'enrolled'>('all')

const enrolledCourses = createResource({
	url: 'lms.lms.utils.get_courses',
	auto: true,
	makeParams() {
		return {
			filters: {
				enrolled: 1,
			},
		}
	},
})

const createdCourses = createResource({
	url: 'lms.lms.utils.get_courses',
	auto: true,
	makeParams() {
		return {
			filters: {
				created: 1,
			},
		}
	},
})

const certificateCount = createResource({
	url: 'frappe.client.get_count',
	params: {
		doctype: 'LMS Certificate',
		filters: {
			member: user?.data?.name,
		},
	},
	auto: user?.data?.name ? true : false,
})

const certificates = createListResource({
	doctype: 'LMS Certificate',
	filters: {
		member: user?.data?.name,
	},
	fields: ['name', 'course_title', 'batch_title', 'issue_date', 'template'],
	cache: ['home_certificates', user?.data?.name],
	auto: user?.data?.name ? true : false,
})

const courseFilterOptions = [
	{
		label: __('Alle'),
		value: 'all',
		onClick() {
			selectedCourseFilter.value = 'all'
		},
	},
	{
		label: __('Eigene Kurse'),
		value: 'created',
		onClick() {
			selectedCourseFilter.value = 'created'
		},
	},
	{
		label: __('Eingeschriebene Kurse'),
		value: 'enrolled',
		onClick() {
			selectedCourseFilter.value = 'enrolled'
		},
	},
]

const filterLabel = computed(() => {
	return (
		courseFilterOptions.find(
			(option) => option.value === selectedCourseFilter.value
		)?.label || __('Alle')
	)
})

const allCourses = computed(() => {
	const combined = [...(enrolledCourses.data || []), ...(createdCourses.data || [])]
	const map = new Map()
	combined.forEach((course) => {
		map.set(course.name, course)
	})
	return Array.from(map.values())
})

const baseCourses = computed(() => {
	if (selectedCourseFilter.value === 'created') {
		return createdCourses.data || []
	}
	if (selectedCourseFilter.value === 'enrolled') {
		return enrolledCourses.data || []
	}
	return allCourses.value
})

const filteredCourses = computed(() => {
	const query = courseSearch.value.trim().toLowerCase()
	if (!query) return baseCourses.value
	return baseCourses.value.filter((course: any) => {
		const title = (course.title || '').toLowerCase()
		const intro = (course.short_introduction || '').toLowerCase()
		return title.includes(query) || intro.includes(query)
	})
})

const totalCreatedEnrollments = computed(() => {
	if (!createdCourses.data?.length) return 0
	return createdCourses.data.reduce((sum: number, course: any) => {
		return sum + Number(course.enrollments || 0)
	}, 0)
})

const incompleteCertificateCourses = computed(() => {
	return (enrolledCourses.data || []).filter((course: any) => {
		const hasCertificate = course.enable_certification || course.paid_certificate
		const progress = course.membership?.progress || 0
		return hasCertificate && course.membership && progress < 100
	})
})

const getCreatorName = (course: any) => {
	const firstInstructor = course.instructors?.[0]
	return (
		firstInstructor?.full_name ||
		firstInstructor?.first_name ||
		firstInstructor?.username ||
		firstInstructor?.name ||
		__('Unbekannt')
	)
}

const isCourseCreator = (course: any) => {
	return course.instructors?.some(
		(instructor: any) => instructor.name === user?.data?.name
	)
}

const getCourseActions = (course: any) => {
	return [
		{
			label: __('Kurs bearbeiten'),
			onClick() {
				router.push({ name: 'CourseForm', params: { courseName: course.name } })
			},
		},
	]
}

const canCreateCourse = computed(() => {
	return (
		user?.data?.is_instructor ||
		user?.data?.is_moderator ||
		user?.data?.is_system_manager
	)
})

const createCourse = () => {
	router.push({ name: 'CourseForm', params: { courseName: 'new' } })
}

const displayStats = computed(() => {
	const stats = [
		{
			label: __('Meine Zertifikate'),
			value: certificateCount.data || 0,
			icon: Award,
		},
		{
			label: __('Eingeschriebene Kurse'),
			value: enrolledCourses.data?.length || 0,
			icon: BookOpen,
		},
	]

	if (canCreateCourse.value) {
		stats.push(
			{
				label: __('Erstellte Kurse'),
				value: createdCourses.data?.length || 0,
				icon: UserPlus,
			},
			{
				label: __('Schüler in eigenen Kursen'),
				value: totalCreatedEnrollments.value,
				icon: Users,
			}
		)
	}

	return stats
})

usePageMeta(() => {
	return {
		title: __('Home'),
		icon: brand.favicon,
	}
})
</script>
