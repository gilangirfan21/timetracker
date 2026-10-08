<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import ActivityIcon from '@/components/ActivityIcon.vue'
import DateNav from '@/components/DateNav.vue'
import BaseIcon from '@/components/icons/BaseIcon.vue'
import PageHeader from '@/components/PageHeader.vue'
import DonutChart from '@/components/stats/DonutChart.vue'
import StatsSettingsForm from '@/components/stats/StatsSettingsForm.vue'
import TargetBar from '@/components/stats/TargetBar.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import { useCoupleTarget } from '@/composables/useCoupleTarget'
import { useWorkTarget } from '@/composables/useWorkTarget'
import { COUPLE_TAG, hasTag } from '@/lib/tags'
import { formatHours, local, overlapMs } from '@/lib/time'
import { useActivitiesStore } from '@/stores/activities'
import { useDaysOffStore } from '@/stores/daysOff'
import { useRecordsStore } from '@/stores/records'

const RANGES = ['day', 'week', 'month']

const activities = useActivitiesStore()
const recordsStore = useRecordsStore()
const daysOffStore = useDaysOffStore()
const work = useWorkTarget()
const couple = useCoupleTarget()

const range = ref('day')
const anchor = ref(local())
const records = ref([])
const daysOff = ref(new Set())
const loading = ref(true)
const error = ref('')
const showSettings = ref(false)

// Weeks start on Monday.
const unit = computed(() => (range.value === 'week' ? 'isoWeek' : range.value))
const from = computed(() => anchor.value.startOf(unit.value))
const to = computed(() => from.value.add(1, range.value))
const isCurrent = computed(() => to.value.valueOf() > Date.now())

const label = computed(() => {
  if (range.value === 'day') return isCurrent.value ? 'Today' : from.value.format('ddd, D MMM YYYY')
  if (range.value === 'week') return `${from.value.format('D MMM')} – ${to.value.subtract(1, 'day').format('D MMM')}`
  return from.value.format('MMMM YYYY')
})

// Days in range, up to today (no empty future days).
const days = computed(() => {
  const list = []
  for (let d = from.value; d.isBefore(to.value) && d.valueOf() <= Date.now(); d = d.add(1, 'day')) list.push(d)
  return list
})

function sum(list, start, end) {
  return list.reduce((total, r) => total + overlapMs(r, start, end), 0)
}

const total = computed(() => sum(records.value, from.value, to.value))

const perActivity = computed(() => {
  const totals = {}
  for (const r of records.value) {
    totals[r.activity_type_id] = (totals[r.activity_type_id] ?? 0) + overlapMs(r, from.value, to.value)
  }
  return Object.entries(totals)
    .map(([id, value]) => {
      const a = activities.byId[id] ?? { id, name: 'Deleted activity', color: '#94a3b8', icon: '?' }
      return { activity: a, label: a.name, color: a.color, value }
    })
    .filter((i) => i.value > 0)
    .sort((a, b) => b.value - a.value)
})

const coupleRecords = computed(() => records.value.filter((r) => hasTag(r, COUPLE_TAG)))
const coupleTotal = computed(() => sum(coupleRecords.value, from.value, to.value))
const coupleDays = computed(() =>
  days.value.map((d) => ({ day: d, value: sum(coupleRecords.value, d, d.add(1, 'day')) })),
)

const workActivityId = computed(() => work.settings.value.activityId)
const workRecords = computed(() => records.value.filter((r) => r.activity_type_id === workActivityId.value))
const workDays = computed(() =>
  days.value.map((d) => ({
    day: d,
    value: sum(workRecords.value, d, d.add(1, 'day')),
    workday: work.isWorkday(d, daysOff.value),
  })),
)
const workedDays = computed(() => workDays.value.filter((d) => d.value > 0))
// Days off have no target, so they don't count towards (or against) it.
const targetDays = computed(() => workedDays.value.filter((d) => d.workday))
const onTargetCount = computed(
  () => targetDays.value.filter((d) => d.value >= work.minMs.value && d.value <= work.maxMs.value).length,
)
const extraTotal = computed(() =>
  workedDays.value.filter((d) => !d.workday).reduce((total, d) => total + d.value, 0),
)

