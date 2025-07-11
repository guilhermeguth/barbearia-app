import { defineBoot } from '#q-app/wrappers'
import axios from 'axios'
import { Dialog } from 'quasar'


// Usa VITE_API_BASE_URL diretamente do .env, ou fallback para localhost
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT) || 15000

console.log('🔧 API configurada para:', API_BASE_URL)

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para capturar erros de resposta
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido

      // Mostrar dialog de aviso antes de fazer logout
      Dialog.create({
        title: '⚠️ Sessão Expirada',
        message: 'Sua sessão expirou por motivos de segurança. Você será redirecionado para a tela de login.',
        ok: {
          label: 'Fazer Login Novamente',
          color: 'primary'
        }
      }).onOk(() => {
        // Limpar dados
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')

        // Recarregar a página para forçar redirecionamento
        location.reload()
      })

      console.log('Token inválido, usuário precisa fazer login novamente')
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
