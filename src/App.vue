<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BottomNav from '@/components/BottomNav.vue'
import { useActivitiesStore } from '@/stores/activities'
import { useAuthStore } from '@/stores/auth'
import { useRunningStore } from '@/stores/running'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const activities = useActivitiesStore()
const running = useRunningStore()

const showNav = computed(() => !route.meta.public)

// Session ended (logout here or in another tab, token expiry): clear data, go to login.
watch(
  () => auth.isLoggedIn,
  (loggedIn) => {
    if (loggedIn) return
    activities.reset()
    running.reset()
    if (!route.meta.public) router.replace({ name: 'login' })
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
