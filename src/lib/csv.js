// Quotes a field per RFC 4180 only when needed (contains a comma, quote or newline).
function quote(value) {
  const s = String(value ?? '')
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

export function toCsv(headers, rows) {
  const lines = [headers, ...rows].map((row) => row.map(quote).join(','))
  // Leading BOM so Excel opens UTF-8 (accents, "with istri", etc.) correctly.
  return '﻿' + lines.join('\r\n')
}

export function downloadCsv(filename, csv) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
