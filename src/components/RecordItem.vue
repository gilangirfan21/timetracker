<script setup>
import { computed } from 'vue'
import ActivityIcon from '@/components/ActivityIcon.vue'
import { durationMs, formatHours, local } from '@/lib/time'

const props = defineProps({
  record: { type: Object, required: true },
  activity: { type: Object, default: null },
  // Day being viewed; times on another day get a date prefix.
  day: { type: Object, required: true },
})
const emit = defineEmits(['edit'])

const fallback = { name: 'Deleted activity', color: '#94a3b8', icon: '?' }

function fmt(ts) {
  const t = local(ts)
  return t.isSame(props.day, 'day') ? t.format('HH:mm') : t.format('D MMM HH:mm')
}

const range = computed(() => `${fmt(props.record.start_time)} – ${fmt(props.record.end_time)}`)
</script>

<template>
  <li>
    <button type="button" class="flex w-full items-start gap-3 px-3 py-3 text-left" @click="emit('edit')">
      <ActivityIcon :activity="activity ?? fallback" />
      <span class="min-w-0 flex-1">
        <span class="flex items-baseline justify-between gap-2">
          <span class="truncate font-medium">{{ (activity ?? fallback).name }}</span>
          <span class="shrink-0 text-sm font-semibold tabular-nums">{{ formatHours(durationMs(record)) }}</span>
        </span>
        <span class="block text-sm text-slate-500 tabular-nums dark:text-slate-400">{{ range }}</span>
        <span v-if="record.tags?.length" class="mt-1 flex flex-wrap gap-1">
          <span
            v-for="tag in record.tags"
            :key="tag"
            class="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
          >
            {{ tag }}
          </span>
        </span>
        <span v-if="record.note" class="mt-1 block text-sm text-slate-600 dark:text-slate-300">{{ record.note }}</span>
      </span>
    </button>
  </li>
</template>
