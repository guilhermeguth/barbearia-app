<template>
  <div class="column q-gutter-md">
    <!-- Título -->
    <div class="text-center q-mb-md">
      <q-icon name="lock_reset" size="3rem" color="primary" />
      <div class="text-h5 text-weight-bold text-grey-8 q-mt-md">
        Redefinir Senha
      </div>
      <div class="text-body2 text-grey-6">
        Digite sua nova senha
      </div>
    </div>

    <!-- Formulário de Redefinição -->
    <q-form class="q-gutter-md" @submit="handleResetPassword">
      <!-- Nova Senha -->
      <q-input
        v-model="form.newPassword"
        :type="showPassword ? 'text' : 'password'"
        label="Nova Senha"
        outlined
        dense
        :rules="[
          val => !!val || 'Nova senha é obrigatória',
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

      <!-- Confirmar Nova Senha -->
      <q-input
        v-model="form.confirmPassword"
        :type="showConfirmPassword ? 'text' : 'password'"
        label="Confirmar Nova Senha"
        outlined
        dense
        :rules="[
          val => !!val || 'Confirmação de senha é obrigatória',
          val => val === form.newPassword || 'Senhas não coincidem'
        ]"
      >
        <template #prepend>
          <q-icon name="lock" />
        </template>
        <template #append>
          <q-icon
            :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="showConfirmPassword = !showConfirmPassword"
          />
        </template>
      </q-input>

      <!-- Botão de Redefinir -->
      <q-btn
        type="submit"
        color="primary"
        class="full-width q-py-sm"
        :loading="isLoading"
        :disable="!form.newPassword || !form.confirmPassword || isLoading"
      >
        <template #default>
          <q-icon name="lock_reset" class="q-mr-sm" />
          Redefinir Senha
        </template>
      </q-btn>
    </q-form>

    <!-- Divider -->
    <q-separator class="q-my-lg" />

    <!-- Link para voltar ao Login -->
    <div class="text-center">
      <q-btn
        flat
        label="Voltar ao Login"
        color="primary"
        class="text-weight-medium"
        @click="goToLogin"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useNotify } from 'src/composables/useNotify'
import { api } from 'src/boot/axios'

const router = useRouter()
const route = useRoute()
const { notifySuccess, notifyError, notifyWarning } = useNotify()

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)

const form = reactive({
  newPassword: '',
  confirmPassword: ''
})

onMounted(() => {
  // Verificar se tem token na URL
  if (!route.query.token) {
    notifyError('Token inválido ou não fornecido')
    router.push('/login')
  }
})

async function handleResetPassword() {
  if (form.newPassword !== form.confirmPassword) {
    notifyWarning('As senhas não coincidem')
    return
  }

  isLoading.value = true

  try {
    await api.post('/auth/reset-password', {
      token: route.query.token,
      newPassword: form.newPassword
    })

    notifySuccess('Senha redefinida com sucesso! Faça login com sua nova senha.', {
      timeout: 5000
    })

    router.push('/login')
    
  } catch (error) {
    console.error('Erro ao redefinir senha:', error)
    
    notifyError(error.response?.data?.message || 'Erro ao redefinir senha. Tente novamente.')
  } finally {
    isLoading.value = false
  }
}

function goToLogin() {
  router.push('/login')
}
</script>
