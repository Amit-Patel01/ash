const getEnv = (key) => {
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[key]) return process.env[key]
    if (process.env[`NEXT_PUBLIC_${key}`]) return process.env[`NEXT_PUBLIC_${key}`]
  }
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      return import.meta.env[key] || ''
    }
  } catch (e) {}
  return ''
}

const envApiBase = (getEnv('VITE_API_URL') || getEnv('VITE_BACKEND_URL') || '').trim()
const isBrowser = typeof window !== 'undefined'
const hostname = isBrowser ? window.location.hostname : ''
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'

export const RENDER_PRIMARY_URL = 'https://ashnexasystems.com-1.onrender.com'
export const DEVTUNNEL_FALLBACK_URL = (
  getEnv('VITE_DEVTUNNEL_URL') ||
  'https://9p4l1tql-5000.inc1.devtunnels.ms'
).replace(/\/+$/, '')

export const API_BASE = (() => {
  if (envApiBase) return envApiBase.replace(/\/+$/, '')
  return ''
})()



export const buildApiUrl = (path = '') => {
  if (!path) return API_BASE
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

// ─── Automatic Failover State (Render -> Devtunnel) ──────────────────────────
let activeBackendMode = 'primary' // 'primary' | 'fallback'
let lastFailoverTime = 0
const FAILOVER_CACHE_MS = 30000 // Cache fallback mode for 30s before re-checking primary

/**
 * Perform a fetch with automatic failover between Render (Primary) and Devtunnel (Fallback)
 */
export async function fetchWithFailover(input, init = {}, nativeFetch = (typeof window !== 'undefined' ? window._originalFetch || window.fetch : fetch)) {
  const rawUrl = typeof input === 'string' ? input : input?.url || ''
  if (!rawUrl) return nativeFetch(input, init)

  // If rawUrl is a relative path (e.g., /api/db/users, /api/notify), use native fetch directly (Next.js monolith)
  if (rawUrl.startsWith('/')) {
    return nativeFetch(input, init)
  }

  // Build primary (Render) and fallback (Devtunnel) URLs for external backend requests
  let primaryUrl = rawUrl
  let fallbackUrl = rawUrl

  if (rawUrl.includes('devtunnels.ms')) {
    primaryUrl = rawUrl.replace(/https:\/\/[^/]+devtunnels\.ms/, RENDER_PRIMARY_URL)
    fallbackUrl = rawUrl
  } else if (rawUrl.includes('onrender.com')) {
    primaryUrl = rawUrl
    fallbackUrl = rawUrl.replace(RENDER_PRIMARY_URL, DEVTUNNEL_FALLBACK_URL)
  }


  const now = Date.now()

  // Helper for abortable fetch
  const executeAttempt = async (targetUrl, timeoutMs) => {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(new Error('Backend Timeout')), timeoutMs)

    let mergedSignal = controller.signal
    if (init?.signal) {
      if (init.signal.aborted) {
        controller.abort(init.signal.reason)
        clearTimeout(timer)
      } else {
        init.signal.addEventListener('abort', () => controller.abort(init.signal.reason), { once: true })
      }
    }

    try {
      const response = await nativeFetch(targetUrl, { ...init, signal: mergedSignal })
      clearTimeout(timer)
      return response
    } catch (err) {
      clearTimeout(timer)
      throw err
    }
  }

  // If primary was recently down, try fallback (Devtunnel) first to avoid waiting 5s timeout
  if (activeBackendMode === 'fallback' && (now - lastFailoverTime < FAILOVER_CACHE_MS)) {
    try {
      const fallbackRes = await executeAttempt(fallbackUrl, 8000)
      if (fallbackRes.ok || (fallbackRes.status >= 400 && fallbackRes.status < 500)) {
        return fallbackRes
      }
    } catch {
      // Fallback failed, reset mode and retry primary
      activeBackendMode = 'primary'
    }
  }

  // Attempt 1: Primary Backend (Render) with 5.5s timeout
  try {
    const res = await executeAttempt(primaryUrl, 5500)
    // 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout mean Render is sleeping/down
    if (res.status === 502 || res.status === 503 || res.status === 504) {
      throw new Error(`Render HTTP status ${res.status}`)
    }
    activeBackendMode = 'primary'
    return res
  } catch (primaryErr) {
    // Primary (Render) failed or timed out! Automatic failover to Devtunnel
    console.warn(`⚡ [API Failover] Render backend unavailable (${primaryErr.message}). Switching to Devtunnel: ${DEVTUNNEL_FALLBACK_URL}`)
    activeBackendMode = 'fallback'
    lastFailoverTime = Date.now()

    try {
      const fallbackRes = await executeAttempt(fallbackUrl, 10000)
      return fallbackRes
    } catch (fallbackErr) {
      console.error(`❌ [API Failover] Both Render and Devtunnel failed: ${fallbackErr.message}`)
      throw fallbackErr
    }
  }
}

// ─── Global window.fetch Monkey-Patch for Zero-Config Failover ───────────────
if (isBrowser && typeof window.fetch === 'function' && !window._apiFailoverInstalled) {
  window._apiFailoverInstalled = true
  window._originalFetch = window.fetch.bind(window)

  window.fetch = function(input, init) {
    return fetchWithFailover(input, init, window._originalFetch)
  }
}

/**
 * Parse fetch Response as JSON; throw a clear error if the body is HTML (SPA fallback, proxy miss, etc.).
 */
export async function readApiJson(response) {
  const text = await response.text()
  const trimmed = text.trim()
  if (!trimmed) return { success: false }
  try {
    return JSON.parse(text)
  } catch {
    return {
      success: false,
      message: 'Server endpoint is initializing or returned non-JSON output.',
      isHtml: trimmed.startsWith('<') || /^<!DOCTYPE/i.test(trimmed)
    }
  }
}