async function load() {
  loading.value = true
  error.value = ''
  const [recordsResult, daysOffResult] = await Promise.allSettled([
    recordsStore.listRange(from.value, to.value),
    daysOffStore.listRange(from.value, to.value),
  ])
  if (recordsResult.status === 'fulfilled') records.value = recordsResult.value
  else error.value = recordsResult.reason.message
  // Without days off, stats still work — every scheduled weekday just keeps its target.
  if (daysOffResult.status === 'fulfilled') daysOff.value = daysOffResult.value
  else {
    daysOff.value = new Set()
    error.value ||= `Couldn’t load days off: ${daysOffResult.reason.message}`
  }
  loading.value = false
}

// Day view: a scheduled weekday can be marked off (holiday, leave) and back.
const isScheduled = computed(() => work.settings.value.workdays.includes(from.value.isoWeekday()))
const isDayOff = computed(() => daysOff.value.has(from.value.format('YYYY-MM-DD')))
const togglingDayOff = ref(false)

async function toggleDayOff() {
  const day = from.value
  togglingDayOff.value = true
  try {
    if (isDayOff.value) await daysOffStore.remove(day)
    else await daysOffStore.add(day)
    const next = new Set(daysOff.value)
    const key = day.format('YYYY-MM-DD')
    if (next.has(key)) next.delete(key)
    else next.add(key)
    daysOff.value = next
  } catch (e) {
    error.value = e.message
  } finally {
    togglingDayOff.value = false
  }
}

onMounted(async () => {
  try {
    await activities.load()
  } catch (e) {
    error.value = e.message
  }
  work.guessActivity(activities.active)
  load()
})

watch([range, () => from.value.valueOf()], load)

function shift(step) {
  anchor.value = anchor.value.add(step, range.value)
}
</script>

