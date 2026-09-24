import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

// Records are always queried by date range, so views keep their own lists.
export const useRecordsStore = defineStore('records', () => {
  // Records overlapping [from, to) — includes ones crossing midnight.
  async function listRange(from, to) {
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .lt('start_time', to.toISOString())
      .gt('end_time', from.toISOString())
      .order('start_time')
    if (error) throw error
    return data
  }

  // Distinct notes from the latest records of an activity, newest first.
  async function recentNotes(activityTypeId, limit = 20) {
    const { data, error } = await supabase
      .from('records')
      .select('note')
      .eq('activity_type_id', activityTypeId)
      .not('note', 'is', null)
      .neq('note', '')
      .order('start_time', { ascending: false })
      .limit(100)
    if (error) throw error
    return [...new Set(data.map((r) => r.note.trim()))].slice(0, limit)
  }

  async function create(payload) {
    const { data, error } = await supabase.from('records').insert(payload).select().single()
    if (error) throw error
    return data
  }

  async function update(id, patch) {
    const { data, error } = await supabase
      .from('records')
      .update(patch)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  }

  async function remove(id) {
    const { error } = await supabase.from('records').delete().eq('id', id)
    if (error) throw error
  }

  return { listRange, recentNotes, create, update, remove }
})
