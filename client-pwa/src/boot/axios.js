import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'

// Configurar base URL da API da barbearia
const isDev = process.env.NODE_ENV === 'development'
const baseURL = isDev 
  ? 'http://localhost:3001' // Backend em desenvolvimento
  : process.env.API_BASE_URL || 'http://localhost:3001'

const api = axios.create({ 
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido - limpar dados de autenticação
      console.log('Token inválido detectado pelo interceptor, limpando localStorage')
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      // Vamos deixar o router guard lidar com o redirecionamento
    }
    return Promise.reject(error)
  }
)

export default defineBoot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

export { api }
