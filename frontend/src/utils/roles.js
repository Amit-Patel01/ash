export const normalizeUserRole = (role) => {
  const normalized = String(role || '').trim().toLowerCase()

  if (!normalized) return 'customer'
  if (normalized === 'admin') return 'admin'
  if (normalized === 'mentor') return 'mentor'
  if (['employee', 'team', 'team member', 'staff'].includes(normalized)) return 'employee'
  if (['customer', 'student', 'client', 'user'].includes(normalized)) return 'customer'

  return normalized
}

export const isEmployeeRole = (role) => {
  const normalized = normalizeUserRole(role)
  return normalized === 'employee' || normalized === 'mentor'
}

export const getHomePathForRole = (role) => {
  const normalized = normalizeUserRole(role)

  if (normalized === 'admin') return '/admin'
  if (normalized === 'customer') return '/customer'
  if (isEmployeeRole(normalized)) return '/employee'
  return '/customer'
}
