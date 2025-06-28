<template>
  <q-layout view="hHh lpR fFf">
    <q-header reveal elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          Barbearia App
        </q-toolbar-title>

        <!-- Botão de toggle do tema -->
        <q-btn
          flat
          round
          :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
          aria-label="Alternar tema"
          @click="toggleTheme"
          class="q-mr-sm theme-toggle-btn"
        >
          <q-tooltip>{{ $q.dark.isActive ? 'Tema claro' : 'Tema escuro' }}</q-tooltip>
        </q-btn>

        <!-- Botão de logout no header -->
        <q-btn
          flat
          round
          icon="logout"
          aria-label="Logout"
          @click="handleLogout"
        >
          <q-tooltip>Sair</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered class="drawer-container">
      <!-- Cabeçalho Admin -->
      <div class="bg-primary text-white q-pa-md drawer-header">
        <div class="row items-center q-gutter-sm">
          <q-icon name="admin_panel_settings" size="md" />
          <div>
            <div class="text-h6">Admin</div>
            <div class="text-caption opacity-70">Painel de Controle</div>
          </div>
        </div>
      </div>
      
      <!-- Menu Links Container -->
      <div class="drawer-content">
        <q-list class="q-pt-sm drawer-menu-list">
          <q-item to="/dashboard" clickable v-ripple exact-active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="dashboard" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Dashboard</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item to="/agendamentos" clickable v-ripple exact-active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="event" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Agendamentos</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item to="/barbeiros" clickable v-ripple exact-active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="person" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Barbeiros</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item to="/servicos" clickable v-ripple exact-active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="content_cut" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Serviços</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item to="/clientes" clickable v-ripple exact-active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="people" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Clientes</q-item-label>
            </q-item-section>
          </q-item>
          
          <q-item to="/relatorios" clickable v-ripple exact-active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="analytics" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Relatórios</q-item-label>
            </q-item-section>
          </q-item>

          <q-item to="/configuracoes" clickable v-ripple exact-active-class="bg-primary text-white">
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>
            <q-item-section>
              <q-item-label>Configurações</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- User Info Footer - Sempre fixo no bottom -->
      <div class="drawer-footer">
        <q-separator />
        <q-item class="user-info-item">
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white" size="40px">
              <q-icon name="person" />
            </q-avatar>
          </q-item-section>
          
          <q-item-section>
            <q-item-label class="text-weight-medium user-name">{{ authStore.userName }}</q-item-label>
            <q-item-label caption class="user-email">{{ authStore.user?.email || 'Administrador' }}</q-item-label>
          </q-item-section>
          
          <q-item-section side>
            <q-btn 
              flat 
              round 
              dense 
              icon="more_vert" 
              size="sm"
            >
              <q-menu>
                <q-list style="min-width: 150px">
                  <q-item clickable>
                    <q-item-section avatar>
                      <q-icon name="edit" />
                    </q-item-section>
                    <q-item-section>Perfil</q-item-section>
                  </q-item>
                  
                  <q-item clickable>
                    <q-item-section avatar>
                      <q-icon name="lock" />
                    </q-item-section>
                    <q-item-section>Senha</q-item-section>
                  </q-item>
                  
                  <q-separator />
                  
                  <q-item clickable @click="handleLogout">
                    <q-item-section avatar>
                      <q-icon name="logout" color="negative" />
                    </q-item-section>
                    <q-item-section>Sair</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-item-section>
        </q-item>
      </div>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useRouter } from 'vue-router'
import { Notify, Loading, useQuasar } from 'quasar'

const leftDrawerOpen = ref(false)
const authStore = useAuthStore()
const router = useRouter()
const $q = useQuasar()

function toggleLeftDrawer() {
  console.log('Toggle menu clicked!', leftDrawerOpen.value)
  leftDrawerOpen.value = !leftDrawerOpen.value
  console.log('New state:', leftDrawerOpen.value)
}

