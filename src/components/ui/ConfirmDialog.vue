<script setup>
defineProps({
  title: { type: String, required: true },
  message: { type: String, default: '' },
  confirmText: { type: String, default: 'Confirm' },
})
const emit = defineEmits(['confirm', 'cancel'])
</script>

<template>
  <Teleport to="body">
    <!-- Sits above any modal already open (e.g. the edit sheet behind it). -->
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="emit('cancel')"
    >
      <div class="w-full max-w-xs rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900">
        <h2 class="text-lg font-semibold">{{ title }}</h2>
        <p v-if="message" class="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{{ message }}</p>
        <div class="mt-5 flex gap-2">
          <button type="button" class="btn-secondary flex-1" @click="emit('cancel')">Cancel</button>
          <button
            type="button"
            class="flex-1 rounded-xl bg-red-600 px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-400"
            @click="emit('confirm')"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
