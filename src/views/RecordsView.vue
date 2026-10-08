<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import DateNav from '@/components/DateNav.vue'
import FloatingAddButton from '@/components/FloatingAddButton.vue'
import BaseIcon from '@/components/icons/BaseIcon.vue'
import PageHeader from '@/components/PageHeader.vue'
import RecordForm from '@/components/RecordForm.vue'
import RecordGap from '@/components/RecordGap.vue'
import RecordItem from '@/components/RecordItem.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { useWorkTarget } from '@/composables/useWorkTarget'
import { formatHours, local, minuteMs, overlapMs } from '@/lib/time'
import { useActivitiesStore } from '@/stores/activities'
import { useDaysOffStore } from '@/stores/daysOff'
import { useRecordsStore } from '@/stores/records'

const activities = useActivitiesStore()
const recordsStore = useRecordsStore()
const daysOffStore = useDaysOffStore()
const work = useWorkTarget()

const SORT_KEY = 'recordsSortDesc'

const day = ref(local().startOf('day'))
const records = ref([])
const isDayOff = ref(false)
const togglingDayOff = ref(false)
const loading = ref(true)
const error = ref('')
const sortDesc = ref(readSortDesc())
// null = closed; { id, ... } = editing; { start_time, end_time } = new
const editing = ref(null)

function readSortDesc() {
  try {
    const saved = localStorage.getItem(SORT_KEY)
    return saved === null ? true : saved === 'true'
  } catch {
    return true
  }
}

watch(sortDesc, (value) => {
  try {
    localStorage.setItem(SORT_KEY, value)
  } catch {
    // storage unavailable — preference lasts for this session only
  }
})

const dayEnd = computed(() => day.value.add(1, 'day'))
const isToday = computed(() => day.value.isSame(local(), 'day'))

const label = computed(() => {
  if (isToday.value) return 'Today'
  if (day.value.isSame(local().subtract(1, 'day'), 'day')) return 'Yesterday'
  return day.value.format('ddd, D MMM')
})

// Work target status for this day; only shown once a work activity is set up.
const showWorkStatus = computed(() => !!work.settings.value.activityId)
const isScheduled = computed(() => work.settings.value.workdays.includes(day.value.isoWeekday()))

async function loadDayOff() {
  try {
    isDayOff.value = (await daysOffStore.listRange(day.value, dayEnd.value)).size > 0
  } catch (e) {
    isDayOff.value = false
    error.value ||= `Couldn’t load days off: ${e.message}`
  }
}

async function toggleDayOff() {
  togglingDayOff.value = true
  try {
    if (isDayOff.value) await daysOffStore.remove(day.value)
    else await daysOffStore.add(day.value)
    isDayOff.value = !isDayOff.value
  } catch (e) {
    error.value = e.message
  } finally {
    togglingDayOff.value = false
  }
}

// Only the part inside this day counts (records crossing midnight are split).
const total = computed(() => records.value.reduce((sum, r) => sum + overlapMs(r, day.value, dayEnd.value), 0))

// Below this, an untracked gap wouldn't be worth a row (rounding noise).
const MIN_GAP_MS = 60_000

// Records plus the untracked gaps between them (and before/after), in one
// chronological timeline so nothing recorded stays invisible. Concurrent
// (overlapping) activities are handled by tracking the furthest point covered
// so far rather than assuming the previous record's end is the gap start.
const timeline = computed(() => {
  const boundaryEnd = isToday.value ? local().startOf('minute') : dayEnd.value
  const boundaryEnd = isToday.value ? local().startOf('minute') : dayEnd.value
  const clipped = records.value
    .map((r) => ({
      record: r,
      start: local(Math.max(minuteMs(r.start_time), day.value.valueOf())),
      end: local(Math.min(minuteMs(r.end_time), dayEnd.value.valueOf())),
      start: local(Math.max(minuteMs(r.start_time), day.value.valueOf())),
      end: local(Math.min(minuteMs(r.end_time), dayEnd.value.valueOf())),
    }))
    .sort((a, b) => a.start.valueOf() - b.start.valueOf())

  const items = []
  let cursor = day.value
  for (const c of clipped) {
    if (c.start.valueOf() - cursor.valueOf() > MIN_GAP_MS) items.push({ kind: 'gap', start: cursor, end: c.start })
    items.push({ kind: 'record', record: c.record })
    if (c.end.valueOf() > cursor.valueOf()) cursor = c.end
  }
  if (boundaryEnd.valueOf() - cursor.valueOf() > MIN_GAP_MS) items.push({ kind: 'gap', start: cursor, end: boundaryEnd })

  return sortDesc.value ? items.reverse() : items
})

