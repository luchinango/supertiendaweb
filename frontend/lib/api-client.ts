import axios from 'axios'

// Si usas localStorage o cookies para guardar el token:
function getAuthToken() {
  // Si usas localStorage:
  return localStorage.getItem('auth_token')
  // Si usas cookies, usa una librería como js-cookie:
  // return Cookies.get('auth_token')
}

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

export default apiClient
