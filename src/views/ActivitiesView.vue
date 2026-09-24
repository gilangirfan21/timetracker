<script setup>
import { ref } from 'vue'
import PageHeader from '@/components/PageHeader.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const error = ref('')

async function logout() {
  error.value = ''
  try {
    await auth.signOut()
  } catch (e) {
    error.value = e.message
  }
}
</script>

<template>
  <PageHeader title="Activities">
    <button class="rounded-lg px-3 py-2 text-sm font-medium text-red-600" @click="logout">
      Log out
    </button>
  </PageHeader>
  <p class="px-4 text-sm text-slate-500">Logged in as {{ auth.user?.email }}</p>
  <p v-if="error" class="px-4 text-sm text-red-600">{{ error }}</p>
  <p class="mt-4 px-4 text-slate-500">Activity types CRUD comes in Phase 2.</p>
</template>
