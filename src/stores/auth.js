import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const session = ref(null)
  const user = computed(() => session.value?.user ?? null)
  const isLoggedIn = computed(() => !!session.value)

  let initPromise = null

  // Resolves once the stored session is loaded; safe to call many times.
  function init() {
    if (!initPromise) {
      initPromise = supabase.auth.getSession().then(({ data }) => {
        session.value = data.session
        supabase.auth.onAuthStateChange((_event, newSession) => {
          session.value = newSession
        })
      })
    }
    return initPromise
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    session.value = data.session
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    session.value = null
  }

  return { session, user, isLoggedIn, init, signIn, signOut }
})
