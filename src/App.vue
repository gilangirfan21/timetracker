<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const showNav = computed(() => !route.meta.public)

// Kick back to login if the session ends (logout here or in another tab, token expiry).
watch(
  () => auth.isLoggedIn,
  (loggedIn) => {
    if (!loggedIn && !route.meta.public) router.replace({ name: 'login' })
  },
)
</script>

<template>
  <div class="mx-auto flex h-full max-w-md flex-col">
    <main class="flex-1 overflow-y-auto" :class="{ 'pb-20': showNav }">
      <RouterView />
    </main>
    <BottomNav v-if="showNav" />
  </div>
</template>
