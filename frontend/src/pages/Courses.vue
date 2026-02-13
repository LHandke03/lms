<template>
	<!-- <header
		class="sticky top-0 z-10 flex items-center justify-between border-b border-outline-gray-2 bg-surface-white px-3 py-2.5 sm:px-5"
	>
		<Breadcrumbs :items="breadcrumbs" />
	</header> -->
	<div class="min-h-screen bg-surface-gray-1 px-5 pt-6 pb-10">
		<section
			class="relative overflow-hidden rounded-2xl border border-outline-gray-2 bg-surface-blue-2 px-6 py-6 shadow-sm"
		>
			<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
				<div>
					<div class="text-2xl font-bold text-ink-gray-9">
						{{ __('Courses') }}
					</div>
					<div class="mt-1 text-sm text-ink-gray-7">
						{{ __('Finde und verwalte deine Kurse.') }}
					</div>
				</div>
				<div class="flex items-center gap-2">
					<router-link :to="{ name: 'Home' }">
						<Button variant="subtle">
							<template #prefix>
								<ArrowLeft class="h-4 w-4 stroke-1.5" />
							</template>
							{{ __('Home') }}
						</Button>
					</router-link>
					<router-link
						v-if="canCreateCourse()"
						:to="{
							name: 'CourseForm',
							params: { courseName: 'new' },
						}"
					>
						<Button variant="solid">
							<template #prefix>
								<Plus class="h-4 w-4 stroke-1.5" />
							</template>
							{{ __('Create') }}
						</Button>
					</router-link>
				</div>
			</div>
			<div
				class="mt-5 flex flex-col justify-between gap-3 rounded-xl border border-outline-gray-2 bg-surface-white p-4 lg:flex-row lg:items-center"
			>
				<div class="text-sm font-semibold text-ink-gray-8">
					{{ __('Filter') }}
				</div>
				<div
					class="flex flex-col space-y-3 lg:space-y-0 lg:flex-row lg:items-center lg:space-x-4"
				>
					<TabButtons :buttons="courseTabs" v-model="currentTab" class="w-fit" />

					<div class="grid grid-cols-2 gap-2">
						<FormControl
							v-model="title"
							:placeholder="__('Search by Title')"
							type="text"
							class="w-full lg:min-w-0 lg:w-32 xl:w-40"
							@input="updateCourses()"
						/>
						<div class="w-full lg:min-w-0 lg:w-32 xl:w-40">
							<Select
								v-if="categories.length"
								v-model="currentCategory"
								:options="categories"
								:placeholder="__('Category')"
								@change="updateCourses()"
							/>
						</div>
					</div>

					<FormControl
						v-model="certification"
						:label="__('Certification')"
						type="checkbox"
						@change="updateCourses()"
					/>
				</div>
			</div>
		</section>
		<section class="mt-8 rounded-2xl border border-outline-gray-2 bg-surface-white p-5 shadow-sm">
			<div class="mb-4 text-lg font-semibold text-ink-gray-9">
				{{ __('All Courses') }}
			</div>
			<div
				v-if="courses.data?.length"
				class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
			>
				<router-link
					v-for="course in courses.data"
					:to="{ name: 'CourseDetail', params: { courseName: course.name } }"
				>
					<CourseCard :course="course" />
				</router-link>
			</div>
			<EmptyState v-else-if="!courses.list.loading" type="Courses" />
			<div
				v-if="!courses.list.loading && courses.hasNextPage"
				class="mt-5 flex justify-center"
			>
				<Button @click="courses.next()">
					{{ __('Load More') }}
				</Button>
			</div>
		</section>
	</div>
</template>
<script setup>
import {
	Breadcrumbs,
	Button,
	call,
	createListResource,
	FormControl,
	Select,
	TabButtons,
	usePageMeta,
} from 'frappe-ui'
import { computed, inject, onMounted, ref, watch } from 'vue'
import { ArrowLeft, Plus } from 'lucide-vue-next'
import { sessionStore } from '@/stores/session'
import { canCreateCourse } from '@/utils'
import { useRoute } from 'vue-router'
import CourseCard from '@/components/CourseCard.vue'
import EmptyState from '@/components/EmptyState.vue'
import router from '../router'

const user = inject('$user')
const dayjs = inject('$dayjs')
const start = ref(0)
const pageLength = ref(30)
const categories = ref([])
const currentCategory = ref(null)
const title = ref('')
const certification = ref(false)
const filters = ref({})
const currentTab = ref('Live')
const { brand } = sessionStore()
const courseCount = ref(0)
const route = useRoute()

onMounted(() => {
	setFiltersFromQuery()
	updateCourses()
	getCourseCount()
	pushHome()
	categories.value = [
		{
			label: '',
			value: null,
		},
	]
})

const setFiltersFromQuery = () => {
	let queries = new URLSearchParams(location.search)
	title.value = queries.get('title') || ''
	currentCategory.value = queries.get('category') || null
	certification.value = queries.get('certification') || false
}

const courses = createListResource({
	doctype: 'LMS Course',
	url: 'lms.lms.utils.get_courses',
	cache: ['courses', user.data?.name],
	pageLength: pageLength.value,
	start: start.value,
	onSuccess(data) {
		setCategories(data)
	},
})

