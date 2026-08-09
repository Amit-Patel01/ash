const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const toLocalDateKey = (value) => {
  const parsed = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(parsed.getTime())) return ''
  const offset = parsed.getTimezoneOffset() * 60000
  return new Date(parsed.getTime() - offset).toISOString().slice(0, 10)
}

export const normalizeEnrollmentDeadline = (value) => {
  if (!value) return ''
  const raw = String(value).trim()
  if (!raw) return ''
  if (DATE_ONLY_PATTERN.test(raw)) return raw
  return toLocalDateKey(raw)
}

export const formatEnrollmentDeadline = (value, locale = 'en-IN') => {
  const normalized = normalizeEnrollmentDeadline(value)
  if (!normalized) return ''

  const [year, month, day] = normalized.split('-').map(Number)
  const parsed = new Date(Date.UTC(year, month - 1, day))
  if (Number.isNaN(parsed.getTime())) return ''

  try {
    return new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC' }).format(parsed)
  } catch {
    return normalized
  }
}

export const isEnrollmentClosed = (course, now = new Date()) => {
  const deadline = normalizeEnrollmentDeadline(course?.enrollmentDeadline)
  if (!deadline) return false
  return toLocalDateKey(now) > deadline
}

export const isPlanEnrollmentClosed = (plan, course, now = new Date()) => {
  // Check plan deadline first
  const planDeadline = normalizeEnrollmentDeadline(plan?.enrollmentDeadline)
  if (planDeadline) {
    return toLocalDateKey(now) > planDeadline
  }
  // Fallback to course deadline
  return isEnrollmentClosed(course, now)
}
