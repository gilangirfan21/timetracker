<script setup>
import BaseIcon from '@/components/icons/BaseIcon.vue'

const items = [
  { to: '/', label: 'Records', icon: 'list-bullet' },
  { to: '/stats', label: 'Stats', icon: 'chart-bar' },
  { to: '/timer', label: 'Timer', icon: 'clock' },
  { to: '/activities', label: 'Activities', icon: 'tag' },
]
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/85 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/85"
  >
    <ul class="mx-auto flex max-w-md">
      <li v-for="item in items" :key="item.to" class="flex-1">
        <RouterLink
          :to="item.to"
          class="flex h-16 flex-col items-center justify-center gap-1 text-xs text-slate-500 transition-colors dark:text-slate-400"
          exact-active-class="!text-indigo-600 dark:!text-indigo-400 font-semibold"
        >
          <BaseIcon :name="item.icon" size="lg" />
          {{ item.label }}
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>
