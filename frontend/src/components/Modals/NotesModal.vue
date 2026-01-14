<template>
	<Dialog
		v-model="show"
		:title="__('Notes')"
		:options="{ size: '5xl' }"
	>
		<template #body>
			<div class="p-5 h-[80dvh] flex flex-col min-h-0">
				<div class="flex items-center justify-between mb-4">
					<div class="text-lg font-semibold text-ink-gray-9">
						{{ __('Notes') }}
					</div>
					<div class="flex items-center gap-2">
						<Button @click="$emit('updateNotes')">
							{{ __('Refresh') }}
						</Button>
						<Button variant="solid" @click="show = false">
							{{ __('Close') }}
						</Button>
					</div>
				</div>

				<div class="flex-1 min-h-0 overflow-y-auto">
					<Notes
						:lesson="lesson.data?.name"
						v-model:notes="notesModel"
						@updateNotes="$emit('updateNotes')"
					/>
				</div>
			</div>
		</template>
	</Dialog>
</template>

<script setup lang="ts">
import { Dialog, Button } from 'frappe-ui'
import Notes from '@/components/Notes/Notes.vue'

const show = defineModel<boolean>({ default: false })

const props = defineProps<{
	lesson: any
}>()

// IMPORTANT: das ist dasselbe notes-array wie in der Lesson (shared state)
const notesModel = defineModel<any[]>('notes', { default: [] })
</script>
