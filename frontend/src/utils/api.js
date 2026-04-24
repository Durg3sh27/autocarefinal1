import axios from 'axios';

const api = axios.create({
  baseURL: 'https://autocarefinal1.onrender.com/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token on every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('garageiq_token');

  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  return config;
});

// Handle auth errors
api.interceptors.response.use(
  res => res.data,
  err => {
    if (
      err.response?.status === 401 ||
      err.response?.status === 403
    ) {
      localStorage.removeItem('garageiq_token');
      localStorage.removeItem('garageiq_user');
      window.location.href = '/login';
    }

    const msg =
      err.response?.data?.error ||
      err.message ||
      'Something went wrong';

    return Promise.reject(new Error(msg));
  }
);

// ── Auth ─────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// ── Vehicles ─────────────────────────────────
export const vehicleAPI = {
  getAll: () => api.get('/vehicles'),
  getById: (id) => api.get(`/vehicles/${id}`),
  create: (data) => api.post('/vehicles', data),
  update: (id, data) => api.put(`/vehicles/${id}`, data),
  delete: (id) => api.delete(`/vehicles/${id}`),
};

// ── Maintenance ──────────────────────────────
export const maintenanceAPI = {
  getAll: (params) => api.get('/maintenance', { params }),
  getById: (id) => api.get(`/maintenance/${id}`),
  create: (data) => api.post('/maintenance', data),
  update: (id, data) => api.put(`/maintenance/${id}`, data),
  delete: (id) => api.delete(`/maintenance/${id}`),
};

// ── Fuel ─────────────────────────────────────
export const fuelAPI = {
  getAll: (params) => api.get('/fuel', { params }),
  getStats: (id) => api.get(`/fuel/stats/${id}`),
  create: (data) => api.post('/fuel', data),
  delete: (id) => api.delete(`/fuel/${id}`),
};

// ── Reminders ────────────────────────────────
export const reminderAPI = {
  getAll: (params) => api.get('/reminders', { params }),
  create: (data) => api.post('/reminders', data),
  updateStatus: (id, status) =>
    api.patch(`/reminders/${id}/status`, { status }),
  delete: (id) => api.delete(`/reminders/${id}`),
};

// ── Stats ────────────────────────────────────
export const statsAPI = {
  getDashboard: () => api.get('/stats/dashboard'),
  getVehicleStats: (id) => api.get(`/stats/vehicle/${id}`),
};

export default api;
