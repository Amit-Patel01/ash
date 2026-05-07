export const normalize = (value) => String(value || '').trim().toLowerCase()

export const getTimeValue = (value) => {
  if (!value) return 0
  if (typeof value?.toMillis === 'function') return value.toMillis()
  const date = value?.toDate ? value.toDate() : new Date(value)
  const time = date.getTime()
  return Number.isFinite(time) ? time : 0
}

export const formatTimeAgo = (value) => {
  const time = getTimeValue(value)
  if (!time) return 'just now'

  const diff = Math.floor((Date.now() - time) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`

  return new Date(time).toLocaleDateString('en-IN')
}

export const getEmployeeMemberData = (teamMembers = [], currentUser, userProfile) => {
  const currentEmail = normalize(currentUser?.email || userProfile?.email)
  const currentEmployeeId = normalize(userProfile?.employeeId || currentUser?.employeeId)

  return teamMembers.find(member =>
    normalize(member.email) === currentEmail ||
    (currentEmployeeId && normalize(member.employeeId) === currentEmployeeId)
  ) || null
}

export const getEmployeeKeyList = (currentUser, userProfile, memberData = null) =>
  [...new Set([
    currentUser?.uid,
    userProfile?.uid,
    currentUser?.employeeId,
    userProfile?.employeeId,
    memberData?.employeeId,
  ].filter(Boolean))]

export const getEmployeeInitials = (name) =>
  (name || 'Employee')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('') || 'EM'

export const getEmployeeIdentitySet = (currentUser, userProfile, memberData = null) => {
  const displayName =
    userProfile?.displayName ||
    currentUser?.displayName ||
    memberData?.name ||
    ''

  const identities = [
    currentUser?.uid,
    userProfile?.uid,
    currentUser?.employeeId,
    userProfile?.employeeId,
    currentUser?.email,
    userProfile?.email,
    memberData?.employeeId,
    memberData?.email,
    displayName,
    memberData?.name,
  ]
    .filter(Boolean)
    .map(normalize)

  const initial = normalize(displayName.charAt(0))
  if (initial) identities.push(initial)

  const initials = normalize(getEmployeeInitials(displayName))
  if (initials) identities.push(initials)

  return new Set(identities)
}

export const getEmployeeDisplayName = (currentUser, userProfile, memberData = null) =>
  userProfile?.displayName ||
  currentUser?.displayName ||
  memberData?.name ||
  'Employee'

export const taskBelongsToEmployee = (task, identities) => {
  if (!identities || identities.size === 0) return false

  const assignee = normalize(task?.assignee)
  const assigneeUserId = normalize(task?.assigneeUserId)
  const assigneeEmail = normalize(task?.assigneeEmail)
  const assigneeEmployeeId = normalize(task?.assigneeEmployeeId)

  if (assigneeUserId && identities.has(assigneeUserId)) return true
  if (assigneeEmail && identities.has(assigneeEmail)) return true
  if (assigneeEmployeeId && identities.has(assigneeEmployeeId)) return true
  if (assignee && identities.has(assignee)) return true

  return false
}

export const courseBelongsToEmployee = (course, employeeKeys) =>
  employeeKeys.includes(course?.assignedEmployeeId) ||
  employeeKeys.includes(course?.assignedEmployeeRef)

export const enrollmentMatchesCourse = (enrollment, course) =>
  enrollment?.courseId === course?.id ||
  (enrollment?.courseTitle && enrollment.courseTitle === course?.title)
