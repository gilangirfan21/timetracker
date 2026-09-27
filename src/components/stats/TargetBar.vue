<script setup>
import { computed } from 'vue'
import { formatHours } from '@/lib/time'

const HOUR = 3600_000

const props = defineProps({
  value: { type: Number, required: true },
  minMs: { type: Number, required: true },
  maxMs: { type: Number, required: true },
  label: { type: String, default: '' },
  compact: { type: Boolean, default: false },
})

// Leave one hour of headroom past the maximum so overtime is visible.
const scale = computed(() => props.maxMs + HOUR)
const pct = (ms) => `${Math.min(100, (ms / scale.value) * 100)}%`

const status = computed(() => {
  if (props.value < props.minMs) return { text: 'Under target', bar: 'bg-amber-500', fg: 'text-amber-600 dark:text-amber-400' }
  if (props.value <= props.maxMs) return { text: 'On target', bar: 'bg-emerald-500', fg: 'text-emerald-600 dark:text-emerald-400' }
  return { text: 'Overtime', bar: 'bg-rose-500', fg: 'text-rose-600 dark:text-rose-400' }
})
</script>

<template>
  <div>
    <div class="mb-1 flex items-baseline justify-between gap-2 text-sm">
      <span v-if="label" class="text-slate-600 dark:text-slate-300">{{ label }}</span>
      <span class="ml-auto font-semibold tabular-nums" :class="status.fg">
        {{ formatHours(value) }}<span v-if="!compact" class="font-normal"> · {{ status.text }}</span>
      </span>
    </div>
    <div class="relative rounded-full bg-slate-200 dark:bg-slate-800" :class="compact ? 'h-2' : 'h-3'">
      <div class="h-full rounded-full transition-all" :class="status.bar" :style="{ width: pct(value) }" />
      <!-- min and max markers -->
      <div class="absolute inset-y-0 w-px bg-slate-500/60" :style="{ left: pct(minMs) }" />
      <div class="absolute inset-y-0 w-px bg-slate-500/60" :style="{ left: pct(maxMs) }" />
    </div>
  </div>
</template>
