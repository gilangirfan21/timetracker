<script setup>
import { useDuration } from '@/composables/useDuration'

const props = defineProps({ startTime: { type: String, required: true } })
const duration = useDuration(() => props.startTime)
</script>

<template>
  <span class="font-mono tabular-nums">{{ duration }}</span>
</template>
