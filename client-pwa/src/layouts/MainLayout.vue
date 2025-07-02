<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title class="text-weight-bold">
          <q-icon name="content_cut" class="q-mr-sm" />
          Barbearia
        </q-toolbar-title>

        <!-- Botão de perfil/logout -->
        <q-btn flat round icon="account_circle">
          <q-tooltip>Menu do usuário</q-tooltip>
          <q-menu anchor="bottom right" self="top right">
            <q-list style="min-width: 150px">
              <q-item clickable v-close-popup @click="goToProfile">
                <q-item-section avatar>
                  <q-icon name="person" />
                </q-item-section>
                <q-item-section>Perfil</q-item-section>
              </q-item>
              <q-separator />
              <q-item clickable v-close-popup @click="logout">
                <q-item-section avatar>
                  <q-icon name="logout" />
                </q-item-section>
                <q-item-section>Sair</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="bg-grey-1"
    >
      <q-list>
        <q-item-label header class="text-primary text-weight-bold">
          <q-icon name="content_cut" class="q-mr-sm" />
          Menu
        </q-item-label>

        <NavigationLink
          v-for="link in navigationLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list>

      <!-- Informações do usuário no drawer -->
      <div class="absolute-bottom q-pa-md bg-primary text-white" v-if="authStore.user">
        <div class="text-body2 text-weight-medium">{{ authStore.user.name }}</div>
        <div class="text-caption opacity-80">{{ authStore.user.email }}</div>
      </div>
    </q-drawer>

    <q-page-container class="main-container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores'
import NavigationLink from 'components/NavigationLink.vue'

const router = useRouter()
const authStore = useAuthStore()

const leftDrawerOpen = ref(false)

// Debug: verificar estado da autenticação
onMounted(() => {
  console.log('MainLayout carregado')
  console.log('Usuário autenticado:', authStore.isAuthenticated)
  console.log('Dados do usuário:', authStore.user)
  console.log('Token:', authStore.token ? 'presente' : 'ausente')
})

// Links de navegação
const navigationLinks = [
  {
    title: 'Início',
    caption: 'Página inicial',
    icon: 'home',
    route: '/'
  },
  {
    title: 'Novo Agendamento',
    caption: 'Agendar um horário',
    icon: 'add_circle',
    route: '/appointment/new'
  },
  {
    title: 'Meus Agendamentos',
    caption: 'Ver agendamentos',
    icon: 'schedule',
    route: '/appointments'
  }
]

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function goToProfile() {
  console.log('Navegando para perfil')
  router.push('/profile')
}

function logout() {
  console.log('Fazendo logout...')
  authStore.logout()
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.main-container {
  width: 100%;
  overflow-x: hidden;
}

// Garantir que no mobile não há scroll horizontal
@media (max-width: 599px) {
  .main-container {
    padding: 0;
  }
}
</style>
