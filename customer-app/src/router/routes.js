const routes = [
  // Rotas públicas (sem autenticação)
  {
    path: '/login', 
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { 
        path: '', 
        name: 'login',
        component: () => import('pages/LoginPage.vue') 
      }
    ]
  },
  {
    path: '/register', 
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { 
        path: '', 
        name: 'register',
        component: () => import('pages/RegisterPage.vue') 
      }
    ]
  },
  {
    path: '/reset-password', 
    component: () => import('layouts/AuthLayout.vue'),
    children: [
      { 
        path: '', 
        name: 'reset-password',
        component: () => import('pages/ResetPasswordPage.vue') 
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
