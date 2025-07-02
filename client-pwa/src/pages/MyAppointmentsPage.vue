<template>
  <q-page class="q-pa-md">
    <!-- Header da página -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h4 class="q-ma-none text-primary text-weight-bold">
          <q-icon name="schedule" class="q-mr-sm" />
          Meus Agendamentos
        </h4>
        <p class="text-grey-6 q-mb-none">Visualize e gerencie seus horários marcados</p>
      </div>
      <q-btn
        icon="add"
        label="Novo"
        color="primary"
        unelevated
        @click="$router.push('/appointment/new')"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="row justify-center q-py-xl">
      <q-spinner-dots size="50px" color="primary" />
    </div>

    <!-- Empty State -->
    <div 
      v-else-if="!loading && appointments.length === 0"
      class="column items-center q-py-xl text-center"
    >
      <q-icon 
        name="event_busy" 
        size="80px" 
        color="grey-4" 
        class="q-mb-md"
      />
      <div class="text-h6 text-grey-6 q-mb-sm">
        Nenhum agendamento encontrado
      </div>
      <div class="text-body2 text-grey-5 q-mb-lg">
        Você ainda não possui agendamentos
      </div>
      <q-btn
        label="Agendar agora"
        color="primary"
        unelevated
        @click="$router.push('/appointment/new')"
      />
    </div>

    <!-- Appointments List -->
    <div v-else class="q-gutter-md">
      <!-- Próximos Agendamentos -->
      <div v-if="upcomingAppointments.length > 0">
        <div class="text-h6 text-weight-medium text-grey-7 q-mb-md">
          Próximos Agendamentos
        </div>
        <div class="q-gutter-sm">
          <AppointmentCard
            v-for="appointment in upcomingAppointments"
            :key="appointment.id"
            :appointment="appointment"
            @cancel="handleCancelAppointment"
          />
        </div>
      </div>

      <!-- Histórico -->
      <div v-if="pastAppointments.length > 0" class="q-mt-xl">
        <div class="text-h6 text-weight-medium text-grey-7 q-mb-md">
          Histórico
        </div>
        <div class="q-gutter-sm">
          <AppointmentCard
            v-for="appointment in pastAppointments"
            :key="appointment.id"
            :appointment="appointment"
            :show-actions="false"
          />
        </div>
      </div>
    </div>

    <!-- Pull to Refresh -->
    <q-pull-to-refresh @refresh="onRefresh">
      <div class="q-pa-sm"></div>
    </q-pull-to-refresh>

    <!-- Cancel Confirmation Dialog -->
    <q-dialog v-model="showCancelDialog" persistent>
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Cancelar Agendamento</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          Tem certeza que deseja cancelar este agendamento?
          <div class="text-caption text-grey-6 q-mt-sm">
            Esta ação não pode ser desfeita.
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn 
            flat 
            label="Manter" 
            color="grey-7" 
            v-close-popup 
          />
          <q-btn 
            unelevated 
            label="Cancelar" 
            color="negative" 
            @click="confirmCancel"
            :loading="cancelling"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAppointmentStore } from 'src/stores/appointment'
import AppointmentCard from 'src/components/AppointmentCard.vue'

export default defineComponent({
  name: 'MyAppointmentsPage',
  
  components: {
    AppointmentCard
  },

  setup() {
    const $q = useQuasar()
    const appointmentStore = useAppointmentStore()
    
    const loading = ref(false)
    const showCancelDialog = ref(false)
    const appointmentToCancel = ref(null)
    const cancelling = ref(false)

    const appointments = computed(() => appointmentStore.appointments)
    
    const upcomingAppointments = computed(() => {
      const now = new Date()
      return appointments.value
        .filter(apt => new Date(apt.date + 'T' + apt.time) >= now)
        .sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time))
    })

    const pastAppointments = computed(() => {
      const now = new Date()
      return appointments.value
        .filter(apt => new Date(apt.date + 'T' + apt.time) < now)
        .sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time))
    })

    const loadAppointments = async () => {
      try {
        loading.value = true
        await appointmentStore.fetchMyAppointments()
      } catch (error) {
        console.error('Erro ao carregar agendamentos:', error)
        $q.notify({
          type: 'negative',
          message: 'Erro ao carregar agendamentos',
          position: 'top'
        })
      } finally {
        loading.value = false
      }
    }

    const handleCancelAppointment = (appointment) => {
      appointmentToCancel.value = appointment
      showCancelDialog.value = true
    }

    const confirmCancel = async () => {
      if (!appointmentToCancel.value) return

      try {
        cancelling.value = true
        
        await appointmentStore.cancelAppointment(appointmentToCancel.value.id)
        
        $q.notify({
          type: 'positive',
          message: 'Agendamento cancelado com sucesso',
          position: 'top'
        })
        
        showCancelDialog.value = false
        appointmentToCancel.value = null
        
        // Recarrega a lista
        await loadAppointments()
        
      } catch (error) {
        console.error('Erro ao cancelar agendamento:', error)
        $q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Erro ao cancelar agendamento',
          position: 'top'
        })
      } finally {
        cancelling.value = false
      }
    }

    const onRefresh = async (done) => {
      try {
        await loadAppointments()
      } finally {
        done()
      }
    }

    onMounted(() => {
      loadAppointments()
    })

    return {
      loading,
      appointments,
      upcomingAppointments,
      pastAppointments,
      showCancelDialog,
      cancelling,
      handleCancelAppointment,
      confirmCancel,
      onRefresh
    }
  }
})
</script>

<style lang="scss" scoped>
.q-page {
  background-color: #f5f5f5;
}
</style>
