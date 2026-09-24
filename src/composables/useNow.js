import { onScopeDispose, ref } from 'vue'

// One shared 1-second tick; runs only while something is using it.
const now = ref(Date.now())
let timer = null
let users = 0

export function useNow() {
  users += 1
  if (!timer) {
    now.value = Date.now()
    timer = setInterval(() => (now.value = Date.now()), 1000)
  }
  onScopeDispose(() => {
    users -= 1
    if (users === 0) {
      clearInterval(timer)
      timer = null
    }
  })
  return now
}
