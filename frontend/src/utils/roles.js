export const normalizeUserRole = (role) => {
  const normalized = String(role || '').trim().toLowerCase()

  if (!normalized) return 'student'
  if (normalized === 'admin') return 'admin'
  if (normalized === 'mentor') return 'mentor'
  if (['employee', 'team', 'team member', 'staff', 'developer'].includes(normalized)) return 'employee'
  if (['student', 'client', 'user', 'customer'].includes(normalized)) return 'student'

  return normalized
}

export const isEmployeeRole = (role) => {
  const normalized = normalizeUserRole(role)
  return normalized === 'employee' || normalized === 'mentor'
}

export const getHomePathForRole = (role) => {
  const normalized = normalizeUserRole(role)

  if (normalized === 'admin') return '/admin'
  if (normalized === 'student') return '/student'
  if (isEmployeeRole(normalized)) return '/employee'
  return '/student'
}
