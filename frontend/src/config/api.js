export const API_BASE = import.meta.env.VITE_API_URL || '';

export const api = {
  projects: `${API_BASE}/api/projects`,
  categories: `${API_BASE}/api/projects/categories`,
  checkout: `${API_BASE}/api/projects/checkout`,
  uploadPayment: `${API_BASE}/api/upload/payment`,
  uploadTeam: `${API_BASE}/api/upload/team`,
  projectBySlug: (slug) => `${API_BASE}/api/projects/${slug}`,
};

export default api;
