export const normalizeUserRole = (role) => {
  const normalized = String(role || '').trim().toLowerCase()

  if (!normalized) return 'student'
  if (['admin', 'administrator', 'superadmin', 'super_admin'].includes(normalized)) return 'admin'
  if (normalized === 'mentor') return 'mentor'
  if (['employee', 'team', 'team member', 'staff', 'developer'].includes(normalized)) return 'employee'
  if (['student', 'client', 'user', 'customer'].includes(normalized)) return 'student'

  return normalized
}

export const isMentorRole = (role) => {
  const normalized = normalizeUserRole(role)
  return normalized === 'mentor'
}

export const isEmployeeRole = (role) => {
  const normalized = normalizeUserRole(role)
  return normalized === 'employee'
}

export const getHomePathForRole = (role) => {
  const normalized = normalizeUserRole(role)

  if (normalized === 'admin') return '/admin'
  if (normalized === 'mentor') return '/mentor'
  if (normalized === 'employee') return '/employee'
  if (normalized === 'student') return '/user'
  return '/user'
}

/**
 * Returns a friendly display label for a role.
 * 'customer' and 'student' both show as 'User' on the website.
 */
export const getRoleDisplayLabel = (role) => {
  const normalized = String(role || '').trim().toLowerCase()
  if (['customer', 'student', 'user', 'client'].includes(normalized)) return 'User'
  if (normalized === 'admin') return 'Admin'
  if (normalized === 'employee' || normalized === 'staff' || normalized === 'developer') return 'Employee'
  if (normalized === 'mentor') return 'Mentor'
  return 'User'
}
