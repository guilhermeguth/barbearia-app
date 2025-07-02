import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import { useAuthStore } from 'src/stores/auth'
import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function () {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  // Guard de autenticação
  Router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore()
    
    // Verificar se a rota requer autenticação
    if (to.matched.some(record => record.meta.requiresAuth)) {
      // Verificar se tem token no localStorage mesmo que a store não esteja inicializada
      const token = localStorage.getItem('token')
      
      if (!authStore.isAuthenticated && !token) {
        // Não autenticado, redirecionar para login
        console.log('Redirecionando para login - não autenticado')
        next('/login')
        return
      }
      
      // Se tem token mas a store não está marcada como autenticada, inicializar
      if (!authStore.isAuthenticated && token) {
        authStore.initAuth()
      }
    }
    
    // Se está tentando acessar login/register estando autenticado
    if ((to.name === 'login' || to.name === 'register') && authStore.isAuthenticated) {
      console.log('Usuário já autenticado, redirecionando para home')
      next('/')
      return
    }
    
    next()
  })

  return Router
})
