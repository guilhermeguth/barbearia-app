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

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <!-- Cabeçalho Admin -->
      <div class="bg-primary text-white q-pa-md">
        <div class="row items-center q-gutter-sm">
          <q-icon name="admin_panel_settings" size="md" />
          <div>
            <div class="text-h6">Admin</div>
            <div class="text-caption opacity-70">Painel de Controle</div>
          </div>
        </div>
      </div>
      
      <!-- Menu Links -->
      <q-list class="q-pt-sm" style="height: calc(100% - 160px); overflow-y: auto;">
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
      </q-list>

      <!-- User Info Footer -->
      <div class="absolute-bottom">
        <q-separator />
        <q-item class="bg-grey-1">
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white" size="40px">
              <q-icon name="person" />
            </q-avatar>
          </q-item-section>
          
          <q-item-section>
            <q-item-label class="text-weight-medium">{{ authStore.userName }}</q-item-label>
            <q-item-label caption class="text-grey-7">{{ authStore.user?.email || 'Administrador' }}</q-item-label>
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
import { Notify, Loading } from 'quasar'

const leftDrawerOpen = ref(false)
const authStore = useAuthStore()
const router = useRouter()

function toggleLeftDrawer() {
  console.log('Toggle menu clicked!', leftDrawerOpen.value)
  leftDrawerOpen.value = !leftDrawerOpen.value
  console.log('New state:', leftDrawerOpen.value)
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

// Inicializar autenticação ao montar o componente
onMounted(async () => {
  await authStore.initAuth()
})
</script>
