<template>
	<div v-if="batch.data" class="">
		<!-- <header
			class="sticky top-0 z-10 border-b border-outline-gray-2 bg-surface-white px-3 py-2.5 sm:px-5"
		>
			<Breadcrumbs :items="breadcrumbs" />
		</header> -->
		<div class="min-h-screen bg-surface-gray-1 px-5 pt-6 pb-10">
			<section
				class="relative overflow-hidden rounded-2xl border border-outline-gray-2 bg-surface-blue-2 px-6 py-6 shadow-sm"
			>
				<div class="md:w-2/3">
					<div class="text-3xl font-semibold text-ink-gray-9">
						{{ batch.data.title }}
					</div>
					<div class="mt-2 leading-6 text-ink-gray-7">
						{{ batch.data.description }}
					</div>
					<div class="mt-4 flex w-fit items-center rounded-md border border-outline-gray-2 bg-surface-white px-2 py-1">
						<div
							class="mr-1 h-6"
							:class="{
								'avatar-group overlap': batch.data.instructors.length > 1,
							}"
						>
							<UserAvatar
								v-for="instructor in batch.data.instructors"
								:user="instructor"
							/>
						</div>
						<CourseInstructors :instructors="batch.data.instructors" />
					</div>
				</div>
			</section>
			<section class="mt-8 rounded-2xl border border-outline-gray-2 bg-surface-white p-5 shadow-sm">
				<div class="flex justify-between w-full">
					<div class="md:w-2/3">
						<BatchOverlay :batch="batch" class="mt-5 md:hidden" />
						<div
							class="ProseMirror prose prose-table:table-fixed prose-td:p-2 prose-th:p-2 prose-td:border prose-th:border prose-td:border-outline-gray-2 prose-th:border-outline-gray-2 prose-td:relative prose-th:relative prose-th:bg-surface-gray-2 prose-sm mt-10 max-w-none !whitespace-normal"
							v-html="batch.data.batch_details"
						></div>
					</div>
					<div class="hidden md:block">
						<BatchOverlay :batch="batch" />
					</div>
				</div>
				<div v-if="batch.data.courses.length">
					<div class="mt-10 flex items-center">
						<div class="text-2xl font-semibold text-ink-gray-9">
							{{ __('Courses') }}
						</div>
					</div>
					<div class="mt-5 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
						<div
							v-if="batch.data.courses"
							v-for="course in courses.data"
							:key="course.course"
						>
							<router-link
								:to="{
									name: 'CourseDetail',
									params: {
										courseName: course.name,
									},
								}"
							>
								<CourseCard :course="course" :key="course.name" />
							</router-link>
						</div>
					</div>
					<div v-if="batch.data.batch_details_raw">
						<div
							v-html="batch.data.batch_details_raw"
							class="batch-description"
						></div>
					</div>
				</div>
			</section>
		</div>
	</div>
</template>
<script setup>
import { computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import { BookOpen, Clock } from 'lucide-vue-next'
import { formatTime } from '@/utils'
import { Breadcrumbs, createResource, usePageMeta } from 'frappe-ui'
import { sessionStore } from '@/stores/session'
import CourseCard from '@/components/CourseCard.vue'
import BatchOverlay from '@/components/BatchOverlay.vue'
import DateRange from '../components/Common/DateRange.vue'
import CourseInstructors from '@/components/CourseInstructors.vue'
import UserAvatar from '@/components/UserAvatar.vue'

const user = inject('$user')
const router = useRouter()
const { brand } = sessionStore()

const props = defineProps({
	batchName: {
		type: String,
		required: true,
	},
})

const batch = createResource({
	url: 'lms.lms.utils.get_batch_details',
	cache: ['batch', props.batchName],
	params: {
		batch: props.batchName,
	},
	auto: true,
	onSuccess: (data) => {
		if (!data) {
			router.push({ name: 'Batches' })
		}
	},
})

const courses = createResource({
	url: 'lms.lms.utils.get_batch_courses',
	params: {
		batch: props.batchName,
	},
	cache: ['batchCourses', props.batchName],
	auto: true,
})

const breadcrumbs = computed(() => {
	let items = [{ label: __('Batches'), route: { name: 'Batches' } }]
	items.push({
		label: batch?.data?.title,
		route: { name: 'BatchDetail', params: { batchName: batch?.data?.name } },
	})
	return items
})

usePageMeta(() => {
	return {
		title: batch?.data?.title,
		icon: brand.favicon,
	}
})
</script>
<style>
.batch-description p {
	margin-bottom: 1rem;
	line-height: 1.7;
}

.batch-description li {
	line-height: 1.7;
}

.batch-description ol {
	list-style: auto;
	margin: revert;
	padding: revert;
}

.batch-description strong {
	font-weight: 600;
}
</style>
