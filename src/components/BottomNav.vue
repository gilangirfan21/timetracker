<script setup>
const items = [
  { to: '/', label: 'Home', icon: '⏱️' },
  { to: '/records', label: 'Records', icon: '📋' },
  { to: '/stats', label: 'Stats', icon: '📊' },
  { to: '/activities', label: 'Activities', icon: '🏷️' },
]
</script>

<template>
  <nav
    class="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]"
  >
    <ul class="mx-auto flex max-w-md">
      <li v-for="item in items" :key="item.to" class="flex-1">
        <RouterLink
          :to="item.to"
          class="flex h-16 flex-col items-center justify-center gap-0.5 text-xs text-slate-500"
          exact-active-class="text-indigo-600 font-semibold"
        >
          <span class="text-xl leading-none">{{ item.icon }}</span>
          {{ item.label }}
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>
