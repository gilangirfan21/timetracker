import { computed, toValue } from 'vue'
import { useNow } from '@/composables/useNow'
import { formatClock } from '@/lib/time'

// Live HH:MM:SS since startTime (display only, never stored).
export function useDuration(startTime) {
  const now = useNow()
  return computed(() => formatClock(now.value - new Date(toValue(startTime)).getTime()))
}
