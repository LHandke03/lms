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
						{{ __('Batches') }}
					</div>
					<div class="mt-1 text-sm text-ink-gray-7">
						{{ __('Entdecke laufende und kommende Batch-Programme.') }}
					</div>
				</div>
				<router-link
					v-if="canCreateBatch()"
					:to="{
						name: 'BatchForm',
						params: { batchName: 'new' },
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
			<div
				class="mt-5 flex flex-col justify-between gap-3 rounded-xl border border-outline-gray-2 bg-surface-white p-4 lg:flex-row lg:items-center"
			>
				<div class="text-sm font-semibold text-ink-gray-8">
					{{ __('Filter') }}
				</div>
				<div
					class="flex flex-col space-y-3 lg:space-y-0 lg:flex-row lg:items-center lg:space-x-4"
				>
					<TabButtons
						v-if="user.data"
						:buttons="batchTabs"
						v-model="currentTab"
						class="w-fit"
					/>
					<div class="grid grid-cols-2 gap-2">
						<FormControl
							v-model="title"
							:placeholder="__('Search by Title')"
							type="text"
							class="min-w-40 lg:min-w-0 lg:w-32 xl:w-40"
							@input="updateBatches()"
						/>
						<div class="min-w-40 lg:min-w-0 lg:w-32 xl:w-40">
							<Select
								v-if="categories.length"
								v-model="currentCategory"
								:options="categories"
								:placeholder="__('Category')"
								@change="updateBatches()"
							/>
						</div>
					</div>

					<FormControl
						v-model="certification"
						:label="__('Certification')"
						type="checkbox"
						@change="updateBatches()"
					/>
				</div>
			</div>
		</section>
		<section class="mt-8 rounded-2xl border border-outline-gray-2 bg-surface-white p-5 shadow-sm">
			<div class="mb-4 text-lg font-semibold text-ink-gray-9">
				{{ __('All Batches') }}
			</div>
			<div
				v-if="batches.data?.length"
				class="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
			>
				<router-link
					v-for="batch in batches.data"
					:to="{ name: 'BatchDetail', params: { batchName: batch.name } }"
				>
					<BatchCard :batch="batch" />
				</router-link>
			</div>
			<EmptyState v-else-if="!batches.list.loading" type="Batches" />

			<div
				v-if="!batches.list.loading && batches.hasNextPage"
				class="mt-5 flex justify-center"
			>
				<Button @click="batches.next()">
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
import { Plus } from 'lucide-vue-next'
import { sessionStore } from '@/stores/session'
import BatchCard from '@/components/BatchCard.vue'
import EmptyState from '@/components/EmptyState.vue'

const user = inject('$user')
const dayjs = inject('$dayjs')
const { brand } = sessionStore()
const start = ref(0)
const pageLength = ref(20)
const categories = ref([])
const currentCategory = ref(null)
const title = ref('')
const certification = ref(false)
const filters = ref({})
const is_student = computed(() => user.data?.is_student)
const is_instructor = computed(() => user.data?.is_instructor)
const currentTab = ref(is_student.value ? 'All' : 'Upcoming')
const orderBy = ref('start_date')
const readOnlyMode = window.read_only_mode

onMounted(() => {
	setFiltersFromQuery()
	updateBatches()
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

const batches = createListResource({
	doctype: 'LMS Batch',
	url: 'lms.lms.utils.get_batches',
	cache: ['batches', user.data?.name],
	pageLength: pageLength.value,
	start: start.value,
	onSuccess(data) {
		let allCategories = data.map((batch) => batch.category)
		allCategories = allCategories.filter(
			(category, index) => allCategories.indexOf(category) === index && category
		)
		if (categories.value.length <= allCategories.length) {
			updateCategories(data)
		}
	},
})

const updateBatches = () => {
	updateFilters()
	batches.update({
		filters: filters.value,
		orderBy: orderBy.value,
	})
	batches.reload()
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
	orderBy.value = 'start_date'
	if (!user.data) {
		return
	}
	if (currentTab.value == 'Enrolled' && (is_student.value||user.data.roles.includes('Course Creator')||user.data.roles.includes("Batch Evaluator"))) {
		filters.value['enrolled'] = 1
		delete filters.value['start_date']
		delete filters.value['published']
		orderBy.value = 'start_date desc'
	} else if (is_student.value||user.data.roles.includes('Course Creator')) {
		delete filters.value['published']
	} else {
		delete filters.value['start_date']
		delete filters.value['published']
		orderBy.value = 'start_date desc'
		if (currentTab.value == 'Upcoming') {
			filters.value['start_date'] = ['>=', dayjs().format('YYYY-MM-DD')]
			filters.value['published'] = 1
			orderBy.value = 'start_date'
		} else if (currentTab.value == 'Archived') {
			filters.value['start_date'] = ['<=', dayjs().format('YYYY-MM-DD')]
		} else if (currentTab.value == 'Unpublished') {
			filters.value['published'] = 0
		}
	}
}

const updateStudentFilter = () => {
	if (!user.data || ((is_student.value||user.data.roles.includes('Course Creator')||user.data.roles.includes("Batch Evaluator")) && currentTab.value != 'Enrolled' && !(user.data.is_system_manager))) {
		filters.value['start_date'] = ['<=', dayjs().format('YYYY-MM-DD')]
		filters.value['enrolled'] = 1
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

	history.replaceState(
		{},
		'',
		`${location.pathname}${queries.size > 0 ? `?${queries.toString()}` : ''}`
	)
}

const updateCategories = (data) => {
	data.forEach((batch) => {
		if (
			batch.category &&
			!categories.value.find((category) => category.value === batch.category)
		)
			categories.value.push({
				label: batch.category,
				value: batch.category,
			})
	})
}

watch(currentTab, () => {
	updateBatches()
})

const batchTabs = computed(() => {
	let tabs = [
		{
			label: __('All'),
		},
	]

	if (
		user.data?.is_moderator
	) {
		tabs.push({ label: __('Upcoming') })
		tabs.push({ label: __('Archived') })
		tabs.push({ label: __('Unpublished') })
	} else if (user.data) {
		tabs.push({ label: __('Enrolled') })
	}
	return tabs
})

const canCreateBatch = () => {
	if (readOnlyMode) return false
	if (
		user.data?.is_moderator ||
		user.data?.is_instructor ||
		user.data?.is_evaluator
	)
		return true
	return false
}

const breadcrumbs = computed(() => [
	{
		label: __('Batches'),
		route: { name: 'Batches' },
	},
])

usePageMeta(() => {
	return {
		title: __('Batches'),
		icon: brand.favicon,
	}
})
</script>
