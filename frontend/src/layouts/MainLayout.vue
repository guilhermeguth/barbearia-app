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
              <img 
                v-if="authStore.user?.photoUrl" 
                :src="authStore.user.photoUrl" 
                :alt="`Foto de ${authStore.userName}`"
                @error="$event.target.style.display = 'none'"
                style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"
              />
              <q-icon v-else name="person" />
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
                  <q-item clickable @click="openProfileDialog">
                    <q-item-section avatar>
                      <q-icon name="edit" />
                    </q-item-section>
                    <q-item-section>Perfil</q-item-section>
                  </q-item>
                  
                  <q-item clickable @click="openChangePasswordDialog">
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

  <!-- Dialog de alteração de senha -->
  <q-dialog v-model="showChangePasswordDialog" persistent>
    <q-card style="min-width: 400px">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">
          <q-icon name="lock" class="q-mr-sm" />
          Alterar Senha
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="changePassword" class="q-gutter-md">
          <!-- Senha atual -->
          <q-input
            v-model="passwordForm.currentPassword"
            :type="showCurrentPassword ? 'text' : 'password'"
            label="Senha atual"
            outlined
            :rules="[val => !!val || 'Senha atual é obrigatória']"
            prepend-icon="lock_outline"
            autocomplete="current-password"
          >
            <template #append>
              <q-icon
                :name="showCurrentPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showCurrentPassword = !showCurrentPassword"
              />
            </template>
          </q-input>

          <!-- Nova senha -->
          <q-input
            v-model="passwordForm.newPassword"
            :type="showNewPassword ? 'text' : 'password'"
            label="Nova senha"
            outlined
            :rules="[
              val => !!val || 'Nova senha é obrigatória',
              val => val.length >= 6 || 'Nova senha deve ter pelo menos 6 caracteres'
            ]"
            prepend-icon="lock"
            autocomplete="new-password"
            hint="Mínimo de 6 caracteres"
          >
            <template #append>
              <q-icon
                :name="showNewPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showNewPassword = !showNewPassword"
              />
            </template>
          </q-input>

          <!-- Confirmar nova senha -->
          <q-input
            v-model="passwordForm.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            label="Confirmar nova senha"
            outlined
            :rules="[
              val => !!val || 'Confirmação é obrigatória',
              val => val === passwordForm.newPassword || 'Senhas não coincidem'
            ]"
            prepend-icon="lock_clock"
            autocomplete="new-password"
          >
            <template #append>
              <q-icon
                :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showConfirmPassword = !showConfirmPassword"
              />
            </template>
          </q-input>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          label="Cancelar"
          @click="closeChangePasswordDialog"
          color="grey-7"
        />
        <q-btn
          @click="changePassword"
          color="primary"
          label="Alterar Senha"
          :loading="changingPassword"
          :disable="!isPasswordFormValid"
          unelevated
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Dialog de perfil -->
  <q-dialog v-model="showProfileDialog" persistent>
    <q-card style="min-width: 500px">
      <q-card-section class="bg-primary text-white">
        <div class="text-h6">
          <q-icon name="edit" class="q-mr-sm" />
          Editar Perfil
        </div>
      </q-card-section>

      <q-card-section>
        <q-form @submit.prevent="updateProfile" class="q-gutter-md">
          <!-- Preview da foto atual -->
          <div class="text-center q-mb-md">
            <q-avatar size="80px" class="q-mb-sm">
              <img 
                v-if="profileForm.photoPreview || authStore.user?.photoUrl" 
                :src="profileForm.photoPreview || authStore.user?.photoUrl" 
                :alt="`Foto de ${profileForm.name || 'usuário'}`"
                style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"
                @error="$event.target.style.display = 'none'"
              />
              <q-icon v-else name="person" size="40px" color="grey-5" />
            </q-avatar>
            <div class="text-caption text-grey-6">
              {{ profileForm.photoPreview ? 'Nova foto selecionada' : 'Foto atual' }}
            </div>
          </div>

          <!-- Upload de foto -->
          <q-file
            v-model="profileForm.photoFile"
            label="Alterar foto de perfil"
            outlined
            accept="image/*"
            max-file-size="5242880"
            @update:model-value="onProfilePhotoSelected"
            @rejected="onProfilePhotoRejected"
            prepend-icon="photo_camera"
            hint="Formatos aceitos: JPG, PNG, GIF, WebP (máximo 5MB)"
            clearable
            @clear="clearProfilePhoto"
          >
            <template #prepend>
              <q-icon name="photo_camera" />
            </template>
          </q-file>

          <!-- Nome -->
          <q-input
            v-model="profileForm.name"
            label="Nome completo"
            outlined
            :rules="[val => !!val || 'Nome é obrigatório']"
            prepend-icon="person"
          />

          <!-- Email -->
          <q-input
            v-model="profileForm.email"
            type="email"
            label="Email"
            outlined
            :rules="[
              val => !!val || 'Email é obrigatório',
              val => val.includes('@') || 'Email deve ser válido'
            ]"
            prepend-icon="email"
          />
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          label="Cancelar"
          @click="closeProfileDialog"
          color="grey-7"
        />
        <q-btn
          @click="updateProfile"
          color="primary"
          label="Salvar"
          :loading="updatingProfile"
          :disable="!isProfileFormValid"
          unelevated
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { useRouter } from 'vue-router'
import { Notify, Loading, useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const leftDrawerOpen = ref(false)
const authStore = useAuthStore()
const router = useRouter()
const $q = useQuasar()

// Estados para alteração de senha
const showChangePasswordDialog = ref(false)
const changingPassword = ref(false)
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// Estados para perfil
const showProfileDialog = ref(false)
const updatingProfile = ref(false)

const profileForm = ref({
  name: '',
  email: '',
  photoFile: null,
  photoPreview: null
})

// Computed para validação do formulário de senha
const isPasswordFormValid = computed(() => {
  return passwordForm.value.currentPassword &&
         passwordForm.value.newPassword &&
         passwordForm.value.confirmPassword &&
         passwordForm.value.newPassword.length >= 6 &&
         passwordForm.value.newPassword === passwordForm.value.confirmPassword
})

// Computed para validação do formulário de perfil
const isProfileFormValid = computed(() => {
  return profileForm.value.name &&
         profileForm.value.email &&
         profileForm.value.email.includes('@')
})

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

// Funções para alteração de senha
function openChangePasswordDialog() {
  showChangePasswordDialog.value = true
}

function closeChangePasswordDialog() {
  showChangePasswordDialog.value = false
  passwordForm.value = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  }
  showCurrentPassword.value = false
  showNewPassword.value = false
  showConfirmPassword.value = false
}

