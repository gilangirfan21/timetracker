import { ref, watch } from 'vue'

const STORAGE_KEY = 'theme'

function readInitial() {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (value === 'dark' || value === 'light') return value === 'dark'
  } catch {
    // storage unavailable — fall back to the OS preference
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

// Shared across components so every toggle stays in sync.
const isDark = ref(readInitial())

function apply() {
  document.documentElement.classList.toggle('dark', isDark.value)
  // Match the browser/status bar to the page background (slate-950 / slate-50).
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark.value ? '#020617' : '#f8fafc')
}

watch(isDark, (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, value ? 'dark' : 'light')
  } catch {
    // storage unavailable (private mode) — theme still applies for this session
  }
  apply()
})
apply()

export function useTheme() {
  function toggle() {
    isDark.value = !isDark.value
  }
  return { isDark, toggle }
}
