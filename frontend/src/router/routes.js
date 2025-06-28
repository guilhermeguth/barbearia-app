import { requireAuth, requireGuest } from './middleware'

const routes = [
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
    beforeEnter: requireGuest
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    beforeEnter: requireAuth,
    children: [
      { 
        path: '', 
        redirect: 'dashboard' 
      },
      { 
        path: 'dashboard', 
        component: () => import('pages/IndexPage.vue'),
        name: 'dashboard'
      },
      { 
        path: 'agendamentos', 
        component: () => import('pages/AgendamentosPage.vue'),
        name: 'agendamentos'
      },
      { 
        path: 'barbeiros', 
        component: () => import('pages/BarbeirosPage.vue'),
        name: 'barbeiros'
      },
      { 
        path: 'servicos', 
        component: () => import('pages/ServicosPage.vue'),
        name: 'servicos'
      },
      { 
        path: 'clientes', 
        component: () => import('pages/ClientesPage.vue'),
        name: 'clientes'
      },
      { 
        path: 'relatorios', 
        component: () => import('pages/RelatoriosPage.vue'),
        name: 'relatorios'
      },
      { 
        path: 'configuracoes', 
        component: () => import('pages/ConfiguracoesPage.vue'),
        name: 'configuracoes'
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
