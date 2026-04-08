const configuredApiBase = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || '';

export const API_BASE =
  configuredApiBase ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 'http://localhost:5000' : '');

export const api = {
  base: API_BASE,
  uploadPayment: `${API_BASE}/api/upload/payment`,
  uploadTeam: `${API_BASE}/api/upload/team`,
  uploadProject: `${API_BASE}/api/upload/project`,
  uploadBroadcast: `${API_BASE}/api/upload/broadcast`,
  contact: `${API_BASE}/contact`,
  reply: `${API_BASE}/reply`,
  razorpayCreateOrder: `${API_BASE}/api/razorpay/create-order`,
  razorpayVerifyPayment: `${API_BASE}/api/razorpay/verify-payment`,
  razorpayVerifyCourse: `${API_BASE}/api/razorpay/verify-course`,
  uploadChat: `${API_BASE}/api/upload/chat`,
  forgotPassword: `${API_BASE}/api/auth/forgot-password`,
  notify: `${API_BASE}/api/notify`,
  adminBroadcastEmail: `${API_BASE}/api/admin/broadcast-email`,
  aiChat: `${API_BASE}/api/ai/chat`,
  aiRecommend: `${API_BASE}/api/ai/recommend`,
  aiStatus: `${API_BASE}/api/ai/status`,
};

export default api;
