<script setup>
import { computed } from 'vue'
import DatePicker from '@/components/ui/DatePicker.vue'
import TimePicker from '@/components/ui/TimePicker.vue'
import { local } from '@/lib/time'

// v-model is an ISO timestamp; seconds are kept unless the time is changed.
const model = defineModel({ type: String, required: true })
// Shows a row of quick minute-adjust chips (-30/-5/-1/+1/+5/+30) plus "Now" below the fields.
defineProps({ quickAdjust: { type: Boolean, default: false } })

const STEPS = [-30, -5, -1, 1, 5, 30]

const value = computed(() => local(model.value))

function setDate(day) {
  const v = value.value
  model.value = day.hour(v.hour()).minute(v.minute()).second(v.second()).millisecond(0).toISOString()
}

function setTime({ hour, minute }) {
  model.value = value.value.hour(hour).minute(minute).second(0).millisecond(0).toISOString()
}

function adjust(minutes) {
  model.value = value.value.add(minutes, 'minute').toISOString()
}

function setNow() {
  model.value = local().second(0).millisecond(0).toISOString()
}
</script>

<template>
  <div>
    <div class="grid grid-cols-[1fr_7.5rem] gap-2">
      <DatePicker :value="value" @pick="setDate" />
      <TimePicker :value="value" @pick="setTime" />
    </div>
    <div v-if="quickAdjust" class="mt-1.5 flex flex-wrap gap-1.5">
      <button
        v-for="step in STEPS"
        :key="step"
        type="button"
        class="rounded-full border border-slate-300 px-2.5 py-1 text-xs font-medium tabular-nums text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        @click="adjust(step)"
      >
        {{ step > 0 ? `+${step}` : step }}
      </button>
      <button
        type="button"
        class="rounded-full border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        @click="setNow"
      >
        Now
      </button>
    </div>
  </div>
</template>
