# 🎨 Frontend - Barbearia App

Interface moderna e responsiva desenvolvida com Vue 3 e Quasar Framework para o sistema de gerenciamento de barbearia.

## 🚀 Tecnologias

- **Vue 3** - Framework JavaScript progressivo com Composition API
- **Quasar Framework** - Framework Vue.js com componentes Material Design
- **Pinia** - Store reativo para gerenciamento de estado
- **Vue Router** - Roteamento oficial do Vue.js
- **Axios** - Cliente HTTP para comunicação com a API
- **Vite** - Build tool rápido e moderno

## 📱 Funcionalidades

### ✅ Implementadas
- 🔐 **Sistema de autenticação** com JWT
- 📊 **Dashboard responsivo** com cards de métricas
- 🎨 **Interface moderna** com Material Design
- 🛡️ **Proteção de rotas** com middleware
- 💬 **Notificações elegantes** com feedback visual
- 📱 **Design responsivo** para todos os dispositivos
- 🌙 **Loading states** para melhor UX

### 🔄 Em Desenvolvimento
- 📅 Interface de agendamentos
- 👨‍💼 Gestão de barbeiros
- 🛍️ Catálogo de serviços
- 👥 CRUD de clientes
- 📈 Dashboards analíticos

## 🏗️ Estrutura de Pastas

```
src/
├── components/         # Componentes reutilizáveis
│   ├── NavigationLink.vue
│   ├── BarChart.vue
│   └── LineChart.vue
├── layouts/           # Layouts da aplicação
│   └── MainLayout.vue
├── pages/             # Páginas/Views
│   ├── IndexPage.vue      # Dashboard
│   ├── LoginPage.vue      # Autenticação
│   ├── AgendamentosPage.vue
│   ├── BarbeirosPage.vue
│   ├── ClientesPage.vue
│   ├── ServicosPage.vue
│   └── RelatoriosPage.vue
├── router/            # Configuração de rotas
│   ├── index.js
│   ├── routes.js
│   └── middleware.js
├── stores/            # Gerenciamento de estado
│   ├── index.js
│   ├── auth.js           # Store de autenticação
│   └── example-store.js
├── boot/              # Plugins e configurações
│   └── axios.js
├── css/               # Estilos globais
│   ├── app.scss
│   └── quasar.variables.scss
└── App.vue            # Componente raiz
```

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev
# ou
quasar dev

# Build para produção
npm run build
# ou
quasar build

# Linting
npm run lint
npm run lint:fix
```

## ⚙️ Configuração

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do frontend:

```env
# URL da API
VITE_API_URL=http://localhost:3000

# Outras configurações
VITE_APP_NAME=Barbearia App
VITE_APP_VERSION=1.0.0
```

## 🎯 Rotas

```javascript
const routes = [
  {
    path: '/login',
    component: LoginPage,
    beforeEnter: requireGuest  // Apenas usuários não autenticados
  },
  {
    path: '/',
    component: MainLayout,
    beforeEnter: requireAuth,  // Apenas usuários autenticados
    children: [
      { path: '', redirect: 'dashboard' },
      { path: 'dashboard', component: IndexPage },
      { path: 'agendamentos', component: AgendamentosPage },
      { path: 'barbeiros', component: BarbeirosPage },
      { path: 'servicos', component: ServicosPage },
      { path: 'clientes', component: ClientesPage },
      { path: 'relatorios', component: RelatoriosPage }
    ]
  }
]
```

## 🔐 Sistema de Autenticação

### Store de Autenticação (Pinia)
```javascript
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false
  }),
  
  actions: {
    async login(credentials) {
      // Implementação do login
    },
    
    async logout() {
      // Implementação do logout
    },
    
    async fetchUser() {
      // Buscar dados do usuário autenticado
    }
  }
})
```

### Middleware de Rotas
- **requireAuth**: Redireciona para login se não autenticado
- **requireGuest**: Redireciona para dashboard se já autenticado

## 💅 Estilização

### Design System
- **Cores primárias**: Definidas em `quasar.variables.scss`
- **Componentes**: Baseados no Material Design (Quasar)
- **Responsividade**: CSS Grid e Flexbox
- **Animações**: Transições suaves com CSS

## 📱 Responsividade

### Breakpoints
- **xs**: < 600px (mobile)
- **sm**: 600px - 960px (tablet)
- **md**: 960px - 1280px (desktop pequeno)
- **lg**: 1280px - 1920px (desktop)
- **xl**: > 1920px (desktop grande)

## 🔧 Desenvolvimento

### Estrutura de Componentes
```vue
<template>
  <!-- Template clean e semântico -->
</template>

<script setup>
// Composition API
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
</script>

<style scoped>
/* Estilos específicos do componente */
</style>
```

---

💡 **Dica**: Para uma experiência completa, certifique-se de que o backend esteja rodando na porta 3000.
