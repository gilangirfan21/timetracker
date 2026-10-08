<script setup>
import { computed, reactive } from 'vue'
import BaseCheckbox from '@/components/ui/BaseCheckbox.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import { useActivitiesStore } from '@/stores/activities'
import { useCoupleTarget } from '@/composables/useCoupleTarget'
import { useWorkTarget } from '@/composables/useWorkTarget'

const emit = defineEmits(['done'])
const activities = useActivitiesStore()
const work = useWorkTarget()
const couple = useCoupleTarget()

const workOptions = computed(() => [
  { value: '', label: 'None' },
  ...activities.active.map((a) => ({ value: a.id, label: a.name })),
])

const form = reactive({
  work: { ...work.settings.value, workdays: [...work.settings.value.workdays] },
  couple: { ...couple.settings.value },
})

// ISO weekday numbers, Monday first.
const WEEKDAYS = [
  [1, 'Mon'],
  [2, 'Tue'],
  [3, 'Wed'],
  [4, 'Thu'],
  [5, 'Fri'],
  [6, 'Sat'],
  [7, 'Sun'],
]

function toggleWorkday(n) {
  const days = form.work.workdays
  form.work.workdays = days.includes(n) ? days.filter((d) => d !== n) : [...days, n].sort()
}

const workError = computed(() => {
  if (!(form.work.min > 0)) return 'Minimum must be more than 0.'
  if (!(form.work.max >= form.work.min)) return 'Maximum must be at least the minimum.'
  if (form.work.max > 24) return 'Maximum can’t be more than 24h.'
  return ''
})

const coupleError = computed(() => {
  if (!form.couple.enabled) return ''
  if (!(form.couple.min > 0)) return 'Minimum must be more than 0.'
  if (!(form.couple.max >= form.couple.min)) return 'Maximum must be at least the minimum.'
  if (form.couple.max > 24) return 'Maximum can’t be more than 24h.'
  return ''
})

const error = computed(() => workError.value || coupleError.value)

function submit() {
  if (error.value) return
  work.save(form.work)
  couple.save(form.couple)
  emit('done')
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="submit">
    <section class="space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold">Work time</h3>
        <BaseCheckbox v-model="form.work.visible">Show on Stats</BaseCheckbox>
      </div>

      <div>
        <span class="label">Activity</span>
        <BaseSelect v-model="form.work.activityId" :options="workOptions" />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <label>
          <span class="label">Minimum (hours)</span>
          <input v-model.number="form.work.min" type="number" inputmode="decimal" min="0.5" max="24" step="0.5" class="field" />
        </label>
        <label>
          <span class="label">Maximum (hours)</span>
          <input v-model.number="form.work.max" type="number" inputmode="decimal" min="0.5" max="24" step="0.5" class="field" />
        </label>
      </div>

      <div>
        <span class="label">Work days</span>
        <div class="grid grid-cols-7 gap-1.5">
          <button
            v-for="[n, name] in WEEKDAYS"
            :key="n"
            type="button"
            class="rounded-lg py-2 text-sm font-medium transition-colors"
            :class="
              form.work.workdays.includes(n)
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            "
            :aria-pressed="form.work.workdays.includes(n)"
            @click="toggleWorkday(n)"
          >
            {{ name }}
          </button>
        </div>
        <p class="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          Other days, and days marked off in Stats, have no target.
        </p>
      </div>
      <p v-if="workError" class="text-sm text-red-600 dark:text-red-400">{{ workError }}</p>
    </section>

    <section class="space-y-3 border-t border-slate-200 pt-5 dark:border-slate-800">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold">Couple time</h3>
        <BaseCheckbox v-model="form.couple.visible">Show on Stats</BaseCheckbox>
      </div>

      <BaseCheckbox v-model="form.couple.enabled">Set a daily target</BaseCheckbox>

      <div v-if="form.couple.enabled" class="grid grid-cols-2 gap-3">
        <label>
          <span class="label">Minimum (hours)</span>
          <input v-model.number="form.couple.min" type="number" inputmode="decimal" min="0.5" max="24" step="0.5" class="field" />
        </label>
        <label>
          <span class="label">Maximum (hours)</span>
          <input v-model.number="form.couple.max" type="number" inputmode="decimal" min="0.5" max="24" step="0.5" class="field" />
        </label>
      </div>
      <p v-if="coupleError" class="text-sm text-red-600 dark:text-red-400">{{ coupleError }}</p>
    </section>

    <div class="flex gap-2 pt-2">
      <button type="button" class="btn-secondary flex-1" @click="emit('done')">Cancel</button>
      <button type="submit" class="btn-primary flex-1" :disabled="!!error">Save</button>
    </div>
  </form>
</template>
