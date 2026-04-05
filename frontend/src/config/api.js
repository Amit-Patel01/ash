export const API_BASE = import.meta.env.VITE_API_URL || '';

export const api = {
  uploadPayment: `${API_BASE}/api/upload/payment`,
  uploadTeam: `${API_BASE}/api/upload/team`,
  uploadProject: `${API_BASE}/api/upload/project`,
  contact: `${API_BASE}/contact`,
  reply: `${API_BASE}/reply`,
  razorpayCreateOrder: `${API_BASE}/api/razorpay/create-order`,
  razorpayVerifyPayment: `${API_BASE}/api/razorpay/verify-payment`,
  uploadChat: `${API_BASE}/api/upload/chat`,
  forgotPassword: `${API_BASE}/api/auth/forgot-password`,
};

export default api;
