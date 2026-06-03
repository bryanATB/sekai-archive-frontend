import axios from 'axios'

const api = axios.create({
  baseURL: 'https://sekai-archive-backend.onrender.com/api/v1',
})

// Agrega el token automáticamente a cada petición
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api