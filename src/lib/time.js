import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc.js'
import timezone from 'dayjs/plugin/timezone.js'
import isoWeek from 'dayjs/plugin/isoWeek.js'

dayjs.extend(utc)
dayjs.extend(timezone)
dayjs.extend(isoWeek)

// Stored as UTC timestamptz, always displayed in this zone.
export const TZ = 'Asia/Jakarta'

// local() = now; local(ts) = that instant in TZ.
export function local(value) {
  return dayjs(value).tz(TZ)
}

function pad(n) {
  return String(n).padStart(2, '0')
}

// 01:05:09
export function formatClock(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`
}

// 1h 05m / 12m
export function formatHours(ms) {
  const minutes = Math.max(0, Math.round(ms / 60000))
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h ? `${h}h ${pad(m)}m` : `${m}m`
}

export function durationMs(record) {
  return new Date(record.end_time) - new Date(record.start_time)
}

// Part of a record that falls inside [from, to), in ms.
export function overlapMs(record, from, to) {
  const start = Math.max(new Date(record.start_time).getTime(), from.valueOf())
  const end = Math.min(new Date(record.end_time).getTime(), to.valueOf())
  return Math.max(0, end - start)
}
