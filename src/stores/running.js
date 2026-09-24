import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useRunningStore = defineStore('running', () => {
  const items = ref([])
  const byActivity = computed(() =>
    Object.fromEntries(items.value.map((r) => [r.activity_type_id, r])),
  )

  async function load() {
    const { data, error } = await supabase
      .from('running_records')
      .select('*')
      .order('start_time')
    if (error) throw error
    items.value = data
  }

  async function start(activityTypeId, tags = []) {
    const { data, error } = await supabase
      .from('running_records')
      .insert({ activity_type_id: activityTypeId, start_time: new Date().toISOString(), tags })
      .select()
      .single()
    if (error) {
      // Already started on another device (unique user + activity): just sync.
      if (error.code === '23505') return load()
      throw error
    }
    items.value.push(data)
  }

  // Move a running timer into records. If the delete fails, roll back the
  // inserted record so the same timer can't end up recorded twice.
  async function stop(running) {
    const { data: record, error: insertError } = await supabase
      .from('records')
      .insert({
        activity_type_id: running.activity_type_id,
        start_time: running.start_time,
        end_time: new Date().toISOString(),
        tags: running.tags ?? [],
      })
      .select()
      .single()
    if (insertError) throw insertError

    const { data: deleted, error: deleteError } = await supabase
      .from('running_records')
      .delete()
      .eq('id', running.id)
      .select('id')

    if (deleteError || deleted.length === 0) {
      await supabase.from('records').delete().eq('id', record.id)
      if (deleteError) throw deleteError
      // Already stopped on another device.
      await load()
      return null
    }

    items.value = items.value.filter((r) => r.id !== running.id)
    return record
  }

  function reset() {
    items.value = []
  }

  return { items, byActivity, load, start, stop, reset }
})