async function changePassword() {
  if (!isPasswordFormValid.value) {
    Notify.create({
      type: 'warning',
      message: 'Preencha todos os campos corretamente',
      position: 'bottom-right'
    })
    return
  }

  changingPassword.value = true

  try {
    await api.post('/user/change-password', {
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })

    Notify.create({
      type: 'positive',
      message: 'Senha alterada com sucesso!',
      position: 'bottom-right',
      icon: 'check_circle',
      timeout: 3000
    })

    closeChangePasswordDialog()

  } catch (error) {
    console.error('Erro ao alterar senha:', error)
    
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || 'Erro ao alterar senha',
      position: 'bottom-right',
      icon: 'error',
      timeout: 4000
    })
  } finally {
    changingPassword.value = false
  }
}

// Funções para perfil
function openProfileDialog() {
  // Carregar dados atuais do usuário
  profileForm.value = {
    name: authStore.user?.name || '',
    email: authStore.user?.email || '',
    photoFile: null,
    photoPreview: authStore.user?.photoUrl || null // Mostrar foto atual se existir
  }
  showProfileDialog.value = true
}

function closeProfileDialog() {
  showProfileDialog.value = false
  profileForm.value = {
    name: '',
    email: '',
    photoFile: null,
    photoPreview: null
  }
}

function onProfilePhotoSelected(file) {
  if (file) {
    // Criar preview da imagem
    const reader = new FileReader()
    reader.onload = (e) => {
      profileForm.value.photoPreview = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

function onProfilePhotoRejected(rejectedEntries) {
  const rejection = rejectedEntries[0]
  let message = 'Erro ao selecionar arquivo'
  
  if (rejection.failedPropValidation === 'max-file-size') {
    message = 'Arquivo muito grande. Máximo 5MB'
  } else if (rejection.failedPropValidation === 'accept') {
    message = 'Tipo de arquivo não aceito. Use apenas imagens'
  }
  
  Notify.create({
    type: 'negative',
    message,
    position: 'bottom-right',
    icon: 'error'
  })
}

function clearProfilePhoto() {
  profileForm.value.photoFile = null
  profileForm.value.photoPreview = null
}

async function updateProfile() {
  if (!isProfileFormValid.value) {
    Notify.create({
      type: 'warning',
      message: 'Preencha todos os campos corretamente',
      position: 'bottom-right'
    })
    return
  }

  updatingProfile.value = true

  try {
    // Criar FormData para envio do arquivo
    const formData = new FormData()
    formData.append('name', profileForm.value.name)
    formData.append('email', profileForm.value.email)
    
    // Adicionar foto se selecionada
    if (profileForm.value.photoFile) {
      formData.append('photo', profileForm.value.photoFile)
    }

    const response = await api.post('/user/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    // Atualizar dados no store diretamente com a resposta
    if (response.data.user) {
      authStore.user = response.data.user
      localStorage.setItem('user_data', JSON.stringify(response.data.user))
    }

    Notify.create({
      type: 'positive',
      message: 'Perfil atualizado com sucesso!',
      position: 'bottom-right',
      icon: 'check_circle',
      timeout: 3000
    })

    closeProfileDialog()

  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || 'Erro ao atualizar perfil',
      position: 'bottom-right',
      icon: 'error',
      timeout: 4000
    })
  } finally {
    updatingProfile.value = false
  }
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
