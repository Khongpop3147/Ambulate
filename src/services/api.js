const API_BASE = '/api';

async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('sara_token');
  const headers = { 
    'Content-Type': 'application/json',
    ...options.headers 
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('sara_token');
    localStorage.removeItem('sara_user');
    if (window.location.pathname !== '/login' && window.location.pathname !== '/register-nurse') {
      window.location.href = '/login';
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const authAPI = {
  login: (credentials) => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (data) => fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
};

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
