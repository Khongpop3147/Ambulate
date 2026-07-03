const API_BASE = '/api';

async function fetchAPI(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'เกิดข้อผิดพลาด' }));
    throw new Error(err.error || 'เกิดข้อผิดพลาด');
  }
  return res.json();
}

export const patientAPI = {
  getAll: (status) => fetchAPI(`/patients${status ? `?status=${status}` : ''}`),
  getStats: () => fetchAPI('/patients/stats'),
  getById: (id) => fetchAPI(`/patients/${id}`),
  create: (data) => fetchAPI('/patients', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => fetchAPI(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => fetchAPI(`/patients/${id}`, { method: 'DELETE' }),
};

export const assessmentAPI = {
  create: (data) => fetchAPI('/assessments', { method: 'POST', body: JSON.stringify(data) }),
  getByPatient: (patientId) => fetchAPI(`/assessments/patient/${patientId}`),
};

export const ambulationAPI = {
  create: (data) => fetchAPI('/ambulations', { method: 'POST', body: JSON.stringify(data) }),
  getByPatient: (patientId) => fetchAPI(`/ambulations/patient/${patientId}`),
};

export const notificationAPI = {
  getAll: () => fetchAPI('/notifications'),
  getUnreadCount: () => fetchAPI('/notifications/unread-count'),
  markRead: (id) => fetchAPI(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: () => fetchAPI('/notifications/read-all', { method: 'PUT' }),
};
