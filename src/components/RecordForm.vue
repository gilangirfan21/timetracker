<script setup>
import { computed, reactive, ref, watch } from 'vue'
import ActivityIcon from '@/components/ActivityIcon.vue'
import BaseIcon from '@/components/icons/BaseIcon.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import DateTimeField from '@/components/ui/DateTimeField.vue'
import TagInput from '@/components/ui/TagInput.vue'
import { TAG_SUGGESTIONS } from '@/lib/tags'
import { useRecordsStore } from '@/stores/records'

const props = defineProps({
  // Existing record, or a draft { activity_type_id?, start_time, end_time } for a new one.
  record: { type: Object, required: true },
  activities: { type: Array, required: true },
  save: { type: Function, required: true },
  remove: { type: Function, default: null },
})
const emit = defineEmits(['cancel'])

const form = reactive({
  activity_type_id: props.record.activity_type_id ?? props.activities[0]?.id ?? '',
  start: props.record.start_time,
  end: props.record.end_time,
  tags: [...(props.record.tags ?? [])],
  note: props.record.note ?? '',
})
const tagInput = ref(null)
const busy = ref(false)
const error = ref('')

const invalidRange = computed(() => new Date(form.end) <= new Date(form.start))

const activityOptions = computed(() =>
  props.activities.map((a) => ({ value: a.id, label: a.name, activity: a })),
)

// Past notes of the selected activity: the 5 latest, or matches while typing.
const recordsStore = useRecordsStore()
const pastNotes = ref([])

watch(
  () => form.activity_type_id,
  async (id) => {
    pastNotes.value = []
    if (!id) return
    try {
      pastNotes.value = await recordsStore.recentNotes(id)
    } catch {
      // suggestions are optional — ignore failures
    }
  },
  { immediate: true },
)

const noteSuggestions = computed(() => {
  const typed = form.note.trim().toLowerCase()
  return pastNotes.value
    .filter((n) => n.toLowerCase() !== typed && n.toLowerCase().includes(typed))
    .slice(0, 5)
})

async function run(action) {
  error.value = ''
  busy.value = true
  try {
    await action()
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}

function submit() {
  tagInput.value?.commitDraft()
  run(() =>
    props.save({
      activity_type_id: form.activity_type_id,
      start_time: form.start,
      end_time: form.end,
      tags: form.tags,
      note: form.note.trim() || null,
    }),
  )
}

function confirmRemove() {
  if (confirm('Delete this record?')) run(props.remove)
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <div>
      <span class="label">Activity</span>
      <BaseSelect v-model="form.activity_type_id" :options="activityOptions" placeholder="Pick activity">
        <template #option="{ option, active }">
          <ActivityIcon :activity="option.activity" size="sm" :inverted="active" />
          <span class="truncate">{{ option.label }}</span>
          <span v-if="option.activity.archived" class="text-xs opacity-70">(archived)</span>
        </template>
      </BaseSelect>
    </div>

    <div>
      <span class="label">Start</span>
      <DateTimeField v-model="form.start" quick-adjust />
    </div>
    <div>
      <span class="label">End</span>
      <DateTimeField v-model="form.end" quick-adjust />
      <p v-if="invalidRange" class="mt-1.5 text-sm text-red-600 dark:text-red-400">End must be after start.</p>
    </div>

    <div>
      <span class="label">Tags</span>
      <TagInput ref="tagInput" v-model="form.tags" :suggestions="TAG_SUGGESTIONS" />
    </div>

    <div>
      <label class="label" for="record-note">Note</label>
      <textarea id="record-note" v-model="form.note" rows="2" class="field resize-none" />
      <div v-if="noteSuggestions.length" class="mt-2 flex flex-wrap gap-1.5">
        <button
          v-for="n in noteSuggestions"
          :key="n"
          type="button"
          class="max-w-full truncate rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          :title="n"
          @click="form.note = n"
        >
          {{ n }}
        </button>
      </div>
    </div>

    <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

    <div class="flex gap-2 pt-2">
      <button
        v-if="remove"
        type="button"
        class="flex w-12 shrink-0 items-center justify-center rounded-xl border border-red-200 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
        aria-label="Delete record"
        title="Delete record"
        :disabled="busy"
        @click="confirmRemove"
      >
        <BaseIcon name="trash" size="md" />
      </button>
      <button type="button" class="btn-secondary flex-1" @click="emit('cancel')">Cancel</button>
      <button type="submit" class="btn-primary flex-1" :disabled="busy || invalidRange || !form.activity_type_id">
        {{ busy ? 'Saving…' : 'Save' }}
      </button>
    </div>
  </form>
</template>
