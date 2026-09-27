<script setup>
import { computed, reactive } from 'vue'
import { useActivitiesStore } from '@/stores/activities'
import { useCoupleTarget } from '@/composables/useCoupleTarget'
import { useWorkTarget } from '@/composables/useWorkTarget'

const emit = defineEmits(['done'])
const activities = useActivitiesStore()
const work = useWorkTarget()
const couple = useCoupleTarget()

const workOptions = computed(() => activities.active.map((a) => ({ value: a.id, label: a.name })))

const form = reactive({
  work: { ...work.settings.value },
  couple: { ...couple.settings.value },
})

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
        <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input v-model="form.work.visible" type="checkbox" class="h-4 w-4 rounded" />
          Show on Stats
        </label>
      </div>

      <label class="block">
        <span class="label">Activity</span>
        <select v-model="form.work.activityId" class="field">
          <option value="">None</option>
          <option v-for="o in workOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
        </select>
      </label>

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
      <p v-if="workError" class="text-sm text-red-600 dark:text-red-400">{{ workError }}</p>
    </section>

    <section class="space-y-3 border-t border-slate-200 pt-5 dark:border-slate-800">
      <div class="flex items-center justify-between">
        <h3 class="font-semibold">Couple time</h3>
        <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input v-model="form.couple.visible" type="checkbox" class="h-4 w-4 rounded" />
          Show on Stats
        </label>
      </div>

      <label class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
        <input v-model="form.couple.enabled" type="checkbox" class="h-4 w-4 rounded" />
        Set a daily target
      </label>

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
