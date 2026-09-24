<script setup>
import { computed } from 'vue'
import DatePicker from '@/components/ui/DatePicker.vue'
import TimePicker from '@/components/ui/TimePicker.vue'
import { local } from '@/lib/time'

// v-model is an ISO timestamp; seconds are kept unless the time is changed.
const model = defineModel({ type: String, required: true })
const value = computed(() => local(model.value))

function setDate(day) {
  const v = value.value
  model.value = day.hour(v.hour()).minute(v.minute()).second(v.second()).millisecond(0).toISOString()
}

function setTime({ hour, minute }) {
  model.value = value.value.hour(hour).minute(minute).second(0).millisecond(0).toISOString()
}
</script>

<template>
  <div class="grid grid-cols-[1fr_7.5rem] gap-2">
    <DatePicker :value="value" @pick="setDate" />
    <TimePicker :value="value" @pick="setTime" />
  </div>
</template>
