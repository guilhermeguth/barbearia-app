<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container class="auth-page-container">
      <div class="fullscreen flex flex-center bg-primary">
        <div class="auth-wrapper">
          <!-- Logo -->
          <div class="text-center q-mb-lg">
            <q-avatar size="96px" class="q-mb-md bg-white">
              <q-icon name="content_cut" size="48px" color="primary" />
            </q-avatar>
            <div class="text-h5 text-white text-weight-bold">
              {{ businessName }}
            </div>
            <div class="text-subtitle2 text-white opacity-80">
              Agendamento Online
            </div>
          </div>

          <!-- Card -->
          <q-card class="auth-card">
            <q-card-section class="q-pa-lg">
              <router-view />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { useSettings } from 'src/composables/useSettings'
const { businessName } = useSettings()
</script>

<style scoped lang="scss">
.auth-page-container {
  padding: 0;
}

.auth-wrapper {
  width: 100%;
  max-width: 420px;
  padding: 0 16px;
}

.auth-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  margin-bottom: 8px; // evitar encostar no final da tela em telas pequenas
}

.bg-primary {
  background: linear-gradient(135deg, #0aa360 0%, #02914b 100%);
}
</style>
