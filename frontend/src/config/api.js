export const API_BASE = import.meta.env.VITE_API_URL || '';

export const api = {
  projects: `${API_BASE}/api/projects`,
  categories: `${API_BASE}/api/projects/categories`,
  checkout: `${API_BASE}/api/projects/checkout`,
  uploadPayment: `${API_BASE}/api/upload/payment`,
  uploadTeam: `${API_BASE}/api/upload/team`,
  uploadProject: `${API_BASE}/api/upload/project`,
  contact: `${API_BASE}/contact`,
  reply: `${API_BASE}/reply`,
  projectBySlug: (slug) => `${API_BASE}/api/projects/${slug}`,
  razorpayCreateOrder: `${API_BASE}/api/razorpay/create-order`,
  razorpayVerifyPayment: `${API_BASE}/api/razorpay/verify-payment`,
};

export default api;
