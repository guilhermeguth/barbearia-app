<template>
  <div class="column q-gutter-md">
    <!-- Título -->
    <div class="text-center q-mb-md">
      <div class="text-h5 text-weight-bold text-grey-8">Entrar</div>
      <div class="text-body2 text-grey-6">Acesse sua conta no {{ businessName }}</div>
    </div>

    <!-- Formulário de Login -->
    <q-form class="q-gutter-md" @submit="handleLogin">
      <!-- Email -->
      <q-input
        v-model="form.email"
        type="email"
        label="E-mail"
        outlined
        dense
        :rules="[
          val => !!val || 'E-mail é obrigatório',
          val => /.+@.+\..+/.test(val) || 'E-mail inválido'
        ]"
      >
        <template #prepend>
          <q-icon name="email" />
        </template>
      </q-input>

      <!-- Senha -->
      <q-input
        v-model="form.password"
        :type="showPassword ? 'text' : 'password'"
        label="Senha"
        outlined
        dense
        :rules="[
          val => !!val || 'Senha é obrigatória',
          val => val.length >= 6 || 'Senha deve ter pelo menos 6 caracteres'
        ]"
      >
        <template #prepend>
          <q-icon name="lock" />
        </template>
        <template #append>
          <q-icon
            :name="showPassword ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="showPassword = !showPassword"
          />
        </template>
      </q-input>

      <!-- Botão de Login -->
      <q-btn
        type="submit"
        label="Entrar"
        color="primary"
        class="full-width q-py-sm"
        :loading="authStore.isLoading"
        :disable="authStore.isLoading"
      />
    <!-- Link Esqueceu a senha -->
    <div class="text-center q-mt-sm">
      <q-btn
        flat
        label="Esqueceu a senha?"
        color="primary"
        size="sm"
        @click="showForgotPassword = true"
      />
    </div>
    </q-form>

    <!-- Divider -->
    <q-separator class="q-my-lg" />

    <!-- Link para Registro -->
    <div class="text-center">
      <div class="text-body2 text-grey-6 q-mb-sm">
        Não tem uma conta?
      </div>
      <q-btn
        flat
        label="Criar conta"
        color="primary"
        class="text-weight-medium"
        @click="goToRegister"
      />
    </div>
  </div>
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
          :loading="isLoading"
          :disable="!forgotEmail || isLoading"
          @click="handleForgotPassword"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { useAuthStore } from 'src/stores'
import { useSettings } from 'src/composables/useSettings'
import { api as axios } from 'src/boot/axios'

const router = useRouter()
const authStore = useAuthStore()
const { businessName } = useSettings()
const showPassword = ref(false)
const showForgotPassword = ref(false)
const forgotEmail = ref('')
const isLoading = ref(false)
const form = reactive({
  email: '',
  password: ''
})

async function handleLogin() {
  const result = await authStore.login(form.email, form.password)
  if (result.success) {
    Notify.create({
      type: 'positive',
      message: 'Login realizado com sucesso!',
      position: 'top'
    })
    router.push('/')
  } else {
    Notify.create({
      type: 'negative',
      message: result.message,
      position: 'top'
    })
  }
}

function closeForgotPasswordDialog() {
  showForgotPassword.value = false
  forgotEmail.value = ''
}

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

function goToRegister() {
  router.push('/register')
}
</script>