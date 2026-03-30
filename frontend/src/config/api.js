const API_BASE = import.meta.env.VITE_API_URL || 'https://backend-5u1w.onrender.com';

export const api = {
  projects: `${API_BASE}/api/projects`,
  categories: `${API_BASE}/api/projects/categories`,
  checkout: `${API_BASE}/api/projects/checkout`,
  uploadPayment: `${API_BASE}/api/upload/payment`,
  projectBySlug: (slug) => `${API_BASE}/api/projects/${slug}`,
};

export default api;
