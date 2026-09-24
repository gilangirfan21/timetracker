<script setup>
import { computed } from 'vue'
import { ACTIVITY_ICONS } from '@/lib/activityIcons'

const props = defineProps({
  activity: { type: Object, required: true },
  size: { type: String, default: 'md' },
  // White on translucent white, for use on a solid colored background.
  inverted: { type: Boolean, default: false },
})

const sizeClasses = {
  sm: 'h-8 w-8 text-base',
  md: 'h-10 w-10 text-xl',
  lg: 'h-12 w-12 text-2xl',
}
const svgSizes = { sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' }

const paths = computed(() => ACTIVITY_ICONS[props.activity.icon])
const text = computed(() => props.activity.icon || props.activity.name.charAt(0).toUpperCase())
const style = computed(() =>
  props.inverted ? null : { backgroundColor: `${props.activity.color}26`, color: props.activity.color },
)
</script>

<template>
  <span
    class="flex shrink-0 items-center justify-center rounded-full font-semibold"
    :class="[sizeClasses[size], { 'bg-white/20 text-white': inverted }]"
    :style="style"
  >
    <svg
      v-if="paths"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      :class="svgSizes[size]"
      aria-hidden="true"
    >
      <path v-for="d in paths" :key="d" :d="d" />
    </svg>
    <template v-else>{{ text }}</template>
  </span>
</template>
