const configuredApiBase = import.meta.env.DEV
  ? (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || '').trim()
  : ''
const isBrowser = typeof window !== 'undefined'
const hostname = isBrowser ? window.location.hostname : ''
const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1'

export const API_BASE =
  isLocalhost
    ? (configuredApiBase || 'http://localhost:5000')
    : ''

export const buildApiUrl = (path = '') => {
  if (!path) return API_BASE
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

export const api = {
  base: API_BASE,
  uploadPayment: buildApiUrl('/api/upload/payment'),
  uploadTeam: buildApiUrl('/api/upload/team'),
  uploadProject: buildApiUrl('/api/upload/project'),
  uploadBroadcast: buildApiUrl('/api/upload/broadcast'),
  contact: buildApiUrl('/contact'),
  reply: buildApiUrl('/reply'),
  razorpayCreateOrder: buildApiUrl('/api/razorpay/create-order'),
  razorpayVerifyPayment: buildApiUrl('/api/razorpay/verify-payment'),
  razorpayVerifyCourse: buildApiUrl('/api/razorpay/verify-course'),
  uploadChat: buildApiUrl('/api/upload/chat'),
  forgotPassword: buildApiUrl('/api/auth/forgot-password'),
  notify: buildApiUrl('/api/notify'),
  adminBroadcastEmail: buildApiUrl('/api/admin/broadcast-email'),
  aiChat: buildApiUrl('/api/ai/chat'),
  aiRecommend: buildApiUrl('/api/ai/recommend'),
  aiStatus: buildApiUrl('/api/ai/status'),
}

export default api
