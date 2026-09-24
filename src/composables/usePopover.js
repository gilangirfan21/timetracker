import { onBeforeUnmount, ref } from 'vue'

// Floating panel anchored to a trigger, teleported to <body> so modals with
// overflow don't clip it. Closes on outside click, outside scroll, resize.
export function usePopover({ width, height }) {
  const isOpen = ref(false)
  const trigger = ref(null)
  const panel = ref(null)
  const style = ref({})

  function position() {
    const rect = trigger.value.getBoundingClientRect()
    const w = width ?? rect.width
    let left = Math.min(rect.left, window.innerWidth - w - 8)
    left = Math.max(8, left)
    let top = rect.bottom + 4
    if (top + height > window.innerHeight - 8) top = Math.max(8, rect.top - height - 4)
    style.value = { top: `${top}px`, left: `${left}px`, width: `${w}px` }
  }

  function onPointerDown(e) {
    if (trigger.value?.contains(e.target) || panel.value?.contains(e.target)) return
    close()
  }

  function onScroll(e) {
    if (panel.value?.contains(e.target)) return
    close()
  }

  function open() {
    position()
    isOpen.value = true
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', close)
  }

  function close() {
    isOpen.value = false
    document.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('scroll', onScroll, true)
    window.removeEventListener('resize', close)
  }

  function toggle() {
    isOpen.value ? close() : open()
  }

  onBeforeUnmount(close)

  return { isOpen, trigger, panel, style, open, close, toggle }
}
