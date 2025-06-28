<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center bg-grey-1">
        <div class="login-container">
          <!-- Logo/Header -->
          <div class="text-center q-mb-lg">
            <q-icon name="content_cut" size="4rem" color="primary" />
            <h4 class="q-ma-sm">Barbearia App</h4>
            <p class="text-grey-7">Faça login para acessar o sistema</p>
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
        <q-dialog v-model="showForgotPassword">
          <q-card style="min-width: 350px">
            <q-card-section>
              <div class="text-h6">Recuperar Senha</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <q-input
                v-model="forgotEmail"
                type="email"
                label="Digite seu email"
                outlined
              />
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Cancelar" v-close-popup />
              <q-btn flat label="Enviar" color="primary" @click="handleForgotPassword" />
            </q-card-actions>
          </q-card>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

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
function handleForgotPassword() {
  if (!forgotEmail.value) {
    Notify.create({
      type: 'warning',
      message: 'Digite um email válido',
      position: 'bottom-right'
    })
    return
  }

  // Simular envio de email
  Notify.create({
    type: 'positive',
    message: 'Email de recuperação enviado!',
    position: 'bottom-right'
  })

  showForgotPassword.value = false
  forgotEmail.value = ''
}
</script>

<style scoped>
.login-container {
  width: 100%;
  max-width: 400px;
  padding: 20px;
}

.login-card {
  box-shadow: 0 4px 25px rgba(0,0,0,0.1);
}

@media (max-width: 600px) {
  .login-container {
    max-width: 350px;
    padding: 15px;
  }
}
</style>
