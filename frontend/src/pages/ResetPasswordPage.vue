<template>
  <q-layout view="lHh lpr lFf">
    <q-page-container>
      <q-page class="flex flex-center bg-grey-1">
        <div class="column q-pa-lg">
          <div class="text-center q-mb-lg">
            <q-icon name="content_cut" size="4rem" color="primary" />
            <h4 class="q-ma-none q-mt-md text-primary">Redefinir Senha</h4>
            <p class="text-grey-7">Digite sua nova senha</p>
          </div>

          <q-card class="q-pa-lg" style="min-width: 400px">
            <q-card-section>
              <q-form @submit.prevent="handleResetPassword">
                <div class="q-gutter-md">
                  <q-input
                    v-model="form.newPassword"
                    :type="showPassword ? 'text' : 'password'"
                    label="Nova Senha"
                    outlined
                    required
                    :rules="[
                      val => !!val || 'Nova senha é obrigatória',
                      val => val.length >= 6 || 'Senha deve ter pelo menos 6 caracteres'
                    ]"
                  >
                    <template v-slot:append>
                      <q-icon
                        :name="showPassword ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="showPassword = !showPassword"
                      />
                    </template>
                  </q-input>

                  <q-input
                    v-model="form.confirmPassword"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    label="Confirmar Nova Senha"
                    outlined
                    required
                    :rules="[
                      val => !!val || 'Confirmação de senha é obrigatória',
                      val => val === form.newPassword || 'Senhas não coincidem'
                    ]"
                  >
                    <template v-slot:append>
                      <q-icon
                        :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="showConfirmPassword = !showConfirmPassword"
                      />
                    </template>
                  </q-input>

                  <div class="text-center q-mt-lg">
                    <q-btn
                      type="submit"
                      color="primary"
                      size="md"
                      class="full-width"
                      :loading="isLoading"
                      :disable="!form.newPassword || !form.confirmPassword || isLoading"
                    >
                      <q-icon name="lock_reset" class="q-mr-sm" />
                      Redefinir Senha
                    </q-btn>
                  </div>

                  <div class="text-center q-mt-md">
                    <q-btn
                      flat
                      color="primary"
                      size="sm"
                      @click="$router.push('/login')"
                    >
                      Voltar ao Login
                    </q-btn>
                  </div>
                </div>
              </q-form>
            </q-card-section>
          </q-card>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Notify } from 'quasar'
import { api as axios } from 'src/boot/axios'

const router = useRouter()
const route = useRoute()

// Estado do componente
const form = ref({
  newPassword: '',
  confirmPassword: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)

onMounted(() => {
  // Verificar se tem token na URL
  if (!route.query.token) {
    Notify.create({
      type: 'negative',
      message: 'Token inválido ou não fornecido',
      position: 'bottom-right'
    })
    router.push('/login')
  }
})

// Função para redefinir senha
async function handleResetPassword() {
  if (form.value.newPassword !== form.value.confirmPassword) {
    Notify.create({
      type: 'warning',
      message: 'As senhas não coincidem',
      position: 'bottom-right'
    })
    return
  }

  isLoading.value = true

  try {
    await axios.post('/auth/reset-password', {
      token: route.query.token,
      newPassword: form.value.newPassword
    })

    Notify.create({
      type: 'positive',
      message: 'Senha redefinida com sucesso! Faça login com sua nova senha.',
      position: 'bottom-right',
      timeout: 5000
    })

    router.push('/login')
    
  } catch (error) {
    console.error('Erro ao redefinir senha:', error)
    
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || 'Erro ao redefinir senha. Tente novamente.',
      position: 'bottom-right'
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.bg-grey-1 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}
</style>
