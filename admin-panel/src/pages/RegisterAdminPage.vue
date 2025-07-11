<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex flex-center login-page">
        <div class="login-container">
          <!-- Logo/Header -->
          <div class="text-center q-mb-lg">
            <q-icon name="content_cut" size="4rem" color="primary" />
            <h4 class="q-ma-sm login-title">Registrar Administrador</h4>
            <p class="login-subtitle">Preencha os dados para criar um novo admin</p>
          </div>
          <q-card class="login-card">
            <q-card-section>
              <q-form @submit.prevent="onSubmit" class="q-gutter-md">
                <q-input filled v-model="form.name" label="Nome" required />
                <q-input filled v-model="form.email" label="E-mail" type="email" required />
                <q-input filled v-model="form.password" label="Senha" type="password" required />
                <q-input filled v-model="form.adminRegistrationKey" label="Chave de Registro" type="password" required />
                <div class="q-mt-lg">
                  <q-btn label="Registrar" type="submit" color="primary" :loading="loading" class="full-width" />
                </div>
              </q-form>
              <q-banner v-if="error" class="q-mt-md bg-red-2 text-red-10">{{ error }}</q-banner>
              <q-banner v-if="success" class="q-mt-md bg-green-2 text-green-10">{{ success }}</q-banner>
            </q-card-section>
          </q-card>
          <div class="text-center q-mt-md">
            <q-btn flat color="primary" size="sm" @click="goToLogin">Voltar para login</q-btn>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue';
import { api } from 'boot/axios';

import { useRouter } from 'vue-router';
const router = useRouter();

const form = ref({
  name: '',
  email: '',
  password: '',
  adminRegistrationKey: ''
});
const loading = ref(false);
const error = ref('');
const success = ref('');

async function onSubmit() {
  error.value = '';
  success.value = '';
  loading.value = true;
  try {
    await api.post('/user/create', {
      ...form.value,
      role: 'admin'
    });
    success.value = 'Administrador registrado com sucesso!';
    form.value = { name: '', email: '', password: '', adminRegistrationKey: '' };
  } catch (err) {
    error.value = err.response?.data?.message || 'Erro ao registrar admin.';
  } finally {
    loading.value = false;
  }
}

function goToLogin() {
  router.push('/login');
}
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
}

@media (max-width: 600px) {
  .login-container {
    max-width: 350px;
    padding: 15px;
  }
  
  .login-card {
    border-radius: 12px;
  }
}
</style>