function toggleTheme() {
  $q.dark.toggle()
  
  // Salvar preferência no localStorage
  localStorage.setItem('darkMode', $q.dark.isActive.toString())
  
  Notify.create({
    type: 'positive',
    message: `Tema ${$q.dark.isActive ? 'escuro' : 'claro'} ativado`,
    position: 'bottom-right',
    icon: $q.dark.isActive ? 'dark_mode' : 'light_mode',
    timeout: 1500
  })
}

async function handleLogout() {
  console.log('Iniciando processo de logout...')
  
  try {
    // Mostrar loading
    Loading.show({
      message: 'Fazendo logout...'
    })
    
    await authStore.logout()
    
    Notify.create({
      type: 'positive',
      message: 'Logout realizado com sucesso!',
      position: 'bottom-right',
      icon: 'check_circle',
      timeout: 2000
    })
    
    console.log('Redirecionando para página de login...')
    router.push('/login')
    
  } catch (error) {
    console.error('Erro no logout:', error)
    Notify.create({
      type: 'negative',
      message: 'Erro ao fazer logout',
      position: 'bottom-right',
      icon: 'error',
      timeout: 3000
    })
    
    // Mesmo com erro, redirecionar para login
    router.push('/login')
  } finally {
    Loading.hide()
  }
}

// Inicializar autenticação e tema ao montar o componente
onMounted(async () => {
  await authStore.initAuth()
  
  // Carregar preferência de tema do localStorage
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode !== null) {
    $q.dark.set(savedDarkMode === 'true')
  }
})
</script>

<style scoped>
/* Container do drawer com layout flexbox */
.drawer-container {
  display: flex;
  flex-direction: column;
  height: 100vh !important;
  position: relative;
}

/* Header fixo do drawer */
.drawer-header {
  flex-shrink: 0; /* Não permite que o header encolha */
}

/* Área de conteúdo que pode fazer scroll */
.drawer-content {
  flex: 1; /* Ocupa todo o espaço disponível */
  overflow-y: auto; /* Permite scroll vertical */
  min-height: 0; /* Permite que o flex item encolha */
  padding-bottom: 80px; /* Espaço para o footer fixo */
}

/* Lista de menus sem height fixo */
.drawer-menu-list {
  /* Remove qualquer height ou overflow definido anteriormente */
  height: auto !important;
  overflow: visible !important;
}

/* Footer fixo do drawer - SEMPRE no bottom */
.drawer-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  flex-shrink: 0;
  z-index: 10;
}

/* Menu do usuário com melhor aparência */
.user-info-item {
  min-height: 72px;
  background: var(--q-primary);
}

/* Tema escuro - ajustar cores do menu do usuário */
.body--dark .user-info-item {
  background: var(--q-dark);
  border-top: 1px solid var(--q-dark-page);
}

.body--dark .user-name {
  color: white !important;
}

.body--dark .user-email {
  color: rgba(255, 255, 255, 0.7) !important;
}

/* Tema claro - ajustar cores do menu do usuário */
.body--light .user-info-item {
  background: #f5f5f5;
  border-top: 1px solid #e0e0e0;
}

.body--light .user-name {
  color: var(--q-primary) !important;
}

.body--light .user-email {
  color: #666 !important;
}

/* Botão de toggle do tema */
.theme-toggle-btn {
  transition: transform 0.3s ease;
}

.theme-toggle-btn:hover {
  transform: scale(1.1);
}

/* Responsividade para telas menores */
@media (max-width: 599px) {
  .drawer-container {
    width: 280px;
  }
}

/* Layout natural sem forçar scroll */

/* Remover scroll desnecessário quando o conteúdo não excede a viewport */
.q-layout {
  height: 100vh;
  overflow: hidden;
}

.q-page-container {
  height: auto;
  overflow: visible;
}

/* Permitir que as páginas tenham scroll próprio apenas quando necessário */
.q-page {
  overflow-y: auto;
  max-height: calc(100vh - 56px); /* Altura menos o header */
}
</style>
