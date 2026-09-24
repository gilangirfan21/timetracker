<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import ThemeToggle from '@/components/ThemeToggle.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.signIn(email.value, password.value)
    router.replace(route.query.redirect || '/')
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="relative flex min-h-full flex-col justify-center px-6">
    <ThemeToggle class="absolute top-4 right-4" />
    <h1 class="mb-8 text-center text-3xl font-bold">Time Tracker</h1>
    <form class="space-y-4" @submit.prevent="submit">
      <input
        v-model="email"
        type="email"
        autocomplete="email"
        placeholder="Email"
        required
        class="field"
      />
      <input
        v-model="password"
        type="password"
        autocomplete="current-password"
        placeholder="Password"
        required
        class="field"
      />
      <p v-if="error" class="text-sm text-red-600 dark:text-red-400">{{ error }}</p>
      <button
        type="submit"
        :disabled="loading"
        class="btn-primary w-full"
      >
        {{ loading ? 'Logging in…' : 'Log in' }}
      </button>
    </form>
  </div>
</template>
