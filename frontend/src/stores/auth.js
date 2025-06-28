import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from 'src/boot/axios'

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref(null)
  const token = ref(localStorage.getItem('auth_token') || null)
  const isLoading = ref(false)

  // Getters computados
  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const userRole = computed(() => user.value?.role || 'guest')
  const userName = computed(() => user.value?.name || 'Usuário')

  // Configurar token no axios se existir
  if (token.value) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  // Actions
  async function login(credentials) {
    try {
      isLoading.value = true
      console.log('Store: Iniciando login para:', credentials.email)
      
      // Fazer login na API
      const response = await api.post('/auth/login', credentials)
      console.log('Store: Resposta da API:', response.data)
      
      const { token: authToken, user: userData } = response.data
      
      // Salvar token e dados do usuário
      token.value = authToken
      user.value = userData
      
      // Salvar no localStorage
      localStorage.setItem('auth_token', authToken)
      localStorage.setItem('user_data', JSON.stringify(userData))
      
      // Configurar token no axios
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
      
      console.log('Store: Login realizado com sucesso')
      return { success: true, data: response.data }
      
    } catch (error) {
      console.error('Store: Erro no login:', error)
      console.error('Store: Response error:', error.response?.data)
      return { 
        success: false, 
        error: error.response?.data?.message || 'Erro ao fazer login' 
      }
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      console.log('Iniciando logout...')
      
      // Chamar endpoint de logout no backend se token existir
      if (token.value) {
        console.log('Enviando requisição de logout para o backend...')
        await api.post('/auth/logout')
        console.log('Logout no backend realizado com sucesso')
      }
    } catch (error) {
      console.error('Erro ao fazer logout no backend:', error)
      // Continuar com logout local mesmo se houver erro no backend
    } finally {
      console.log('Limpando dados locais...')
      
      // Limpar dados locais
      user.value = null
      token.value = null
      
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      
      // Remover token do axios
      delete api.defaults.headers.common['Authorization']
      
      console.log('Logout concluído')
    }
  }

  async function fetchUser() {
    if (!token.value) return false
    
    try {
      isLoading.value = true
      
      // Buscar dados atuais do usuário (incluindo foto)
      const response = await api.get('/user/profile')
      
      user.value = response.data.user
      localStorage.setItem('user_data', JSON.stringify(response.data.user))
      
      return true
      
    } catch (error) {
      console.error('Erro ao buscar usuário:', error)
      
      // Se token inválido, fazer logout
      if (error.response?.status === 401) {
        await logout()
      }
      
      return false
    } finally {
      isLoading.value = false
    }
  }

  function refreshToken() {
    // O backend atual não implementa refresh token
    // Vamos remover esta funcionalidade por enquanto
    return false
  }

  // Inicializar dados do usuário se token existir
  async function initAuth() {
    const savedUser = localStorage.getItem('user_data')
    
    if (token.value && savedUser) {
      try {
        user.value = JSON.parse(savedUser)
        // Verificar se token ainda é válido
        await fetchUser()
      } catch (error) {
        console.error('Erro ao inicializar auth:', error)
        await logout()
      }
    }
  }

  return {
    // Estado
    user,
    token,
    isLoading,
    
    // Getters
    isAuthenticated,
    userRole,
    userName,
    
    // Actions
    login,
    logout,
    fetchUser,
    refreshToken,
    initAuth
  }
})
