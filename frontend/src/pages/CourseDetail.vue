<template>
	<div v-if="course.data">
		<!-- <header
			class="sticky top-0 z-10 flex items-center justify-between border-b border-outline-gray-2 bg-surface-white px-3 py-2.5 sm:px-5"
		>
			<Breadcrumbs class="h-7" :items="breadcrumbs" />
		</header> -->
		<div class="min-h-screen bg-surface-gray-1 px-5 pt-6 pb-10">
			<section
				class="relative overflow-hidden rounded-2xl border border-outline-gray-2 bg-surface-blue-2 px-6 py-6 shadow-sm"
			>
				<div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
					<div class="md:w-2/3">
						<div class="text-3xl font-semibold text-ink-gray-9">
							{{ course.data.title }}
						</div>
						<div class="mt-2 leading-6 text-ink-gray-7">
							{{ course.data.short_introduction }}
						</div>
						<div class="mt-4 flex flex-wrap items-center gap-3 text-sm">
							<Tooltip
								v-if="parseInt(course.data.rating) > 0"
								:text="__('Average Rating')"
								class="flex items-center rounded-md border border-outline-gray-2 bg-surface-white px-2 py-1"
							>
								<Star class="size-4 text-transparent fill-yellow-500" />
								<span class="ml-1 text-ink-gray-7">
									{{ course.data.rating }}
								</span>
							</Tooltip>
							<Tooltip
								v-if="course.data.enrollment_count"
								:text="__('Enrolled Students')"
								class="flex items-center rounded-md border border-outline-gray-2 bg-surface-white px-2 py-1"
							>
								<Users class="h-4 w-4 text-ink-gray-7" />
								<span class="ml-1">
									{{ course.data.enrollment_count_formatted }}
								</span>
							</Tooltip>
							<div class="flex items-center rounded-md border border-outline-gray-2 bg-surface-white px-2 py-1">
								<span
									class="mr-1 h-6"
									:class="{
										'avatar-group overlap': course.data.instructors.length > 1,
									}"
								>
									<UserAvatar
										v-for="instructor in course.data.instructors"
										:user="instructor"
									/>
								</span>
								<CourseInstructors :instructors="course.data.instructors" />
							</div>
						</div>
						<div v-if="course.data.tags" class="mt-4 flex w-fit flex-wrap gap-2">
							<Badge
								theme="gray"
								size="lg"
								class="text-ink-gray-9"
								v-for="tag in course.data.tags.split(', ')"
							>
								{{ tag }}
							</Badge>
						</div>
					</div>
					<router-link :to="{ name: 'Home' }" class="self-start">
						<Button variant="subtle">
							<template #prefix>
								<ArrowLeft class="h-4 w-4 stroke-1.5" />
							</template>
							{{ __('Home') }}
						</Button>
					</router-link>
				</div>
			</section>
			<section class="mt-8 rounded-2xl border border-outline-gray-2 bg-surface-white p-5 shadow-sm">
				<div class="flex justify-between w-full space-x-5">
					<div class="md:w-2/3">
						<div class="md:hidden my-4">
							<CourseCardOverlay :course="course" />
						</div>
						<div
							v-html="course.data.description"
							class="ProseMirror prose prose-table:table-fixed prose-td:p-2 prose-th:p-2 prose-td:border prose-th:border prose-td:border-outline-gray-2 prose-th:border-outline-gray-2 prose-td:relative prose-th:relative prose-th:bg-surface-gray-2 prose-sm max-w-none !whitespace-normal"
						></div>
						<div class="mt-10">
							<CourseOutline
								:title="__('Course Outline')"
								:courseName="course.data.name"
								:showOutline="true"
								:getProgress="course.data.membership ? true : false"
								:key="course.data.name"
								:lessonProgress="0"
							/>
						</div>
						<!-- <CourseReviews
							:courseName="course.data.name"
							:avg_rating="course.data.rating"
							:membership="course.data.membership"
						/> -->
					</div>
					<div class="hidden md:block">
						<CourseCardOverlay :course="course" />
					</div>
				</div>
				<RelatedCourses :courseName="course.data.name" />
			</section>
		</div>
	</div>
</template>
<script setup>
import {
	createResource,
	Breadcrumbs,
	Badge,
	Button,
	Tooltip,
	usePageMeta,
} from 'frappe-ui'
import { computed, inject, watch } from 'vue'
import { ArrowLeft, Users, Star } from 'lucide-vue-next'
import { sessionStore } from '@/stores/session'
import { useRouter } from 'vue-router'
import CourseCardOverlay from '@/components/CourseCardOverlay.vue'
import CourseOutline from '@/components/CourseOutline.vue'
import CourseReviews from '@/components/CourseReviews.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import CourseInstructors from '@/components/CourseInstructors.vue'
import RelatedCourses from '@/components/RelatedCourses.vue'

const { brand } = sessionStore()
const router = useRouter()
const user = inject('$user')

const props = defineProps({
	courseName: {
		type: String,
		required: true,
	},
})

const course = createResource({
	url: 'lms.lms.utils.get_course_details',
	cache: ['course', props.courseName],
	makeParams() {
		return {
			course: props.courseName,
		}
	},
	auto: true,
})

watch(
	() => props.courseName,
	() => {
		course.reload()
	}
)
watch(course, () => {
	if (
		!isInstructor() &&
		!user.data?.is_moderator &&
		!course.data?.published &&
		!course.data?.upcoming && !course.data?.membership?.some(e => e.member == user.data?.name)
	) {
		router.push({
			name: 'Courses',
		})
	}
})

const isInstructor = () => {
	let user_is_instructor = false
	course.data?.instructors.forEach((instructor) => {
		if (!user_is_instructor && instructor.name == user.data?.name) {
			user_is_instructor = true
		}
	})
	return user_is_instructor
}

const breadcrumbs = computed(() => {
	let items = [{ label: __('Courses'), route: { name: 'Courses' } }]
	items.push({
		label: course?.data?.title,
		route: { name: 'CourseDetail', params: { courseName: course?.data?.name } },
	})
	return items
})

usePageMeta(() => {
	return {
		title: course?.data?.title,
		icon: brand.favicon,
	}
})
</script>
<style>
.avatar-group {
	display: inline-flex;
	align-items: center;
}

.avatar-group .avatar {
	transition: margin 0.1s ease-in-out;
}
</style>
