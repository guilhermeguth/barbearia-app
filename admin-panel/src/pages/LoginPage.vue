<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center login-page">
        <!-- Botão de tema no canto superior direito -->
        <div class="absolute-top-right q-pa-md">
          <q-btn
            flat
            round
            :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'"
            aria-label="Alternar tema"
            @click="toggleTheme"
            class="theme-toggle-btn"
          >
            <q-tooltip>{{ $q.dark.isActive ? 'Tema claro' : 'Tema escuro' }}</q-tooltip>
          </q-btn>
        </div>

        <div class="login-container">
          <!-- Logo/Header -->
          <div class="text-center q-mb-lg">
            <q-icon name="content_cut" size="4rem" color="primary" />
            <h4 class="q-ma-sm login-title">{{ businessName }} - Admin</h4>
            <p class="login-subtitle">Faça login para acessar o sistema</p>
          </div>

          <!-- Formulário de Login -->
          <q-card class="login-card">
            <q-card-section>
              <q-form @submit.prevent="handleLogin" class="q-gutter-md">
                <!-- Email -->
                <q-input
                  v-model="form.email"
                  type="email"
                  label="Email"
                  outlined
                  :rules="[val => !!val || 'Email é obrigatório']"
                  prepend-icon="email"
                  @keydown.enter="handleLogin"
                />

                <!-- Senha -->
                <q-input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  label="Senha"
                  outlined
                  :rules="[val => !!val || 'Senha é obrigatória']"
                  prepend-icon="lock"
                  @keydown.enter="handleLogin"
                >
                  <template v-slot:append>
                    <q-icon
                      :name="showPassword ? 'visibility_off' : 'visibility'"
                      class="cursor-pointer"
                      @click="showPassword = !showPassword"
                    />
                  </template>
                </q-input>

                <!-- Lembrar de mim -->
                <div class="q-mt-md q-mb-md">
                  <q-checkbox v-model="form.rememberMe" label="Lembrar de mim" />
                </div>

                <!-- Botão de Login -->
                <div class="q-mt-lg">
                  <q-btn
                    type="submit"
                    color="primary"
                    class="full-width"
                    size="lg"
                    :loading="isLoading"
                    :disable="!form.email || !form.password"
                  >
                    <q-icon name="login" class="q-mr-sm" />
                    Entrar
                  </q-btn>
                </div>

                <!-- Links auxiliares -->
                <div class="text-center q-mt-lg">
                  <q-btn
                    flat
                    color="primary"
                    size="sm"
                    @click="showForgotPassword = true"
                  >
                    Esqueceu a senha?
                  </q-btn>
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </div>

        <!-- Dialog para recuperar senha -->
        <q-dialog v-model="showForgotPassword" @hide="closeForgotPasswordDialog">
          <q-card style="min-width: 350px">
            <q-card-section class="bg-primary text-white">
              <div class="text-h6">
                <q-icon name="lock_reset" class="q-mr-sm" />
                Recuperar Senha
              </div>
            </q-card-section>

            <q-card-section>
              <q-input
                v-model="forgotEmail"
                type="email"
                label="Digite seu email"
                outlined
              />
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Cancelar" @click="closeForgotPasswordDialog" />
              <q-btn 
                flat 
                label="Enviar" 
                color="primary" 
                @click="handleForgotPassword" 
                :loading="isLoading"
                :disable="!forgotEmail || isLoading"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Notify, useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { api as axios } from 'src/boot/axios'
import { useSettings } from 'src/composables/useSettings'

const router = useRouter()
const authStore = useAuthStore()
const $q = useQuasar()

// Configurações dinâmicas
const { businessName } = useSettings()

// Estado do componente
const form = ref({
  email: '',
  password: '',
  rememberMe: false
})

const showPassword = ref(false)
const showForgotPassword = ref(false)
const forgotEmail = ref('')
const isLoading = ref(false)

// Função para fechar dialog de recuperação de senha
function closeForgotPasswordDialog() {
  showForgotPassword.value = false
  forgotEmail.value = ''
}

