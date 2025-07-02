const routes = [
  // Rotas públicas (sem autenticação)
  {
    path: '/login', 
    name: 'login',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { 
        path: '', 
        component: () => import('pages/LoginPage.vue') 
      }
    ]
  },
  {
    path: '/register', 
    name: 'register',
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { 
        path: '', 
        component: () => import('pages/RegisterPage.vue') 
      }
    ]
  },

  // Rotas autenticadas (para clientes)
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { 
        path: '', 
        name: 'home',
        component: () => import('pages/HomePage.vue') 
      },
      { 
        path: '/appointment/new', 
        name: 'new-appointment',
        component: () => import('pages/NewAppointmentPage.vue') 
      },
      { 
        path: '/appointments', 
        name: 'my-appointments',
        component: () => import('pages/MyAppointmentsPage.vue') 
      },
      { 
        path: '/profile', 
        name: 'profile',
        component: () => import('pages/ProfilePage.vue') 
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
