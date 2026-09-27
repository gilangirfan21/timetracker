import { computed, ref, watch } from 'vue'

const HOUR = 3600_000
const STORAGE_KEY = 'workSettings'
const DEFAULT = { activityId: '', min: 8, max: 9, visible: true }

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

  return { settings, minMs, maxMs, label, guessActivity, save }
}
