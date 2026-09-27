import { computed, ref, watch } from 'vue'

const HOUR = 3600_000
const STORAGE_KEY = 'coupleSettings'
const DEFAULT = { enabled: false, min: 1, max: 2, visible: true }

function readInitial() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved && typeof saved === 'object') return { ...DEFAULT, ...saved }
  } catch {
    // storage unavailable or corrupt — use the default
  }
  return { ...DEFAULT }
}

// Shared across components: an optional daily target range for couple time,
// and whether the card shows at all.
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

export function useCoupleTarget() {
  const minMs = computed(() => settings.value.min * HOUR)
  const maxMs = computed(() => settings.value.max * HOUR)
  const label = computed(() => `${settings.value.min}–${settings.value.max}h`)

  function save(patch) {
    settings.value = { ...settings.value, ...patch }
  }

  return { settings, minMs, maxMs, label, save }
}
