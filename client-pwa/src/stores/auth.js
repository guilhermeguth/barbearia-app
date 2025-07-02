import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false
  }),

  getters: {
    isCustomer: (state) => state.user?.role === 'customer' || state.user?.role === 'admin' // TEMPORÁRIO: permitir admin
  },

  actions: {
    // Inicializar autenticação a partir do localStorage
    initAuth() {
      const token = localStorage.getItem('token')
      const userData = localStorage.getItem('user')
      
      if (token && userData) {
        try {
          this.token = token
          this.user = JSON.parse(userData)
          this.isAuthenticated = true
          console.log('Auth inicializada do localStorage:', this.user?.name)
        } catch (error) {
          console.error('Erro ao parsear dados do usuário:', error)
          this.logout()
        }
      } else {
        console.log('Nenhum token encontrado no localStorage')
        this.isAuthenticated = false
      }
    },

    // Sincronizar estado com localStorage (útil para múltiplas abas)
    syncWithStorage() {
      const token = localStorage.getItem('token')
      
      // Se não há dados no localStorage mas a store pensa que está autenticada
      if (!token && this.isAuthenticated) {
        console.log('Token removido externamente, fazendo logout')
        this.logout()
        return false
      }
      
      // Se há dados no localStorage mas a store não está autenticada
      if (token && !this.isAuthenticated) {
        console.log('Token encontrado externamente, inicializando auth')
        this.initAuth()
        return true
      }
      
      return this.isAuthenticated
    },

    // Login do cliente
    async login(email, password) {
      try {
        this.isLoading = true
        
        const response = await api.post('/auth/login', {
          email,
          password
        })

        const { token, user } = response.data

        // TEMPORÁRIO: Permitir admin para teste
        // if (user.role !== 'customer') {
        //   throw new Error('Acesso negado. Esta aplicação é apenas para clientes.')
        // }

        // Salvar dados de autenticação
        this.token = token
        this.user = user
        this.isAuthenticated = true
        
        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(user))

        return { success: true }
      } catch (error) {
        console.error('Erro no login:', error)
        return { 
          success: false, 
          message: error.response?.data?.message || error.message || 'Erro no login'
        }
      } finally {
        this.isLoading = false
      }
    },

    // Registro de novo cliente
    async register(userData) {
      try {
        this.isLoading = true
        
        await api.post('/user/create', {
          ...userData,
          role: 'customer' // Garantir que seja criado como cliente
        })

        // Após registro, fazer login automaticamente
        return await this.login(userData.email, userData.password)
      } catch (error) {
        console.error('Erro no registro:', error)
        return { 
          success: false, 
          message: error.response?.data?.message || 'Erro no registro'
        }
      } finally {
        this.isLoading = false
      }
    },

    // Logout
    logout() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      
      console.log('Logout realizado')
    },

    // Configurar listener para mudanças no localStorage (para sincronizar entre abas)
    setupStorageListener() {
      // Evitar duplicar listeners
      if (this._storageListener) {
        return
      }
      
      this._storageListener = (event) => {
        if (event.key === 'token' || event.key === 'user') {
          console.log('Mudança detectada no localStorage:', event.key)
          this.syncWithStorage()
        }
      }
      
      // Adicionar listener apenas se estivermos no browser
      if (typeof addEventListener !== 'undefined') {
        addEventListener('storage', this._storageListener)
      }
    },

    // Remover listener
    removeStorageListener() {
      if (this._storageListener && typeof removeEventListener !== 'undefined') {
        removeEventListener('storage', this._storageListener)
        this._storageListener = null
      }
    },

    // Verificar se o token ainda é válido
    async checkAuth() {
      try {
        const response = await api.get('/auth/authenticate')
        
        // TEMPORÁRIO: Permitir admin para teste
        // if (response.data.user.role !== 'customer') {
        //   this.logout()
        //   return false
        // }
        
        this.user = response.data.user
        this.isAuthenticated = true
        
        // Atualizar dados no localStorage caso tenham mudado
        localStorage.setItem('user', JSON.stringify(response.data.user))
        
        return true
      } catch (error) {
        console.error('Erro na verificação de autenticação:', error)
        this.logout()
        return false
      }
    }
  }
})