// Pickable in the form: active ones, plus the edited record's activity if archived.
const formActivities = computed(() =>
  activities.items.filter((a) => !a.archived || a.id === editing.value?.activity_type_id),
)

async function load() {
  loading.value = true
  error.value = ''
  const dayOff = loadDayOff()
  try {
    records.value = await recordsStore.listRange(day.value, dayEnd.value)
  } catch (e) {
    error.value = e.message
  } finally {
    await dayOff
    loading.value = false
  }
}

onMounted(() => {
  activities.load().catch((e) => (error.value = e.message))
  load()
})
watch(day, load)

async function openNew() {
  // Default: now (today) or 10:00 on that day, ending an hour before.
  const end = isToday.value ? local().startOf('minute') : day.value.hour(10)
  let start = end.subtract(1, 'hour')

  // Today: prefer continuing right where the last recorded activity left off,
  // so the gap in between (untracked time) doesn't go unlogged.
  if (isToday.value) {
    try {
      const lastEnd = await recordsStore.latestEnd()
      if (lastEnd && local(lastEnd).isBefore(end)) start = local(lastEnd)
    } catch {
      // suggestion is optional — fall back to the default above
    }
  }

  editing.value = { start_time: start.toISOString(), end_time: end.toISOString() }
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
  <PageHeader title="Records" />

  <!-- Extra bottom padding so the last record isn't hidden behind the floating button. -->
  <div class="space-y-4 px-4 pb-20">
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

    <div v-if="showWorkStatus" class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
      <BaseIcon name="briefcase" size="sm" />
      <span class="flex-1">
        {{ !isScheduled ? 'Not a work day — no target' : isDayOff ? 'Day off — no work target' : 'Work day' }}
      </span>
      <button
        v-if="isScheduled"
        type="button"
        class="font-medium text-indigo-600 disabled:opacity-50 dark:text-indigo-400"
        :disabled="togglingDayOff"
        @click="toggleDayOff"
      >
        {{ isDayOff ? 'Undo day off' : 'Mark as day off' }}
      </button>
    </div>

    <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    <p v-if="loading" class="text-slate-500 dark:text-slate-400">Loading…</p>
    <p v-else-if="!timeline.length" class="py-8 text-center text-slate-500 dark:text-slate-400">
      No records this day.
    </p>
    <template v-else>
      <button
        type="button"
        class="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
        @click="sortDesc = !sortDesc"
      >
        <BaseIcon name="arrows-up-down" size="sm" />
        {{ sortDesc ? 'Newest first' : 'Oldest first' }}
      </button>
      <ul
        class="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900"
      >
        <template
          v-for="item in timeline"
          :key="item.kind === 'record' ? item.record.id : `gap-${item.start.valueOf()}`"
        >
          <RecordItem
            v-if="item.kind === 'record'"
            :record="item.record"
            :activity="activities.byId[item.record.activity_type_id]"
            :day="day"
            @edit="editing = item.record"
          />
          <RecordGap v-else :start="item.start" :end="item.end" :day="day" @add="editing = $event" />
        </template>
      </ul>
    </template>
  </div>

  <FloatingAddButton label="Add record" @click="openNew" />

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
