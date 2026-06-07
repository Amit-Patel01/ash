import { collection, getDocs } from 'firebase/firestore'
import { api, readApiJson } from '../config/api'
import { db } from '../config/firebase'

const normalizeText = (value) => String(value || '').trim()
const normalizeKey = (value) => normalizeText(value).toLowerCase()

const hiddenBooleanValues = new Set(['0', 'false', 'no', 'off'])
const inactiveStatuses = new Set(['inactive', 'disabled', 'blocked', 'deleted'])
const genericRoles = new Set(['employee', 'customer', 'admin', 'team'])

const isTruthyFlag = (value) => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') return !hiddenBooleanValues.has(value.trim().toLowerCase())
  return false
}

const isVisibleTeamProfile = (member = {}, { trustedTeamCollection = false } = {}) => {
  const status = normalizeKey(member.status || 'active')
  const isActive = !inactiveStatuses.has(status)
  const isVisible = trustedTeamCollection
    ? member.showOnTeam !== false
    : isTruthyFlag(member.showOnTeam)

  return isActive && isVisible
}

const resolveJobTitle = (member = {}) => {
  const jobTitle = normalizeText(member.jobTitle)
  if (jobTitle) return jobTitle

  const role = normalizeText(member.role)
  return role && !genericRoles.has(role.toLowerCase()) ? role : 'Team Member'
}

const normalizeTeamProfile = (member = {}) => {
  const uid = normalizeText(member.uid || member.firebaseUid)
  const id = normalizeText(uid || member.id || member.employeeId || member.email || member.displayName || member.name)
  const displayName = normalizeText(member.displayName || member.name) || 'Team Member'

  return {
    ...member,
    id,
    uid,
    displayName,
    name: normalizeText(member.name || displayName),
    email: normalizeText(member.email),
    employeeId: normalizeText(member.employeeId),
    department: normalizeText(member.department) || 'Core Team',
    jobTitle: resolveJobTitle(member),
    bio: normalizeText(member.bio) || 'Professional team member at AmitSolutionHub.',
    status: normalizeKey(member.status || 'active') === 'inactive' ? 'inactive' : 'active',
    showOnTeam: member.showOnTeam !== false,
  }
}

const sortTeamProfiles = (left, right) => {
  const leftId = left.employeeId || 'ZZZ'
  const rightId = right.employeeId || 'ZZZ'
  return leftId.localeCompare(rightId, undefined, { numeric: true, sensitivity: 'base' })
}

export const normalizeTeamProfiles = (members = [], options = {}) => {
  const safeMembers = Array.isArray(members) ? members : []

  return safeMembers
    .filter((member) => isVisibleTeamProfile(member, options))
    .map(normalizeTeamProfile)
    .filter((member) => member.id)
    .sort(sortTeamProfiles)
}

export const mergeTeamProfiles = (...profileLists) => {
  const byKey = new Map()

  profileLists.flat().forEach((profile) => {
    const normalized = normalizeTeamProfile(profile)
    const key = normalizeKey(normalized.uid || normalized.id || normalized.email || normalized.employeeId || normalized.displayName)
    if (!key || byKey.has(key)) return
    byKey.set(key, normalized)
  })

  return [...byKey.values()].sort(sortTeamProfiles)
}

export const buildTeamProfiles = ({ publicTeam = [], users = [], teamMembers = [] } = {}) =>
  mergeTeamProfiles(
    normalizeTeamProfiles(publicTeam, { trustedTeamCollection: true }),
    normalizeTeamProfiles(users),
    normalizeTeamProfiles(teamMembers, { trustedTeamCollection: true })
  )

export const getTeamMemberKeys = (member) =>
  [...new Set([
    member?.uid,
    member?.firebaseUid,
    member?.employeeId,
    member?.id,
    member?.email,
    member?.displayName,
    member?.name,
  ].filter(Boolean))]

export const getTeamMemberProfileId = (member) =>
  encodeURIComponent(getTeamMemberKeys(member)[0] || 'team-member')

const isDirectImageUrl = (value) => normalizeText(value).startsWith('http')

export const getTeamMemberImageUrl = (member = {}) => {
  if (member.avatarSource === 'custom' && member.customImageUrl) return member.customImageUrl
  if (member.avatarSource === 'linkedin' && member.linkedin && !member.linkedin.includes('linkedin.com')) {
    return member.linkedin
  }
  if (isDirectImageUrl(member.photoURL)) return member.photoURL
  if (isDirectImageUrl(member.avatarUrl)) return member.avatarUrl
  if (isDirectImageUrl(member.avatar)) return member.avatar

  let github = member.github
  if (github) {
    if (github.startsWith('http')) {
      github = github.replace(/\/$/, '')
      return github.endsWith('.png') ? github : `${github}.png`
    }

    return `https://github.com/${github}.png`
  }

  return ''
}

const fetchApiTeamProfiles = async () => {
  const response = await fetch(api.publicTeam)
  const payload = await readApiJson(response)

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || 'Unable to load public team profiles.')
  }

  return normalizeTeamProfiles(payload.team || [], { trustedTeamCollection: true })
}

const fetchFirestoreTeamProfiles = async (collectionName) => {
  const snapshot = await getDocs(collection(db, collectionName))
  const members = snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    uid: docSnap.id,
    ...docSnap.data(),
  }))

  return normalizeTeamProfiles(members, { trustedTeamCollection: true })
}

export const fetchPublicTeamProfiles = async () => {
  const attempts = await Promise.allSettled([
    fetchApiTeamProfiles(),
    fetchFirestoreTeamProfiles('team'),
    fetchFirestoreTeamProfiles('employees'),
  ])

  const profiles = attempts.flatMap((result) =>
    result.status === 'fulfilled' ? result.value : []
  )

  if (profiles.length > 0) {
    return mergeTeamProfiles(profiles)
  }

  const failure = attempts.find((result) => result.status === 'rejected')
  if (failure?.reason) throw failure.reason

  return []
}
