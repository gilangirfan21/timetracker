<script setup>
defineProps({ title: { type: String, required: true } })
</script>

<template>
  <header class="flex items-center justify-between px-4 pt-6 pb-4">
    <h1 class="text-2xl font-bold">{{ title }}</h1>
    <slot />
  </header>
</template>
