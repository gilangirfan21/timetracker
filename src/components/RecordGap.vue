<script setup>
import { computed } from 'vue'
import ActivityIcon from '@/components/ActivityIcon.vue'
import { local } from '@/lib/time'

const props = defineProps({
  start: { type: Object, required: true }, // dayjs
  end: { type: Object, required: true }, // dayjs
  // Day being viewed; times on another day get a date prefix.
  day: { type: Object, required: true },
})
const emit = defineEmits(['add'])

const placeholder = { name: 'No record', color: '#94a3b8', icon: '?' }

function fmt(t) {
  return t.isSame(props.day, 'day') ? t.format('HH:mm') : t.format('D MMM HH:mm')
}

const range = computed(() => `${fmt(props.start)} – ${fmt(props.end)}`)
const minutes = computed(() => Math.round((props.end.valueOf() - props.start.valueOf()) / 60000))
const label = computed(() => {
  const h = Math.floor(minutes.value / 60)
  const m = minutes.value % 60
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}m`
})
</script>

<template>
  <li>
    <button
      type="button"
      class="flex w-full items-start gap-3 border-2 border-dashed border-slate-200 px-3 py-3 text-left transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800/50"
      @click="emit('add', { start_time: start.toISOString(), end_time: end.toISOString() })"
    >
      <ActivityIcon :activity="placeholder" />
      <span class="min-w-0 flex-1">
        <span class="flex items-baseline justify-between gap-2">
          <span class="font-medium text-slate-500 dark:text-slate-400">No record</span>
          <span class="shrink-0 text-sm font-semibold tabular-nums text-slate-500 dark:text-slate-400">{{ label }}</span>
        </span>
        <span class="block text-sm text-slate-400 tabular-nums dark:text-slate-500">{{ range }}</span>
      </span>
    </button>
  </li>
</template>
