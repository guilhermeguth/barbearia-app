<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <div class="window-height window-width row justify-center items-center bg-primary">
        <div class="column q-pa-lg">
          <!-- Logo da Barbearia -->
          <div class="col-auto text-center q-mb-lg">
            <q-avatar size="120px" class="q-mb-md">
              <q-icon name="content_cut" size="60px" color="white" />
            </q-avatar>
            <div class="text-h4 text-white text-weight-bold">
              Barbearia
            </div>
            <div class="text-h6 text-white opacity-80">
              Agendamento Online
            </div>
          </div>

          <!-- Card com o conteúdo da página -->
          <q-card class="auth-card" style="min-width: 350px; max-width: 400px;">
            <q-card-section class="q-pa-xl">
              <router-view />
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup>
// Layout simples para páginas de autenticação
</script>

<style lang="scss" scoped>
.auth-card {
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.bg-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
