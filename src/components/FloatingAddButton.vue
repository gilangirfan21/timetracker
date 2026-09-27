<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'

defineProps({ label: { type: String, required: true } })
defineEmits(['click'])
</script>

<template>
  <!-- Aligned to the centered app column, floating just above the bottom nav. -->
  <div
    class="pointer-events-none fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-30 mx-auto flex max-w-md justify-end px-4"
  >
    <button
      type="button"
      class="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-700 active:scale-95 dark:bg-indigo-500 dark:shadow-indigo-500/20 dark:hover:bg-indigo-400"
      :aria-label="label"
      @click="$emit('click')"
    >
      <BaseIcon name="plus" size="lg" />
    </button>
  </div>
</template>
