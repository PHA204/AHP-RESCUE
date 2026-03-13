const shortDateFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  day: '2-digit',
  month: '2-digit',
})

const longDateFormatter = new Intl.DateTimeFormat('vi-VN', {
  hour: '2-digit',
  minute: '2-digit',
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

export function formatDateTime(value: string) {
  return shortDateFormatter.format(new Date(value))
}

export function formatLongDateTime(value: string) {
  return longDateFormatter.format(new Date(value))
}

export function formatPercent(value: number, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`
}

export function formatHours(hours?: number) {
  if (hours === undefined) return 'Không rõ'
  return `${hours.toFixed(hours >= 10 ? 0 : 1)} giờ`
}

export function formatConfidence(value?: number) {
  if (value === undefined) return 'Không rõ'
  return `${Math.round(value * 100)}%`
}
