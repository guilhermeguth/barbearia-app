<template>
  <q-page class="q-pa-md">
    <!-- Header padronizado -->
    <div class="page-header q-mb-lg">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-h4 text-weight-bold text-primary q-my-none">
            Olá, {{ authStore.user?.name || 'Cliente' }}! 👋
          </h1>
          <p class="text-body1 text-grey-6 q-mt-sm q-mb-none">
            Pronto para agendar seu próximo corte?
          </p>
        </div>
      </div>
    </div>

    <!-- Cards de ação rápida -->
    <div class="q-mb-lg">
      <div class="row q-gutter-md justify-center">
        <!-- Novo Agendamento -->
        <div class="col-12 col-sm-5 col-md-5">
          <q-card class="action-card cursor-pointer full-width" @click="goToNewAppointment">
            <q-card-section class="text-center q-py-lg">
              <q-icon name="add_circle" size="48px" color="primary" class="q-mb-md" />
              <div class="text-h6 text-weight-bold">Novo Agendamento</div>
              <div class="text-body2 text-grey-6">Agende um horário</div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Meus Agendamentos -->
        <div class="col-12 col-sm-5 col-md-5">
          <q-card class="action-card cursor-pointer full-width" @click="goToMyAppointments">
            <q-card-section class="text-center q-py-lg">
              <q-icon name="schedule" size="48px" color="orange" class="q-mb-md" />
              <div class="text-h6 text-weight-bold">Meus Agendamentos</div>
              <div class="text-body2 text-grey-6">Ver agendamentos</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Próximos agendamentos -->
    <div v-if="upcomingAppointments.length > 0" class="q-mb-lg">
      <div class="text-h6 text-weight-bold text-grey-8 q-mb-md">
        Próximos Agendamentos
      </div>
      
      <div class="q-gutter-md">
        <div 
          v-for="appointment in upcomingAppointments.slice(0, 2)" 
          :key="appointment.id"
          class="q-mb-md"
        >
          <AppointmentCard :appointment="appointment" show-actions />
        </div>
      </div>
    </div>

    <!-- Estado vazio -->
    <div v-else class="text-center q-py-xl">
      <q-icon name="event_available" size="64px" color="grey-5" class="q-mb-md" />
      <div class="text-h6 text-grey-6 q-mb-sm">Nenhum agendamento</div>
      <div class="text-body2 text-grey-5 q-mb-lg">
        Você não tem agendamentos marcados
      </div>
      <q-btn 
        color="primary" 
        label="Agendar agora" 
        @click="goToNewAppointment"
        rounded
        unelevated
      />
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore, useAppointmentStore } from 'src/stores'
import AppointmentCard from 'src/components/AppointmentCard.vue'

const router = useRouter()
const authStore = useAuthStore()
const appointmentStore = useAppointmentStore()

// Computed
const upcomingAppointments = computed(() => appointmentStore.upcomingAppointments)

// Methods
function goToNewAppointment() {
  router.push('/appointment/new')
}

function goToMyAppointments() {
  router.push('/appointments')
}

// Lifecycle
onMounted(async () => {
  // Carregar agendamentos do usuário
  await appointmentStore.fetchMyAppointments()
})
</script>

<style lang="scss" scoped>
.q-page {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.action-card {
  border-radius: 12px;
  transition: all 0.2s ease;
  min-height: 140px;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  }
}

// Header padronizado
.page-header {
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 16px;
  margin-bottom: 24px !important;
  
  h1 {
    line-height: 1.2;
    margin: 0;
    
    @media (max-width: 599px) {
      font-size: 1.5rem;
    }
  }
  
  p {
    margin: 8px 0 0 0;
    line-height: 1.4;
  }
}

// Seção de boas-vindas
.welcome-section {
  .welcome-card {
    background: linear-gradient(135deg, rgba($primary, 0.05) 0%, rgba($primary, 0.02) 100%);
    border: 1px solid rgba($primary, 0.1);
    border-radius: 12px;
    
    .q-card-section {
      padding: 24px 16px;
    }
    
    @media (max-width: 599px) {
      .q-card-section {
        padding: 20px 12px;
      }
      
      .text-h5 {
        font-size: 1.25rem;
      }
    }
  }
}

// Melhorar responsividade no mobile
@media (max-width: 599px) {
  .q-page {
    padding: 16px 12px;
  }
  
  .action-card {
    margin: 0 auto;
    max-width: 100%;
  }
  
  .row {
    margin-left: 0;
    margin-right: 0;
  }
}

// Para telas pequenas, garantir que os cards ocupem a largura total
@media (max-width: 399px) {
  .action-card {
    min-height: 120px;
  }
  
  .q-card-section {
    padding: 20px 16px !important;
  }
}
</style>
