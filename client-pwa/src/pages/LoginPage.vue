<template>
  <div class="column q-gutter-md">
    <!-- Título -->
    <div class="text-center q-mb-md">
      <div class="text-h5 text-weight-bold text-grey-8">Entrar</div>
      <div class="text-body2 text-grey-6">Acesse sua conta</div>
    </div>

    <!-- Formulário de Login -->
    <q-form @submit="handleLogin" class="q-gutter-md">
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

      <!-- Botão de Login -->
      <q-btn
        type="submit"
        label="Entrar"
        color="primary"
        class="full-width q-py-sm"
        :loading="authStore.isLoading"
        :disable="authStore.isLoading"
      />
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
        @click="goToRegister"
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

function goToRegister() {
  router.push('/register')
}
</script>
