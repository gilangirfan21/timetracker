import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

// Holidays / leave marked by hand: workdays with no work target.
// Dates are local (Asia/Jakarta) calendar days as 'YYYY-MM-DD'.
export const useDaysOffStore = defineStore('daysOff', () => {
  // Set of off dates in [from, to).
  async function listRange(from, to) {
    const { data, error } = await supabase
      .from('days_off')
      .select('date')
      .gte('date', from.format('YYYY-MM-DD'))
      .lt('date', to.format('YYYY-MM-DD'))
    if (error) throw error
    return new Set(data.map((d) => d.date))
  }

  async function add(day) {
    const { error } = await supabase.from('days_off').insert({ date: day.format('YYYY-MM-DD') })
    if (error) throw error
  }

  async function remove(day) {
    const { error } = await supabase.from('days_off').delete().eq('date', day.format('YYYY-MM-DD'))
    if (error) throw error
  }

  return { listRange, add, remove }
})