// Função para alternar tema
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

// Função de login
async function handleLogin() {
  console.log('Login iniciado:', form.value.email)
  
  if (!form.value.email || !form.value.password) {
    Notify.create({
      type: 'warning',
      message: 'Preencha email e senha',
      position: 'bottom-right',
      icon: 'warning',
      timeout: 3000
    })
    return
  }

  isLoading.value = true

  try {
    console.log('Enviando requisição de login...')
    
    const result = await authStore.login({
      email: form.value.email,
      password: form.value.password
    })

    console.log('Resultado do login:', result)

    if (result.success) {
      console.log('Login bem-sucedido, dados do usuário:', authStore.user)
      console.log('Token salvo:', authStore.token)
      console.log('Está autenticado?', authStore.isAuthenticated)
      
      Notify.create({
        type: 'positive',
        message: 'Login realizado com sucesso!',
        position: 'bottom-right',
        icon: 'check_circle',
        timeout: 2000
      })

      // Aguardar um pouco para garantir que o estado foi atualizado
      setTimeout(() => {
        console.log('Redirecionando para dashboard...')
        router.push('/')
      }, 100)
    } else {
      console.error('Erro de login:', result.error)
      
      Notify.create({
        type: 'negative',
        message: result.error || 'E-mail ou senha inválidos',
        position: 'bottom-right',
        icon: 'error',
        timeout: 4000
      })
      
      // Limpar senha após erro
      form.value.password = ''
    }
  } catch (error) {
    console.error('Erro na função de login:', error)
    
    Notify.create({
      type: 'negative',
      message: 'Erro interno. Tente novamente.',
      position: 'bottom-right',
      icon: 'error',
      timeout: 4000
    })
    
    // Limpar senha após erro
    form.value.password = ''
  } finally {
    isLoading.value = false
  }
}

// Função para recuperar senha
async function handleForgotPassword() {
  if (!forgotEmail.value) {
    Notify.create({
      type: 'warning',
      message: 'Digite um email válido',
      position: 'bottom-right'
    })
    return
  }

  isLoading.value = true

  try {
    await axios.post('/auth/forgot-password', {
      email: forgotEmail.value
    })

    Notify.create({
      type: 'positive',
      message: 'Se o email existir em nosso sistema, você receberá um link para redefinir sua senha.',
      position: 'bottom-right',
      timeout: 5000
    })

    showForgotPassword.value = false
    forgotEmail.value = ''
    
  } catch (error) {
    console.error('Erro ao solicitar recuperação de senha:', error)
    
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || 'Erro ao enviar email. Tente novamente.',
      position: 'bottom-right'
    })
  } finally {
    isLoading.value = false
  }
  forgotEmail.value = ''
}

// Carregar preferência de tema ao montar o componente
onMounted(() => {
  const savedDarkMode = localStorage.getItem('darkMode')
  if (savedDarkMode !== null) {
    $q.dark.set(savedDarkMode === 'true')
  }
})
</script>

<style scoped>
.login-page {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
  transition: background 0.3s ease;
}

.login-container {
  width: 100%;
  max-width: 400px;
  padding: 20px;
  position: relative;
}

.login-card {
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.login-title {
  color: var(--q-primary, #1976d2);
  font-weight: 600;
  margin: 0;
  transition: color 0.3s ease;
}

.login-subtitle {
  color: #666;
  margin: 0;
  transition: color 0.3s ease;
}

.theme-toggle-btn {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

/* Tema Dark */
.body--dark {
  .login-page {
    background: linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%);
  }
  
  .login-card {
    background: rgba(30, 30, 30, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  }
  
  .login-title {
    color: var(--q-primary, #64b5f6);
  }
  
  .login-subtitle {
    color: #bbb;
  }
  
  .theme-toggle-btn {
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }
  }
}

@media (max-width: 600px) {
  .login-container {
    max-width: 350px;
    padding: 15px;
  }
  
  .login-card {
    border-radius: 12px;
  }
}</style>
