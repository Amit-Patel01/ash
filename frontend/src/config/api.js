const envApiBase = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || '').trim()
const isBrowser = typeof window !== 'undefined'
const hostname = isBrowser ? window.location.hostname : ''
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'

/**
 * Base URL for REST calls. In Vite dev on localhost, default is '' so `/api/*` uses vite.config.js proxy.
 * Set VITE_API_URL to hit a backend directly (e.g. http://localhost:5000).
 * For production (non-localhost), set VITE_API_URL at build time to your API origin.
 */
export const API_BASE = (() => {
  if (envApiBase) return envApiBase.replace(/\/+$/, '')
  if (isLocalhost && import.meta.env.DEV) return ''
  if (isLocalhost) return 'http://localhost:5000'
  return ''
})()

export const buildApiUrl = (path = '') => {
  if (!path) return API_BASE
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

/**
 * Parse fetch Response as JSON; throw a clear error if the body is HTML (SPA fallback, proxy miss, etc.).
 */
export async function readApiJson(response) {
  const text = await response.text()
  const trimmed = text.trim()
  if (!trimmed) return {}
  try {
    return JSON.parse(text)
  } catch {
    const isHtml = trimmed.startsWith('<') || /^<!DOCTYPE/i.test(trimmed)
    throw new Error(
      isHtml
        ? 'The server returned a web page instead of API data. In development, either leave VITE_API_URL unset (to use the Vite proxy) or set it to your backend base URL. For production, set VITE_API_URL before building the frontend.'
        : 'The server returned invalid JSON.'
    )
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
  razorpayVerifyPayment: buildApiUrl('/api/razorpay/verify-payment'),
  razorpayVerifyCourse: buildApiUrl('/api/razorpay/verify-course'),
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
  userProfile: buildApiUrl('/api/users/me'),
  userPasswordReset: buildApiUrl('/api/users/me/password-reset'),
  userCvUpload: buildApiUrl('/api/users/me/cv'),
  aiChat: buildApiUrl('/api/ai/chat'),
  aiRecommend: buildApiUrl('/api/ai/recommend'),
  aiStatus: buildApiUrl('/api/ai/status'),
}

export default api
