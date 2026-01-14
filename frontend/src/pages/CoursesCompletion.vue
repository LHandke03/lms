<template>
    <div v-if="course.data" class="h-dvh overflow-hidden flex flex-col">
        <header
			class="shrink-0 z-10 flex flex-col border-b text-ink-blue-1 bg-blue-400 px-3 py-2.5 sm:px-5"
		>
			<div class="flex flex-row items-center text-ink-blue-1 justify-between w-full space-x-4">
				<Breadcrumbs class="h-7" :items="breadcrumbs" />
				<!-- <div class="flex items-center space-x-2">
					<router-link
						:to="{
							name: 'CourseDetail',
							params: { courseName: courseName },
						}"
					>
						<Button>
							{{ __('Complete Course') }}
						</Button>
					</router-link>
				</div>	 -->
			</div>
			<div class="flex flex-col mt-4 w-full">
				<div class="text-3xl flex flex-row font-semibold w-full justify-between text-ink-gray-9">
					{{ courseName }}
				</div>
			</div>		
		</header>
        <div class="grid flex-1 border-l min-h-0"
            :class="ShowOutline?'md:grid-cols-[85%,15%]':'md:grid-cols-[100%,0%]'"
        >
            <div class="flex flex-row h-full w-full bg-surface-blue-2">
                <div v-if="course.data.membership.progress == 100"
                class="w-5/6 h-fit bg-surface-blue-2"
                style="
                    font-family: Arial, sans-serif;
                    margin: 40px auto;
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 32px;
                    background: var(--bg-color);
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    color: var(--text-color);
                    text-align: center;
                "
            >
                <h2
                    style="
                    font-size: 22px;
                    font-weight: 600;
                    color: var(--heading-color);
                    margin-bottom: 16px;
                    "
                >
                    🎉 Glückwunsch zum erfolgreichen Kursabschluss!
                </h2>

                <p style="line-height: 1.6; margin-bottom: 28px;">
                    Sie haben den Kurs <strong>{{ courseName }}</strong>
                    erfolgreich abgeschlossen. 
                </p>

                <div
                    style="
                    background-color: var(--highlight-bg);
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 32px;
                    "
                >
                    <p style="margin: 0; line-height: 1.6;">
                        {{ course.data.course_completion_text }}
                    </p>
                    </br>
                    <p v-if="course.data.enable_certification" style="margin: 0; line-height: 1.6;">
                        Wenn für diesen Kurs ein Zertifikat vorgesehen ist,
                        kannst du es jetzt herunterladen.
                    </p>
                </div>

                <div
                    style="
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 16px;
                    "
                >
                    <!-- Zertifikat -->
                    <Button 
                        v-if="course.data.enable_certification"
                        :variant="'solid'"
                        theme="blue"
                        @click="fetchCertificate()"
                    >
                        {{__('Get Certificate') }}
                    </Button >

                    <!-- Zurück zur Startseite -->
                    <router-link 
                        :to="{
                            name: 'Home'
                        }"
                    >
                    <Button
                        :variant="course.data.enable_certification?'subtle':'solid'"
                    >
                        {{ __('Back to Home') }}
                    </Button>
                        
                    </router-link>
                </div>
                </div>
                <div v-else-if="course.data.membership.progress < 100" class="shadow rounded-md w-3/4 mt-10 mx-auto text-center p-4" >
                    <div class="flex items-center justify-center mt-4 space-x-2">
                        <Info class="size-4 stroke-2 text-ink-gray-5" />
                        <div class="text-lg font-semibold text-ink-gray-7">
                            {{ __('Course Incomplete') }}
                        </div>
                    </div>
                </div>
                <div v-else class="shadow rounded-md w-3/4 mt-10 mx-auto text-center p-4" >
                    <div class="flex items-center justify-center mt-4 space-x-2">
                        <LockKeyholeIcon class="size-4 stroke-2 text-ink-gray-5" />
                        <div class="text-lg font-semibold text-ink-gray-7">
                            {{ __('You are not Enrolled in this course') }}
                        </div>
                    </div>
                    <div class="mt-1 mb-4 text-ink-gray-7">
                        {{
                            __(
                                'Please enroll to access the course content and complete the course.'
                            )
                        }}
                    </div>
                </div>
                <div class="h-full border-r border-outline-gray-3 item-center justify-center flex flex-col">
					<div class="h-12 border-l border-y rounded-l-lg bg-surface-white border-outline-gray-3 hover:bg-surface-gray-2 cursor-pointer flex items-center px-3"
						@click="openOutline()"
					>
						<CollapseSidebar
							class="size-4 text-ink-gray-7 duration-300 stroke-1.5 ease-in-out "
							:class="{
								'[transform:rotateY(180deg)]': ShowOutline,
							}"
						/>
					</div>						
				</div>
            </div>
            <div class="sticky max-h-[calc(100dvh-2.5rem)] flex flex-col min-h-0" 
                :class="ShowOutline  ? '': 'hidden'"
			>
				<div class="shrink-0">
					<div class="bg-surface-menu-bar py-5 px-2 border-b border-outline-gray-3">
						<div class="text-lg font-semibold text-ink-gray-9">
							{{ courseName}}
						</div>
						<div
							v-if="user && course.data.membership"
							class="text-sm mt-4 mb-2 text-ink-gray-5"
						>
							100% {{ __('completed') }}
						</div>

						<ProgressBar
							v-if="user && course.data.membership"
							:progress="100"
						/>
					</div>
				</div>
				<div class="flex flex-col flex-1 min-h-0 justify-between">
					<div class="overflow-y-auto"
						:class="false?'h-1/2':'h-5/6'"
					>
						<!-- <CourseOutline
							:courseName="courseName"
							:getProgress="course.data.membership ? true : false"
							:lessonProgress="100"
						/> -->
                        <!-- <CourseOutline
                            :courseName="courseName"
                            :key="courseName"
                            :showOutline="true"
                            :getProgress="true"
                            :lessonProgress="100"
                        /> -->
					</div>			
				</div>
			</div>
        </div>
    </div>
