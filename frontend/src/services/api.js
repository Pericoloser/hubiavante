import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('hub_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// Helpers por módulo
export const clientesAPI = {
  getAll: (params) => api.get('/clientes', { params }),
  getById: (id) => api.get(`/clientes/${id}`),
  create: (data) => api.post('/clientes', data),
  update: (id, data) => api.put(`/clientes/${id}`, data),
  remove: (id) => api.delete(`/clientes/${id}`)
};

export const tarifasAPI = {
  getAll: (params) => api.get('/tarifas', { params }),
  getById: (id) => api.get(`/tarifas/${id}`),
  create: (data) => api.post('/tarifas', data),
  update: (id, data) => api.put(`/tarifas/${id}`, data),
  remove: (id) => api.delete(`/tarifas/${id}`)
};

export const alumnosAPI = {
  getAll: (params) => api.get('/alumnos', { params }),
  getById: (id) => api.get(`/alumnos/${id}`),
  create: (data) => api.post('/alumnos', data),
  update: (id, data) => api.put(`/alumnos/${id}`, data),
  remove: (id) => api.delete(`/alumnos/${id}`)
};

export const docentesAPI = {
  getAll: (params) => api.get('/docentes', { params }),
  getById: (id) => api.get(`/docentes/${id}`),
  create: (data) => api.post('/docentes', data),
  update: (id, data) => api.put(`/docentes/${id}`, data),
  remove: (id) => api.delete(`/docentes/${id}`)
};

export const fichasAPI = {
  getAll: (params) => api.get('/fichas', { params }),
  getById: (id) => api.get(`/fichas/${id}`),
  create: (data) => api.post('/fichas', data),
  update: (id, data) => api.put(`/fichas/${id}`, data),
  addAlumno: (fichaId, data) => api.post(`/fichas/${fichaId}/alumnos`, data),
  removeAlumno: (fichaId, alumnoId) => api.delete(`/fichas/${fichaId}/alumnos/${alumnoId}`),
  addDocente: (fichaId, data) => api.post(`/fichas/${fichaId}/docentes`, data),
  removeDocente: (fichaId, docenteId) => api.delete(`/fichas/${fichaId}/docentes/${docenteId}`)
};

export const presupuestosAPI = {
  getAll: (params) => api.get('/presupuestos', { params }),
  getById: (id) => api.get(`/presupuestos/${id}`),
  create: (data) => api.post('/presupuestos', data),
  update: (id, data) => api.put(`/presupuestos/${id}`, data)
};

export const propuestasAPI = {
  getAll: (params) => api.get('/propuestas', { params }),
  getById: (id) => api.get(`/propuestas/${id}`),
  create: (data) => api.post('/propuestas', data),
  update: (id, data) => api.put(`/propuestas/${id}`, data)
};

export const guiasAlumnoAPI = {
  getByFicha: (fichaId) => api.get(`/guias-alumno/ficha/${fichaId}`),
  upsert: (fichaId, data) => api.put(`/guias-alumno/ficha/${fichaId}`, data)
};

export const guiasDocenteAPI = {
  getByFicha: (fichaId) => api.get(`/guias-docente/ficha/${fichaId}`),
  upsert: (fichaId, data) => api.put(`/guias-docente/ficha/${fichaId}`, data)
};

export const seguimientoAPI = {
  getSesiones: (fichaId) => api.get(`/seguimiento/ficha/${fichaId}`),
  createSesion: (fichaId, data) => api.post(`/seguimiento/ficha/${fichaId}`, data),
  updateSesion: (fichaId, sesionId, data) => api.put(`/seguimiento/ficha/${fichaId}/sesion/${sesionId}`, data),
  getResumen: (fichaId) => api.get(`/seguimiento/ficha/${fichaId}/asistencia`)
};

export const informesAPI = {
  getAll: (params) => api.get('/informes', { params }),
  getByFicha: (fichaId) => api.get(`/informes/ficha/${fichaId}`),
  upsert: (fichaId, data) => api.put(`/informes/ficha/${fichaId}`, data)
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats')
};
