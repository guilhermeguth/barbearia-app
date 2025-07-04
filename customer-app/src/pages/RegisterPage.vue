<template>
  <div class="column q-gutter-md">
    <!-- Título -->
    <div class="text-center q-mb-md">
      <div class="text-h5 text-weight-bold text-grey-8">Criar Conta</div>
      <div class="text-body2 text-grey-6">Cadastre-se para agendar</div>
    </div>

    <!-- Formulário de Registro -->
    <q-form @submit="handleRegister" class="q-gutter-md">
      <!-- Nome -->
      <q-input
        v-model="form.name"
        label="Nome completo"
        outlined
        dense
        :rules="[
          val => !!val || 'Nome é obrigatório',
          val => val.length >= 2 || 'Nome deve ter pelo menos 2 caracteres'
        ]"
      >
        <template v-slot:prepend>
          <q-icon name="person" />
        </template>
      </q-input>

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
        <template v-slot:prepend>
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
        <template v-slot:prepend>
          <q-icon name="lock" />
        </template>
        <template v-slot:append>
          <q-icon
            :name="showPassword ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="showPassword = !showPassword"
          />
        </template>
      </q-input>

      <!-- Confirmação de Senha -->
      <q-input
        v-model="form.confirmPassword"
        :type="showConfirmPassword ? 'text' : 'password'"
        label="Confirmar senha"
        outlined
        dense
        :rules="[
          val => !!val || 'Confirmação de senha é obrigatória',
          val => val === form.password || 'Senhas não coincidem'
        ]"
      >
        <template v-slot:prepend>
          <q-icon name="lock" />
        </template>
        <template v-slot:append>
          <q-icon
            :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="showConfirmPassword = !showConfirmPassword"
          />
        </template>
      </q-input>

      <!-- Botão de Registro -->
      <q-btn
        type="submit"
        label="Criar conta"
        color="primary"
        class="full-width q-py-sm"
        :loading="authStore.isLoading"
        :disable="authStore.isLoading"
      />
    </q-form>

    <!-- Divider -->
    <q-separator class="q-my-lg" />

    <!-- Link para Login -->
    <div class="text-center">
      <div class="text-body2 text-grey-6 q-mb-sm">
        Já tem uma conta?
      </div>
      <q-btn
        flat
        label="Fazer login"
        color="primary"
        @click="goToLogin"
        class="text-weight-medium"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Notify } from 'quasar'
import { useAuthStore } from 'src/stores'

const router = useRouter()
const authStore = useAuthStore()

const showPassword = ref(false)
const showConfirmPassword = ref(false)

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

async function handleRegister() {
  const result = await authStore.register({
    name: form.name,
    email: form.email,
    password: form.password
  })
  
  if (result.success) {
    Notify.create({
      type: 'positive',
      message: 'Conta criada com sucesso!',
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

function goToLogin() {
  router.push('/login')
}
</script>
