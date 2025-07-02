import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function ({ store }) {
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

  // Inicializar autenticação antes de navegar
  Router.beforeEach(async (_to, _from, next) => {
    // Inicializar store de autenticação se não estiver no servidor
    if (!process.env.SERVER) {
      const { useAuthStore } = await import('src/stores/auth')
      const authStore = useAuthStore(store)
      
      // Verificar se precisamos inicializar auth
      if (authStore.token && !authStore.user) {
        try {
          await authStore.initAuth()
        } catch (error) {
          console.error('Erro ao inicializar auth:', error)
        }
      }
    }
    
    next()
  })

  return Router
})
