import { computed, ref, watch } from 'vue'

const HOUR = 3600_000
const STORAGE_KEY = 'workSettings'
// workdays: ISO weekdays with a target (1 = Mon … 7 = Sun).
const DEFAULT = { activityId: '', min: 8, max: 9, visible: true, workdays: [1, 2, 3, 4, 5] }

function readInitial() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved && typeof saved === 'object') return { ...DEFAULT, ...saved }
  } catch {
    // storage unavailable or corrupt — use the default
  }
  return { ...DEFAULT }
}

// Shared across components: the activity treated as "work", its target range,
// and whether the card shows at all. Configured once from Stats settings.
const settings = ref(readInitial())

watch(
  settings,
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
    } catch {
      // storage unavailable — settings last for this session only
    }
  },
  { deep: true },
)

export function useWorkTarget() {
  const minMs = computed(() => settings.value.min * HOUR)
  const maxMs = computed(() => settings.value.max * HOUR)
  const label = computed(() => `${settings.value.min}–${settings.value.max}h`)

  // First run only: guess the work activity by name so the card isn't empty.
  function guessActivity(activities) {
    if (settings.value.activityId || !activities.length) return
    const guess = activities.find((a) => /work|kerja|kantor/i.test(a.name))
    if (guess) settings.value = { ...settings.value, activityId: guess.id }
  }

  function save(patch) {
    settings.value = { ...settings.value, ...patch }
  }

  // Whether a day has a work target: a scheduled weekday not marked off.
  function isWorkday(day, daysOff) {
    return settings.value.workdays.includes(day.isoWeekday()) && !daysOff.has(day.format('YYYY-MM-DD'))
  }

  return { settings, minMs, maxMs, label, guessActivity, save, isWorkday }
}
