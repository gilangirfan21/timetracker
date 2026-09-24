import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useActivitiesStore = defineStore('activities', () => {
  const items = ref([])
  const loaded = ref(false)

  const active = computed(() => items.value.filter((a) => !a.archived))
  const archived = computed(() => items.value.filter((a) => a.archived))
  const byId = computed(() => Object.fromEntries(items.value.map((a) => [a.id, a])))

  async function load(force = false) {
    if (loaded.value && !force) return
    const { data, error } = await supabase
      .from('activity_types')
      .select('*')
      .order('created_at')
    if (error) throw error
    items.value = data
    loaded.value = true
  }

  async function create({ name, color, icon }) {
    const { data, error } = await supabase
      .from('activity_types')
      .insert({ name, color, icon })
      .select()
      .single()
    if (error) throw error
    items.value.push(data)
    return data
  }

  async function update(id, patch) {
    const { data, error } = await supabase
      .from('activity_types')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    items.value = items.value.map((a) => (a.id === id ? data : a))
    return data
  }

  const archive = (id) => update(id, { archived: true })
  const unarchive = (id) => update(id, { archived: false })

  function reset() {
    items.value = []
    loaded.value = false
  }

  return { items, loaded, active, archived, byId, load, create, update, archive, unarchive, reset }
})