<template>
  <PageHeader title="Stats">
    <button type="button" class="icon-btn" aria-label="Stats settings" @click="showSettings = true">
      <BaseIcon name="cog-6-tooth" size="md" />
    </button>
  </PageHeader>

  <div class="space-y-4 px-4 pb-4">
    <div class="grid grid-cols-3 rounded-xl bg-slate-200/70 p-1 dark:bg-slate-800">
      <button
        v-for="r in RANGES"
        :key="r"
        type="button"
        class="rounded-lg py-2 text-sm font-medium capitalize transition-colors"
        :class="
          range === r
            ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-950 dark:text-slate-100'
            : 'text-slate-500 dark:text-slate-400'
        "
        @click="range = r"
      >
        {{ r }}
      </button>
    </div>

    <DateNav
      :label="label"
      :sublabel="isCurrent ? '' : 'Tap to go to current'"
      :can-next="!isCurrent"
      @prev="shift(-1)"
      @next="shift(1)"
      @reset="anchor = local()"
    />

    <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    <p v-if="loading" class="text-slate-500 dark:text-slate-400">Loading…</p>

    <template v-else>
      <!-- Couple time -->
      <section
        v-if="couple.settings.value.visible"
        class="rounded-2xl bg-rose-50 p-4 dark:bg-rose-500/10"
      >
        <div class="flex items-center gap-3">
          <span class="flex h-11 w-11 items-center justify-center rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <BaseIcon name="heart" size="lg" />
          </span>
          <div class="flex-1">
            <p class="text-sm text-rose-700 dark:text-rose-300">Couple time</p>
            <p class="text-xs text-rose-600/70 dark:text-rose-300/60">tagged “{{ COUPLE_TAG }}”</p>
          </div>
          <div class="text-right">
            <p class="text-xl font-bold text-rose-700 tabular-nums dark:text-rose-300">{{ formatHours(coupleTotal) }}</p>
            <p v-if="range !== 'day' && days.length" class="text-xs text-rose-600/70 dark:text-rose-300/60">
              ~{{ formatHours(coupleTotal / days.length) }}/day
            </p>
          </div>
        </div>

        <div v-if="couple.settings.value.enabled" class="mt-3">
          <TargetBar
            v-if="range === 'day'"
            :value="coupleDays[0]?.value ?? 0"
            :min-ms="couple.minMs.value"
            :max-ms="couple.maxMs.value"
          />
          <div v-else class="space-y-2.5">
            <TargetBar
              v-for="d in coupleDays"
              :key="d.day.valueOf()"
              :value="d.value"
              :min-ms="couple.minMs.value"
              :max-ms="couple.maxMs.value"
              :label="d.day.format('ddd D')"
              compact
            />
          </div>
        </div>
      </section>

      <!-- Work vs target -->
      <section
        v-if="work.settings.value.visible"
        class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="mb-3 flex items-center gap-2">
          <BaseIcon name="briefcase" size="md" class="text-slate-500 dark:text-slate-400" />
          <h2 class="font-semibold">Work time</h2>
          <span class="text-xs text-slate-500 dark:text-slate-400">{{ work.label.value }}</span>
        </div>

        <p v-if="!workActivityId" class="text-sm text-slate-500 dark:text-slate-400">
          Pick a work activity in
          <button type="button" class="font-medium text-indigo-600 dark:text-indigo-400" @click="showSettings = true">
            Stats settings
          </button>.
        </p>
        <template v-else-if="range === 'day'">
          <p v-if="!workDays[0]?.workday && !workDays[0]?.value" class="text-sm text-slate-500 dark:text-slate-400">
            {{ isScheduled ? 'Day off' : 'Not a work day' }} — no target.
          </p>
          <TargetBar
            v-else
            :value="workDays[0]?.value ?? 0"
            :min-ms="work.minMs.value"
            :max-ms="work.maxMs.value"
            :no-target="!workDays[0]?.workday"
          />
          <div
            v-if="isScheduled"
            class="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-sm dark:border-slate-800"
          >
            <span class="text-slate-500 dark:text-slate-400">
              {{ isDayOff ? 'Marked as day off' : 'Holiday or leave?' }}
            </span>
            <button
              type="button"
              class="font-medium text-indigo-600 disabled:opacity-50 dark:text-indigo-400"
              :disabled="togglingDayOff"
              @click="toggleDayOff"
            >
              {{ isDayOff ? 'Undo day off' : 'Mark as day off' }}
            </button>
          </div>
        </template>
        <template v-else>
          <p class="mb-3 text-sm text-slate-500 dark:text-slate-400">
            On target ({{ work.label.value }}) {{ onTargetCount }} of {{ targetDays.length }} work days
            <template v-if="extraTotal"> · {{ formatHours(extraTotal) }} on days off</template>
          </p>
          <p v-if="!workedDays.length" class="text-sm text-slate-500 dark:text-slate-400">No work recorded.</p>
          <div v-else class="space-y-2.5">
            <TargetBar
              v-for="d in workedDays"
              :key="d.day.valueOf()"
              :value="d.value"
              :min-ms="work.minMs.value"
              :max-ms="work.maxMs.value"
              :label="d.day.format('ddd D')"
              :no-target="!d.workday"
              compact
            />
          </div>
        </template>
      </section>

      <!-- Per activity -->
      <section class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h2 class="mb-3 font-semibold">By activity</h2>
        <p v-if="!perActivity.length" class="py-6 text-center text-slate-500 dark:text-slate-400">No records.</p>
        <template v-else>
          <DonutChart :items="perActivity">
            <span class="text-xs text-slate-500 dark:text-slate-400">Total</span>
            <span class="text-xl font-bold tabular-nums">{{ formatHours(total) }}</span>
          </DonutChart>
          <ul class="mt-4 space-y-2">
            <li v-for="i in perActivity" :key="i.activity.id" class="flex items-center gap-3">
              <ActivityIcon :activity="i.activity" size="sm" />
              <span class="flex-1 truncate">{{ i.label }}</span>
              <span class="text-sm text-slate-500 tabular-nums dark:text-slate-400">
                {{ Math.round((i.value / total) * 100) }}%
              </span>
              <span class="w-16 text-right text-sm font-semibold tabular-nums">{{ formatHours(i.value) }}</span>
            </li>
          </ul>
        </template>
      </section>
    </template>
  </div>

  <BaseModal v-if="showSettings" title="Stats settings" @close="showSettings = false">
    <StatsSettingsForm @done="showSettings = false" />
  </BaseModal>
</template>
