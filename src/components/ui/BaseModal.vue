<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'

defineProps({ title: { type: String, required: true } })
const emit = defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-40 flex items-end justify-center bg-black/40 sm:items-center" @click.self="emit('close')">
      <div
        class="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl sm:rounded-2xl dark:bg-slate-900"
      >
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-lg font-semibold">{{ title }}</h2>
          <button
            type="button"
            class="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Close"
            @click="emit('close')"
          >
            <BaseIcon name="x" size="md" />
          </button>
        </div>
        <slot />
      </div>
    </div>
  </Teleport>
</template>
