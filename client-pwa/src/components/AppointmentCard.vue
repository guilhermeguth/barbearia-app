<template>
  <q-card class="appointment-card">
    <q-card-section class="q-pb-none">
      <!-- Data e hora -->
      <div class="row items-center q-mb-sm">
        <q-icon name="schedule" class="q-mr-sm text-primary" />
        <div class="text-body1 text-weight-medium">
          {{ formatDateTime(appointment.date, appointment.time) }}
        </div>
      </div>
      
      <!-- Barbeiro -->
      <div class="row items-center q-mb-sm">
        <q-icon name="person" class="q-mr-sm text-grey-6" />
        <div class="text-body2">{{ appointment.barber?.name || appointment.barberName }}</div>
      </div>
      
      <!-- Serviço -->
      <div class="row items-center q-mb-sm">
        <q-icon name="content_cut" class="q-mr-sm text-grey-6" />
        <div class="text-body2">{{ appointment.service?.name || appointment.serviceName }}</div>
      </div>
      
      <!-- Preço -->
      <div class="row items-center">
        <q-icon name="attach_money" class="q-mr-sm text-green" />
        <div class="text-body2 text-weight-medium text-green">
          R$ {{ (appointment.totalPrice || appointment.service?.price || 0).toFixed(2) }}
        </div>
      </div>
    </q-card-section>

    <!-- Status -->
    <q-card-section class="q-pt-none">
      <q-chip 
        :color="getStatusColor(appointment.status)" 
        :text-color="getStatusTextColor(appointment.status)"
        size="sm"
        :label="getStatusLabel(appointment.status)"
      />
    </q-card-section>

    <!-- Ações -->
    <q-card-actions v-if="showActions && canCancel" align="right">
      <q-btn 
        flat 
        color="negative" 
        label="Cancelar"
        size="sm"
        @click="$emit('cancel', appointment)"
      />
    </q-card-actions>
  </q-card>
</template>

<script>
import { defineComponent, computed } from 'vue'

export default defineComponent({
  name: 'AppointmentCard',
  
  props: {
    appointment: {
      type: Object,
      required: true
    },
    showActions: {
      type: Boolean,
      default: true
    }
  },

  emits: ['cancel'],

  setup(props) {
    const canCancel = computed(() => {
      if (props.appointment.status !== 'SCHEDULED') return false
      
      // Suporte para diferentes formatos de data
      let appointmentTime
      if (props.appointment.scheduledDateTime) {
        appointmentTime = new Date(props.appointment.scheduledDateTime)
      } else if (props.appointment.date && props.appointment.time) {
        appointmentTime = new Date(props.appointment.date + 'T' + props.appointment.time)
      } else {
        return false
      }
      
      const now = new Date()
      const hoursUntil = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60)
      
      return hoursUntil >= 2 // Pode cancelar se faltam 2+ horas
    })

    return {
      canCancel
    }
  },

  methods: {
    formatDateTime(date, time) {
      let dateTime
      
      if (date && time) {
        dateTime = new Date(date + 'T' + time)
      } else if (date) {
        dateTime = new Date(date)
      } else {
        return 'Data inválida'
      }
      
      return dateTime.toLocaleString('pt-BR', {
        weekday: 'short',
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    getStatusColor(status) {
      const colors = {
        'SCHEDULED': 'primary',
        'IN_PROGRESS': 'orange',
        'COMPLETED': 'positive',
        'CANCELLED': 'negative'
      }
      return colors[status] || 'grey'
    },

    getStatusTextColor(status) {
      return status === 'COMPLETED' ? 'white' : 'white'
    },

    getStatusLabel(status) {
      const labels = {
        'SCHEDULED': 'Agendado',
        'IN_PROGRESS': 'Em andamento',
        'COMPLETED': 'Concluído',
        'CANCELLED': 'Cancelado'
      }
      return labels[status] || status
    }
  }
})
</script>

<style lang="scss" scoped>
.appointment-card {
  border-radius: 8px;
  border-left: 4px solid $primary;
}
</style>
