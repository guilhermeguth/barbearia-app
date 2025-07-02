import { defineBoot } from '#q-app/wrappers'
import { useAuthStore } from 'src/stores'

export default defineBoot(async ({ router }) => {
  const authStore = useAuthStore()
  
  // Inicializar autenticação a partir do localStorage
  authStore.initAuth()
  
  // Configurar listener para sincronização entre abas
  authStore.setupStorageListener()
  
  // Se estiver autenticado, verificar se o token ainda é válido
  if (authStore.isAuthenticated && authStore.token) {
    try {
      console.log('Verificando validade do token...')
      const isValid = await authStore.checkAuth()
      
      if (!isValid) {
        console.log('Token inválido, fazendo logout')
        authStore.logout()
        
        // Redirecionar para login se não estiver numa rota pública
        const currentRoute = router.currentRoute.value
        if (currentRoute && currentRoute.matched.some(record => record.meta.requiresAuth)) {
          await router.push('/login')
        }
      } else {
        console.log('Usuário autenticado:', authStore.user?.name)
      }
    } catch (error) {
      console.error('Erro na verificação de autenticação:', error)
      authStore.logout()
    }
  }
})
