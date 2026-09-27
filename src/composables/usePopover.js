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
    // Same reasoning as onResize: the keyboard opening can scroll the page to
    // keep a focused input in view, which isn't the user scrolling away.
    if (panel.value?.contains(document.activeElement)) return
    close()
  }

  // On mobile, focusing an input inside the panel (e.g. a search box) opens the
  // on-screen keyboard, which fires a resize as the viewport shrinks — that's
  // not the user dismissing anything, so don't close while it's happening.
  function onResize() {
    if (panel.value?.contains(document.activeElement)) return
    close()
  }

  function open() {
    position()
    isOpen.value = true
    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
  }

  function close() {
    isOpen.value = false
    document.removeEventListener('pointerdown', onPointerDown)
    window.removeEventListener('scroll', onScroll, true)
    window.removeEventListener('resize', onResize)
  }

  function toggle() {
    isOpen.value ? close() : open()
  }

  onBeforeUnmount(close)

  return { isOpen, trigger, panel, style, open, close, toggle }
}