export const api = {
  base: API_BASE,
  uploadPayment: buildApiUrl('/api/upload/payment'),
  uploadTeam: buildApiUrl('/api/upload/team'),
  uploadProject: buildApiUrl('/api/upload/project'),
  uploadCertificateAsset: buildApiUrl('/api/upload/certificate-asset'),
  uploadBroadcast: buildApiUrl('/api/upload/broadcast'),
  contact: buildApiUrl('/contact'),
  reply: buildApiUrl('/reply'),
  razorpayCreateOrder: buildApiUrl('/api/razorpay/create-order'),
  razorpayCreateCourseOrder: buildApiUrl('/api/razorpay/create-course-order'),
  razorpayVerifyPayment: buildApiUrl('/api/razorpay/verify-payment'),
  razorpayVerifyCourse: buildApiUrl('/api/razorpay/verify-course'),
  couponsValidate: buildApiUrl('/api/coupons/validate'),
  adminCoupons: buildApiUrl('/api/coupons'),
  adminCoupon: (couponId) => buildApiUrl(`/api/coupons/${encodeURIComponent(couponId)}`),
  uploadChat: buildApiUrl('/api/upload/chat'),
  forgotPassword: buildApiUrl('/api/auth/forgot-password'),
  verifyResetToken: buildApiUrl('/api/auth/verify-reset-token'),
  resetPassword: buildApiUrl('/api/auth/reset-password'),
  registerCustomer: buildApiUrl('/api/auth/register-customer'),
  submitAccountRequest: buildApiUrl('/api/auth/account-requests'),
  notify: buildApiUrl('/api/notify'),
  adminBroadcastEmail: buildApiUrl('/api/admin/broadcast-email'),
  adminUsers: buildApiUrl('/api/admin/users'),
  adminUserLookup: (email) =>
    buildApiUrl(`/api/admin/users/lookup?email=${encodeURIComponent(email)}`),
  adminDeleteUserByEmail: (email) =>
    buildApiUrl(`/api/admin/users/by-email?email=${encodeURIComponent(email)}`),
  adminMergeUsers: buildApiUrl('/api/admin/users/merge'),
  adminApproveAccountRequest: (requestId) => buildApiUrl(`/api/admin/account-requests/${requestId}/approve`),
  adminRejectAccountRequest: (requestId) => buildApiUrl(`/api/admin/account-requests/${requestId}/reject`),
  adminDeleteAccountRequest: (requestId) => buildApiUrl(`/api/admin/account-requests/${requestId}`),
  adminEmployeeCvs: buildApiUrl('/api/admin/employee-cvs'),
  adminEmployeeCvDownload: (userId) =>
    buildApiUrl(`/api/admin/employee-cvs/${encodeURIComponent(userId)}/download`),
  certificateVerify: (certificateId) =>
    buildApiUrl(`/api/certificates/verify/${encodeURIComponent(certificateId)}`),
  adminQrCertificates: buildApiUrl('/api/certificates/qr'),
  adminQrCertificate: (docId) =>
    buildApiUrl(`/api/certificates/qr/${encodeURIComponent(docId)}`),
  adminQrCertificateStatus: (docId) =>
    buildApiUrl(`/api/certificates/qr/${encodeURIComponent(docId)}/status`),
  publicTeam: buildApiUrl('/api/users/team'),
  chatContacts: buildApiUrl('/api/users/chat-contacts'),
  userProfile: buildApiUrl('/api/users/me'),
  userEmailChange: buildApiUrl('/api/users/me/email-change'),
  userPasswordReset: buildApiUrl('/api/users/me/password-reset'),
  userCvUpload: buildApiUrl('/api/users/me/cv'),
  aiChat: buildApiUrl('/api/ai/chat'),
  aiRecommend: buildApiUrl('/api/ai/recommend'),
  aiStatus: buildApiUrl('/api/ai/status'),
  aiDepartmentConfig: buildApiUrl('/api/ai/department/config'),
  aiDepartmentLogs: buildApiUrl('/api/ai/department/logs'),
  aiDepartmentDispatch: buildApiUrl('/api/ai/department/dispatch'),
  aiDepartmentProposals: buildApiUrl('/api/ai/department/proposals'),
  aiDepartmentResolveProposal: buildApiUrl('/api/ai/department/proposals/resolve'),
  aiDepartmentClearProposals: buildApiUrl('/api/ai/department/proposals/clear'),
  aiDepartmentBroadcastEmail: buildApiUrl('/api/ai/department/email/broadcast'),
  aiDepartmentAnalytics: buildApiUrl('/api/ai/department/analytics'),
  aiNewsletter: buildApiUrl('/api/ai/newsletter'),
  aiSquad: buildApiUrl('/api/ai/squad'),




  supportChat: {
    create: buildApiUrl('/api/chat/create'),
    send: buildApiUrl('/api/chat/send'),
    messages: (chatId) => buildApiUrl(`/api/chat/messages?chatId=${encodeURIComponent(chatId)}`),
    rooms: (role, userId) => {
      const params = new URLSearchParams()
      if (role) params.append('role', role)
      if (userId) params.append('userId', userId)
      const qs = params.toString()
      return buildApiUrl(`/api/chat/rooms${qs ? `?${qs}` : ''}`)
    },
    takeover: buildApiUrl('/api/chat/takeover'),
    clear: buildApiUrl('/api/chat/clear'),
    read: buildApiUrl('/api/chat/read'),
    deleteMessages: buildApiUrl('/api/chat/delete-messages'),
    createGroup: buildApiUrl('/api/chat/create-group') }
}

export default api