</template>
<script setup>
import {
	Badge,
	Breadcrumbs,
	Button,
	call,
	createListResource,
	createResource,
	TabButtons,
	Tooltip,
	usePageMeta,
} from 'frappe-ui'
import {
	computed,
	watch,
	inject,
	ref,
	onMounted,
	onBeforeUnmount,
	nextTick,
} from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
	ChevronLeft,
	ChevronRight,
	LockKeyholeIcon,
	LogIn,
	Focus,
	Info,
	MessageCircleQuestion,
	TrendingUp,
	Check,
	PenLine,
} from 'lucide-vue-next'
import { getEditorTools, enablePlyr, highlightText } from '@/utils'
import { sessionStore } from '@/stores/session'
import { useSidebar } from '@/stores/sidebar'
import EditorJS from '@editorjs/editorjs'
import LessonContent from '@/components/LessonContent.vue'
import CourseInstructors from '@/components/CourseInstructors.vue'
import ProgressBar from '@/components/ProgressBar.vue'
import Discussions from '@/components/Discussions.vue'
import CertificationLinks from '@/components/CertificationLinks.vue'
import VideoStatistics from '@/components/Modals/VideoStatistics.vue'
import CourseOutline from '@/components/CourseOutline.vue'
import UserAvatar from '@/components/UserAvatar.vue'
import Notes from '@/components/Notes/Notes.vue'
import InlineLessonMenu from '@/components/Notes/InlineLessonMenu.vue'
import NotesModal from '@/components/Modals/NotesModal.vue'

const user = inject('$user')
const socket = inject('$socket')
const router = useRouter()
const route = useRoute()
const { brand } = sessionStore()
const sidebarStore = useSidebar()
const plyrSources = ref([])
const showInlineMenu = ref(false)
const NotesShow = ref(false)
const currentTab = ref('Notes')
const showNotesModal = ref(false)
const currentLessonNumber = ref(1)
const currentChapterNumber = ref(1)
const ShowOutline = ref(false)

const props = defineProps({
	courseName: {
		type: String,
		required: true,
	},
	/* chapterNumber: {
		type: String,
		required: true,
	},
	lessonNumber: {
		type: String,
		required: true,
	},
	time_per_lesson: {
		type: String,
		required: true,
	} */
})

onMounted(() => {
	sidebarStore.isSidebarCollapsed = true
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
    onSuccess(data) {
        const Currentlesson = splitToIntegers(data.data.current_lesson)
        currentChapterNumber.value = Currentlesson ? Currentlesson[0] : 1,
        currentLessonNumber.value = Currentlesson ? Currentlesson[1] : 1
    }
})
console.log("course completion props: ", props, course)
/* 
onBeforeUnmount(() => {
    sidebarStore.isSidebarCollapsed = false
})
 */
const openOutline = () => {
	ShowOutline.value = !ShowOutline.value
}	


function splitToIntegers(value) {
    if (typeof value !== "string") return null;

    const parts = value.split("-");
    if (parts.length !== 2) return null;

    const a = parseInt(parts[0], 10);
    const b = parseInt(parts[1], 10);

    if (Number.isNaN(a) || Number.isNaN(b)) return null;

    return [a, b];
}

const certificate = createResource({
	url: 'lms.lms.doctype.lms_certificate.lms_certificate.create_certificate',
	makeParams(values) {
		return {
			course: values.course,
		}
	},
	onSuccess(data) {
		window.open(
			`/api/method/frappe.utils.print_format.download_pdf?doctype=LMS+Certificate&name=${
				data.name
			}&format=${encodeURIComponent(data.template)}`,
			'_blank'
		)
	},
})
const fetchCertificate = () => {
	certificate.submit({
		course: props.course.data?.name,
		member: user.data?.name,
	})
}
const breadcrumbs = computed(() => ([
  { label: __('Courses'), route: { name: 'Courses' } },
  { label: props.courseName, route: { name: 'CourseDetail', params: { courseName: props.courseName } } },
  { label: __('Completion') },
]))

</script>
<style>
    :root {
        --bg-color: #ffffff;
        --text-color: #333333;
        --heading-color: #222222;
        --highlight-bg: #f4f4f4;
        --border-color: #cccccc;
        --primary-color: #2563eb;
        --primary-hover: #1e4fd8;
    }

    html[data-theme='dark'] {
        --bg-color: #1e1e1e;
        --text-color: #dddddd;
        --heading-color: #ffffff;
        --highlight-bg: #2c2c2c;
        --border-color: #444444;
        --primary-color: #3b82f6;
        --primary-hover: #2563eb;
    }
</style>