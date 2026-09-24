<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'

defineProps({
  label: { type: String, required: true },
  sublabel: { type: String, default: '' },
  canNext: { type: Boolean, default: true },
})
const emit = defineEmits(['prev', 'next', 'reset'])
</script>

<template>
  <div class="flex items-center justify-between gap-2">
    <button type="button" class="icon-btn" aria-label="Previous" @click="emit('prev')">
      <BaseIcon name="chevron-left" size="md" />
    </button>
    <button type="button" class="min-w-0 flex-1 text-center" @click="emit('reset')">
      <span class="block truncate font-semibold">{{ label }}</span>
      <span v-if="sublabel" class="block truncate text-xs text-slate-500 dark:text-slate-400">{{ sublabel }}</span>
    </button>
    <button
      type="button"
      class="icon-btn disabled:opacity-30 disabled:hover:bg-transparent"
      aria-label="Next"
      :disabled="!canNext"
      @click="emit('next')"
    >
      <BaseIcon name="chevron-right" size="md" />
    </button>
  </div>
</template>
