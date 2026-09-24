<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'
import { useTheme } from '@/composables/useTheme'

const { isDark, toggle } = useTheme()
</script>

<template>
  <button
    type="button"
    class="icon-btn"
    :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    @click="toggle"
  >
    <BaseIcon :name="isDark ? 'sun' : 'moon'" size="md" />
  </button>
</template>
