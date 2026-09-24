<script setup>
import { computed, reactive, ref } from 'vue'
import ActivityIcon from '@/components/ActivityIcon.vue'
import { ACTIVITY_ICONS } from '@/lib/activityIcons'

const props = defineProps({
  activity: { type: Object, default: null },
  save: { type: Function, required: true },
})
const emit = defineEmits(['cancel'])

const COLORS = [
  '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#84cc16',
  '#f59e0b', '#f97316', '#ef4444', '#ec4899', '#8b5cf6',
]

const form = reactive({
  name: props.activity?.name ?? '',
  icon: props.activity?.icon ?? '',
  color: props.activity?.color ?? COLORS[0],
})
const ICON_NAMES = Object.keys(ACTIVITY_ICONS)

// Emoji box shows only a custom (non-icon) value; typing one replaces the picked icon.
const emoji = computed({
  get: () => (ACTIVITY_ICONS[form.icon] ? '' : form.icon),
  set: (value) => (form.icon = value),
})

const saving = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  saving.value = true
  try {
    await props.save({ name: form.name.trim(), icon: form.icon.trim() || null, color: form.color })
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <form class="space-y-4" @submit.prevent="submit">
    <div class="flex items-center gap-3">
      <ActivityIcon :activity="{ ...form, name: form.name || '?' }" size="lg" />
      <input v-model="form.name" class="field" placeholder="Name" required maxlength="40" />
    </div>

    <div>
      <span class="label">Icon</span>
      <div class="grid grid-cols-6 gap-2">
        <button
          type="button"
          class="flex aspect-square items-center justify-center rounded-xl border text-sm font-semibold transition-colors"
          :class="
            !form.icon
              ? 'border-transparent'
              : 'border-slate-200 text-slate-400 dark:border-slate-800 dark:text-slate-500'
          "
          :style="!form.icon ? { backgroundColor: form.color, color: '#fff' } : null"
          aria-label="No icon (use first letter)"
          @click="form.icon = ''"
        >
          {{ form.name.charAt(0).toUpperCase() || 'Aa' }}
        </button>
        <button
          v-for="name in ICON_NAMES"
          :key="name"
          type="button"
          class="flex aspect-square items-center justify-center rounded-xl border transition-colors"
          :class="
            form.icon === name
              ? 'border-transparent text-white'
              : 'border-slate-200 text-slate-500 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800'
          "
          :style="form.icon === name ? { backgroundColor: form.color } : null"
          :aria-label="name"
          :title="name"
          @click="form.icon = name"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="h-6 w-6"
            aria-hidden="true"
          >
            <path v-for="d in ACTIVITY_ICONS[name]" :key="d" :d="d" />
          </svg>
        </button>
      </div>
      <input
        v-model="emoji"
        class="field mt-2 !py-2"
        placeholder="…or type an emoji"
        maxlength="4"
        aria-label="Emoji icon"
      />
    </div>

    <div>
      <span class="label">Color</span>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="c in COLORS"
          :key="c"
          type="button"
          class="h-9 w-9 rounded-full ring-offset-2 ring-offset-white dark:ring-offset-slate-900"
          :class="{ 'ring-2 ring-slate-900 dark:ring-white': form.color === c }"
          :style="{ backgroundColor: c }"
          :aria-label="c"
          @click="form.color = c"
        />
        <input
          v-model="form.color"
          type="color"
          class="h-9 w-9 cursor-pointer rounded-full border border-slate-300 bg-transparent dark:border-slate-700"
          aria-label="Custom color"
        />
      </div>
    </div>

    <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>

    <div class="flex gap-2 pt-2">
      <button type="button" class="btn-secondary flex-1" @click="emit('cancel')">Cancel</button>
      <button type="submit" class="btn-primary flex-1" :disabled="saving || !form.name.trim()">
        {{ saving ? 'Saving…' : 'Save' }}
      </button>
    </div>
  </form>
</template>
