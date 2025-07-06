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

        // Tentar carregar dados completos do usuário (incluindo foto)
        try {
          await this.loadUser()
        } catch (error) {
          console.warn('Falha ao carregar dados completos do usuário após login:', error)
          // Não falhar o login se não conseguir carregar dados completos
        }

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
    },

    // Carregar dados do usuário
    async loadUser() {
      try {
        const response = await api.get('/auth/authenticate')
        
        // Garantir que temos todos os campos necessários
        const userData = response.data.user
        
        // Se o usuário já existia na store, manter qualquer campo que não foi retornado pela API
        if (this.user && userData) {
          // Preservar campos importantes como a foto, se não estiverem presentes no retorno da API
          if (this.user.photo && !userData.photo && !userData.photoUrl) {
            userData.photo = this.user.photo
          }
          
          // Se a API retornar photoUrl, garantir que photo também seja atualizado para compatibilidade
          if (!userData.photo && userData.photoUrl) {
            userData.photo = userData.photoUrl
          }
          
          // Fazer o mesmo com photoUrl
          if (!userData.photoUrl && userData.photo) {
            userData.photoUrl = userData.photo
          }
        }
        
        // Log para debug
        console.log('Dados carregados do servidor:', userData)
        console.log('Foto do usuário:', userData.photo || userData.photoUrl)
        
        this.user = userData
        this.isAuthenticated = true
        
        // Atualizar dados no localStorage
        localStorage.setItem('user', JSON.stringify(userData))
        console.log('Usuário atualizado na store após loadUser:', userData)
        
        return userData
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error)
        this.logout()
        throw error
      }
    },

    // Atualizar dados do usuário na store (útil quando perfil é modificado)
    updateUser(userData) {
      if (userData) {
        // Mesclar dados novos com os existentes
        this.user = { ...this.user, ...userData }
        
        // Atualizar localStorage
        localStorage.setItem('user', JSON.stringify(this.user))
        
        console.log('Dados do usuário atualizados:', this.user)
      }
    },

    // Atualizar foto do usuário especificamente
    updateUserPhoto(photoUrl) {
      if (this.user) {
        this.user.photo = photoUrl
        this.user.photoUrl = photoUrl
        
        // Atualizar localStorage
        localStorage.setItem('user', JSON.stringify(this.user))
        
        console.log('Foto do usuário atualizada:', photoUrl)
      }
    }
  }
})