const setCategories = (data) => {
	let allCategories = data.map((course) => course.category)
	allCategories = allCategories.filter(
		(category, index) => allCategories.indexOf(category) === index && category
	)
	if (categories.value.length <= allCategories.length) {
		updateCategories(data)
	}
}

const isPersonaCaptured = async () => {
	let persona = await call('frappe.client.get_single_value', {
		doctype: 'LMS Settings',
		field: 'persona_captured',
	})
	return persona
}

const identifyUserPersona = async () => {
	if (user.data?.is_system_manager && !user.data?.developer_mode) {
		let personaCaptured = await isPersonaCaptured()
		if (personaCaptured) return
		if (!courseCount.value) {
			router.push({
				name: 'PersonaForm',
			})
		}
	}
}
const pushHome = async () => {
	if (user.data.is_student && (route.fullPath == '/courses')) {
		router.push({ name: 'Home' })
	}
}

const getCourseCount = () => {
	if (!user.data) return

	call('frappe.client.get_count', {
		doctype: 'LMS Course',
	}).then((data) => {
		courseCount.value = data
		identifyUserPersona()
	})
}

const updateCourses = () => {
	updateFilters()
	courses.update({
		filters: filters.value,
	})
	courses.reload()
}

const updateFilters = () => {
	updateCategoryFilter()
	updateTitleFilter()
	updateCertificationFilter()
	updateTabFilter()
	updateStudentFilter()
	setQueryParams()
}

const updateCategoryFilter = () => {
	if (currentCategory.value) {
		filters.value['category'] = currentCategory.value
	} else {
		delete filters.value['category']
	}
}

const updateTitleFilter = () => {
	if (title.value) {
		filters.value['title'] = ['like', `%${title.value}%`]
	} else {
		delete filters.value['title']
	}
}

const updateCertificationFilter = () => {
	if (certification.value) {
		filters.value['certification'] = 1
	} else {
		delete filters.value['certification']
	}
}

const updateTabFilter = () => {
	delete filters.value['live']
	delete filters.value['created']
	delete filters.value['published_on']
	delete filters.value['upcoming']

	if (currentTab.value == 'Enrolled' && user.data?.is_student) {
		filters.value['enrolled'] = 1
		delete filters.value['published']
	} else {
		delete filters.value['published']
		delete filters.value['enrolled']

		if (currentTab.value == 'Live') {
			filters.value['published'] = 1
			filters.value['upcoming'] = 0
			filters.value['live'] = 1
		} else if (currentTab.value == 'Upcoming') {
			filters.value['upcoming'] = 1
		} else if (currentTab.value == 'New') {
			filters.value['published'] = 1
			filters.value['published_on'] = [
				'>=',
				dayjs().add(-3, 'month').format('YYYY-MM-DD'),
			]
		} else if (currentTab.value == 'Created') {
			filters.value['created'] = 1
		} else if (currentTab.value == 'Unpublished') {
			filters.value['published'] = 0
		}
	}
}

const updateStudentFilter = () => {
	if (!user.data || ((user.data?.is_student||(user.data.roles.includes('Batch Evaluator') && !user.data.roles.includes('Course Creator'))) && currentTab.value != 'Enrolled')) {
		filters.value['published'] = 1
	} else if (user.data?.roles?.includes('Course Creator') && user.data.name != "Administrator") {
		delete filters.value['published']
		filters.value['owner'] = user.data.name
	} else {
		delete filters.value['owner']
		delete filters.value['published']
	}

}

const setQueryParams = () => {
	let queries = new URLSearchParams(location.search)
	let filterKeys = {
		title: title.value,
		category: currentCategory.value,
		certification: certification.value,
	}

	Object.keys(filterKeys).forEach((key) => {
		if (filterKeys[key]) {
			queries.set(key, filterKeys[key])
		} else {
			queries.delete(key)
		}
	})

	let queryString = ''
	if (queries.toString()) {
		queryString = `?${queries.toString()}`
	}

	history.replaceState({}, '', `${location.pathname}${queryString}`)
}

const updateCategories = (data) => {
	data.forEach((course) => {
		if (
			course.category &&
			!categories.value.find((category) => category.value === course.category)
		)
			categories.value.push({
				label: course.category,
				value: course.category,
			})
	})
}

watch(currentTab, () => {
	updateCourses()
})

const courseTabs = computed(() => {
	let tabs = [
		{
			label: __('Live'),
		},
		{
			label: __('New'),
		},
		{
			label: __('Upcoming'),
		},
	]
	if (
		user.data?.is_moderator ||
		user.data?.is_instructor ||
		user.data?.is_evaluator
	) {
		tabs.push({ label: __('Created') })
		tabs.push({ label: __('Unpublished') })
	} else if (user.data) {
		tabs.push({ label: __('Enrolled') })
	}
	return tabs
})

const breadcrumbs = computed(() => [
	{
		label: __('Courses'),
		route: { name: 'Courses' },
	},
])

usePageMeta(() => {
	return {
		title: __('Courses'),
		icon: brand.favicon,
	}
})
</script>
