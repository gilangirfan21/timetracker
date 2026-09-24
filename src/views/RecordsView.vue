<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import DateNav from '@/components/DateNav.vue'
import BaseIcon from '@/components/icons/BaseIcon.vue'
import PageHeader from '@/components/PageHeader.vue'
import RecordForm from '@/components/RecordForm.vue'
import RecordItem from '@/components/RecordItem.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { formatHours, local, overlapMs } from '@/lib/time'
import { useActivitiesStore } from '@/stores/activities'
import { useRecordsStore } from '@/stores/records'

const activities = useActivitiesStore()
const recordsStore = useRecordsStore()

const day = ref(local().startOf('day'))
const records = ref([])
const loading = ref(true)
const error = ref('')
// null = closed; { id, ... } = editing; { start_time, end_time } = new
const editing = ref(null)

const dayEnd = computed(() => day.value.add(1, 'day'))
const isToday = computed(() => day.value.isSame(local(), 'day'))

const label = computed(() => {
  if (isToday.value) return 'Today'
  if (day.value.isSame(local().subtract(1, 'day'), 'day')) return 'Yesterday'
  return day.value.format('ddd, D MMM')
})

// Only the part inside this day counts (records crossing midnight are split).
const total = computed(() => records.value.reduce((sum, r) => sum + overlapMs(r, day.value, dayEnd.value), 0))

// Pickable in the form: active ones, plus the edited record's activity if archived.
const formActivities = computed(() =>
  activities.items.filter((a) => !a.archived || a.id === editing.value?.activity_type_id),
)

async function load() {
  loading.value = true
  error.value = ''
  try {
    records.value = await recordsStore.listRange(day.value, dayEnd.value)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  activities.load().catch((e) => (error.value = e.message))
  load()
})
watch(day, load)

function openNew() {
  // Default: the last hour if today, otherwise 09:00–10:00 on that day.
  const end = isToday.value ? local().startOf('minute') : day.value.hour(10)
  editing.value = { start_time: end.subtract(1, 'hour').toISOString(), end_time: end.toISOString() }
}

async function save(payload) {
  if (editing.value.id) await recordsStore.update(editing.value.id, payload)
  else await recordsStore.create(payload)
  editing.value = null
  await load()
}

async function remove() {
  await recordsStore.remove(editing.value.id)
  editing.value = null
  await load()
}
</script>

<template>
  <PageHeader title="Records">
    <button type="button" class="icon-btn" aria-label="Add record" @click="openNew">
      <BaseIcon name="plus" size="md" />
    </button>
  </PageHeader>

  <div class="space-y-4 px-4">
    <DateNav
      :label="label"
      :sublabel="isToday ? day.format('ddd, D MMM') : 'Tap to go to today'"
      :can-next="!isToday"
      @prev="day = day.subtract(1, 'day')"
      @next="day = day.add(1, 'day')"
      @reset="day = local().startOf('day')"
    />

    <div
      class="flex items-center justify-between rounded-2xl bg-indigo-50 px-4 py-3 dark:bg-indigo-500/10"
    >
      <span class="text-sm font-medium text-indigo-700 dark:text-indigo-300">Total</span>
      <span class="text-lg font-bold text-indigo-700 tabular-nums dark:text-indigo-300">{{ formatHours(total) }}</span>
    </div>

    <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    <p v-if="loading" class="text-slate-500 dark:text-slate-400">Loading…</p>
    <p v-else-if="!records.length" class="py-8 text-center text-slate-500 dark:text-slate-400">
      No records this day.
    </p>
    <ul
      v-else
      class="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900"
    >
      <RecordItem
        v-for="r in records"
        :key="r.id"
        :record="r"
        :activity="activities.byId[r.activity_type_id]"
        :day="day"
        @edit="editing = r"
      />
    </ul>
  </div>

  <BaseModal v-if="editing" :title="editing.id ? 'Edit record' : 'Add record'" @close="editing = null">
    <RecordForm
      :record="editing"
      :activities="formActivities"
      :save="save"
      :remove="editing.id ? remove : null"
      @cancel="editing = null"
    />
  </BaseModal>
</template>
