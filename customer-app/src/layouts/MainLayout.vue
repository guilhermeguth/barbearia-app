<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn
          aria-label="Menu"
          flat
          dense
          round
          icon="menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title class="text-weight-bold">
          <q-icon name="content_cut" class="q-mr-sm" />
          Barbearia
        </q-toolbar-title>

        <!-- Botão de perfil/logout com miniatura da foto -->
        <q-btn flat round class="profile-btn">
          <q-avatar size="32px" class="profile-avatar">
            <img 
              v-if="userPhoto" 
              :src="userPhoto" 
              alt="Perfil"
              @error="handlePhotoError" 
            />
            <q-icon 
              v-else 
              name="account_circle" 
              size="32px" 
              color="white" 
            />
          </q-avatar>
          <q-tooltip>Menu do usuário</q-tooltip>
          <q-menu anchor="bottom right" self="top right">
            <q-list style="min-width: 150px">
              <q-item v-close-popup clickable @click="goToProfile">
                <q-item-section avatar>
                  <q-avatar size="28px">
                    <img 
                      v-if="userPhoto" 
                      :src="userPhoto" 
                      alt="Perfil"
                      @error="handlePhotoError" 
                    />
                    <q-icon 
                      v-else 
                      name="person" 
                      color="primary"
                    />
                  </q-avatar>
                </q-item-section>
                <q-item-section>Perfil</q-item-section>
              </q-item>
              <q-separator />
              <q-item v-close-popup clickable @click="logout">
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
      class="bg-grey-1 drawer-container"
    >
      <!-- Conteúdo do drawer com scroll -->
      <div class="drawer-content">
        <q-list>
          <q-item-label header class="text-primary text-weight-bold">
            <q-icon name="content_cut" class="q-mr-sm" />
            Menu
          </q-item-label>

          <q-item
            v-for="link in navigationLinks"
            :key="link.title"
            v-ripple
            :to="link.route"
            exact
            exact-active-class="menu-link-active"
            clickable
          >
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.title }}</q-item-label>
              <q-item-label v-if="link.caption" caption>{{ link.caption }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- Informações do usuário no drawer (estilo admin panel) -->
      <div v-if="authStore.user" class="drawer-footer">
        <q-separator />
        <q-item class="user-info-item" :clickable="false">
          <q-item-section avatar>
            <q-avatar color="primary" text-color="white" size="40px">
              <img 
                v-if="userPhoto" 
                :src="userPhoto" 
                :alt="`Foto de ${authStore.user.name}`"
                style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"
                @error="handlePhotoError"
              />
              <q-icon v-else name="person" />
            </q-avatar>
          </q-item-section>
          
          <q-item-section>
            <q-item-label class="text-weight-medium user-name">{{ authStore.user.name }}</q-item-label>
            <q-item-label caption class="user-email">{{ authStore.user.email }}</q-item-label>
          </q-item-section>
        </q-item>
      </div>
    </q-drawer>

    <q-page-container class="main-container">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from 'src/stores'
import { api } from 'src/boot/axios'

const router = useRouter()
const authStore = useAuthStore()

const leftDrawerOpen = ref(false)
const photoError = ref(false)
const photoTimestamp = ref(new Date().getTime())

// Função para obter a URL da foto do usuário
const getPhotoUrl = (photo) => {
  if (!photo) {
    return null
  }
  
  if (photo.startsWith('http')) {
    return `${photo}${photo.includes('?') ? '&' : '?'}t=${photoTimestamp.value}`
  }
  
  const baseURL = api.defaults.baseURL || 'http://localhost:3001'
  return `${baseURL}/uploads/users/${photo}?t=${photoTimestamp.value}`
}

// Computar a URL da foto baseada nos dados do usuário
const userPhoto = computed(() => {
  if (photoError.value) {
    return null
  }
  
  const user = authStore.user
  if (!user) {
    return null
  }
  
  // Tentar usar photo ou photoUrl
  const photoUrl = user.photo || user.photoUrl
  if (!photoUrl) {
    return null
  }
  
  // Log para debug (remover depois)
  // console.log('Computando userPhoto:', photoUrl)
  
  return getPhotoUrl(photoUrl)
})

// Atualizar timestamp da foto quando os dados do usuário mudarem
watch(() => authStore.user?.photo, (newPhoto, oldPhoto) => {
  if (newPhoto !== oldPhoto) {
    // console.log('Foto do usuário mudou, atualizando timestamp')
    updatePhotoTimestamp()
    photoError.value = false
  }
}, { immediate: false })

// Também observar photoUrl
watch(() => authStore.user?.photoUrl, (newPhotoUrl, oldPhotoUrl) => {
  if (newPhotoUrl !== oldPhotoUrl) {
    // console.log('PhotoUrl do usuário mudou, atualizando timestamp')
    updatePhotoTimestamp()
    photoError.value = false
  }
}, { immediate: false })

// Atualizar timestamp da foto
const updatePhotoTimestamp = () => {
  photoTimestamp.value = new Date().getTime()
}

// Lidar com erro ao carregar a foto
// Função para lidar com erros de carregamento da foto
const handlePhotoError = (e) => {
  console.error('Erro ao carregar a foto de perfil na navegação')
  photoError.value = true
  
  // Esconder o elemento de imagem com erro
  if (e && e.target) {
    e.target.style.display = 'none'
  }
}

// Debug: verificar estado da autenticação
onMounted(() => {
  console.log('MainLayout carregado')
  console.log('Usuário autenticado:', authStore.isAuthenticated)
  console.log('Dados do usuário:', authStore.user)
  console.log('Foto de perfil:', userPhoto.value)
  
  // Resetar o erro de foto a cada montagem
  photoError.value = false
  // Atualizar o timestamp para forçar recarga da imagem
  updatePhotoTimestamp()
})

// Links de navegação (usado no v-for na linha ~82)
const navigationLinks = ref([
  {
    title: 'Início',
    caption: 'Página inicial',
    icon: 'home',
    route: '/',
    exact: true
  },
  {
    title: 'Novo Agendamento',
    caption: 'Agendar um horário',
    icon: 'add_circle',
    route: '/appointment/new',
    exact: true
  },
  {
    title: 'Meus Agendamentos',
    caption: 'Ver agendamentos',
    icon: 'schedule',
    route: '/appointments',
    exact: true
  }
])

// Funções para interações de UI
// Usado no botão com @click="toggleLeftDrawer" na linha ~11
const toggleLeftDrawer = () => {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

// Usado nos itens de menu com @click="goToProfile" nas linhas ~38 e ~131
const goToProfile = () => {
  console.log('Navegando para perfil')
  router.push('/profile')
}

// Usado nos itens de menu com @click="logout" nas linhas ~57 e ~140
const logout = () => {
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

// Estilo para o botão de perfil
.profile-btn {
  padding: 3px;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
}

// Estilo para o avatar de perfil no cabeçalho
.profile-avatar {
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  border: 2px solid rgba(255,255,255,0.7);
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
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
  padding: 8px 16px;
  
  /* Desabilitar efeito de hover para o item do usuário */
  &:hover {
    background: var(--q-primary) !important; /* Força o mesmo background mesmo no hover */
  }
  
  .user-name {
    color: white !important;
    font-size: 0.95rem;
    font-weight: 500;
    margin-bottom: 2px;
  }
  
  .user-email {
    color: rgba(255, 255, 255, 0.8) !important;
    font-size: 0.8rem;
  }
}

/* Estrutura do drawer com flexbox para posicionamento correto do footer */
.drawer-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* Área de conteúdo que pode fazer scroll */
.drawer-content {
  flex: 1; /* Ocupa todo o espaço disponível */
  overflow-y: auto; /* Permite scroll vertical */
  min-height: 0; /* Permite que o flex item encolha */
  padding-bottom: 80px; /* Espaço para o footer fixo */
}

// Estilos globais para o layout
.drawer-content .q-item {
  transition: background-color 0.3s ease, color 0.3s ease;
  
  // Remover qualquer estilo de hover padrão do Quasar
  &:hover {
    background: transparent;
  }
}

// Estilo personalizado para o item de menu ativo
.menu-link-active {
  background-color: var(--q-primary) !important;
  color: white !important;
}

// Assegurando que o item de usuário nunca tenha hover
.user-info-item.q-item {
  cursor: default !important;
  
  &:hover {
    background: var(--q-primary) !important;
    color: white !important;
  }
}
</style>
