import { useAuthStore } from 'src/stores/auth'

// Middleware para rotas que precisam de autenticação
export async function requireAuth(to, from, next) {
  const authStore = useAuthStore()
  
  console.log('requireAuth middleware - isAuthenticated:', authStore.isAuthenticated)
  console.log('requireAuth middleware - token:', authStore.token)
  console.log('requireAuth middleware - user:', authStore.user)
  
  // Se não estiver autenticado, redirecionar para login
  if (!authStore.isAuthenticated) {
    console.log('Usuário não autenticado, redirecionando para /login')
    next('/login')
    return
  }
  
  // Se token existe mas usuário não, tentar buscar dados
  if (authStore.token && !authStore.user) {
    console.log('Token existe mas usuário não, buscando dados...')
    const success = await authStore.fetchUser()
    if (!success) {
      console.log('Falha ao buscar usuário, redirecionando para /login')
      next('/login')
      return
    }
  }
  
  console.log('Usuário autenticado, continuando para', to.path)
  next()
}

// Middleware para rotas que só devem ser acessadas por usuários não autenticados
export function requireGuest(to, from, next) {
  const authStore = useAuthStore()
  
  console.log('requireGuest middleware - isAuthenticated:', authStore.isAuthenticated)
  console.log('requireGuest middleware - token:', authStore.token)
  console.log('requireGuest middleware - user:', authStore.user)
  
  if (authStore.isAuthenticated) {
    console.log('Usuário já autenticado, redirecionando para /')
    next('/')
    return
  }
  
  console.log('Usuário não autenticado, continuando para', to.path)
  next()
}

// Middleware para verificar permissões específicas
export function requireRole(allowedRoles) {
  return function(to, from, next) {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      next('/login')
      return
    }
    
    if (allowedRoles.includes(authStore.userRole)) {
      next()
    } else {
      next('/unauthorized')
    }
  }
}
