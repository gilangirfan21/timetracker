<script setup>
import ActivityIcon from '@/components/ActivityIcon.vue'
import RunningDuration from '@/components/RunningDuration.vue'

defineProps({
  activity: { type: Object, required: true },
  running: { type: Object, default: null },
  busy: { type: Boolean, default: false },
})
const emit = defineEmits(['tap'])
</script>

<template>
  <button
    type="button"
    class="flex min-h-28 flex-col items-start justify-between gap-2 rounded-2xl border p-3 text-left transition active:scale-[0.97] disabled:opacity-60"
    :class="
      running
        ? 'border-transparent text-white shadow-md'
        : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
    "
    :style="running ? { backgroundColor: activity.color } : null"
    :disabled="busy"
    @click="emit('tap')"
  >
    <ActivityIcon :activity="activity" :inverted="!!running" />

    <span class="w-full">
      <span class="block truncate font-semibold">{{ activity.name }}</span>
      <template v-if="running">
        <RunningDuration :start-time="running.start_time" class="text-lg" />
        <span v-if="running.tags?.length" class="block truncate text-xs text-white/80">
          {{ running.tags.join(', ') }}
        </span>
      </template>
    </span>
  </button>
</template>
