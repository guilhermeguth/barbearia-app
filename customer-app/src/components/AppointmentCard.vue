<template>
  <q-card class="appointment-card" :style="{ borderLeftColor: primaryColor }">
    <!-- Layout para Desktop -->
    <q-card-section class="row items-center justify-start q-py-md q-px-lg desktop-layout">
      <!-- Status -->
      <div class="col-2 status-section">
        <q-chip 
          :color="getStatusColor(appointment.status)" 
          :text-color="getStatusTextColor()"
          size="sm"
          :icon="getStatusIcon(appointment.status)"
          :label="getStatusLabel(appointment.status)"
          class="status-chip"
        />
      </div>

      <!-- Data e Hora -->
      <div class="col-3 datetime-section">
        <div class="row items-center">
          <q-icon name="schedule" size="18px" class="q-mr-sm" :color="primaryColor" />
          <div>
            <div class="text-body2 text-weight-medium datetime-text">
              {{ formatDateTime(appointment.scheduledDateTime) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Barbeiro -->
      <div class="col-2 barber-section">
        <div class="row items-center">
          <q-icon name="person" size="16px" class="q-mr-xs text-grey-6" />
          <span class="text-body2 item-text">{{ appointment.barber?.name || appointment.barberName }}</span>
        </div>
      </div>

      <!-- Serviço -->
      <div class="col-2 service-section">
        <div class="row items-center">
          <q-icon name="content_cut" size="16px" class="q-mr-xs text-grey-6" />
          <span class="text-body2 item-text">{{ appointment.service?.name || appointment.serviceName }}</span>
        </div>
      </div>

      <!-- Preço -->
      <div class="col-2 price-section">
        <div class="row items-center">
          <q-icon name="attach_money" size="16px" class="q-mr-xs text-green" />
          <span class="text-body2 text-weight-medium text-green price-text">
            R$ {{ (appointment.totalPrice || appointment.service?.price || 0).toFixed(2) }}
          </span>
        </div>
      </div>

      <!-- Ação -->
      <div class="col-1 text-right action-section">
        <q-btn 
          v-if="showActions && canCancel"
          flat 
          dense
          color="negative" 
          icon="cancel"
          label="Cancelar"
          size="sm"
          class="cancel-btn"
          @click="$emit('cancel', appointment)"
        />
      </div>
    </q-card-section>

    <!-- Layout para Mobile -->
    <q-card-section class="mobile-layout">
      <div class="mobile-content">
        <!-- Linha 1: Status + Data/Hora -->
        <div class="mobile-row mobile-row-main">
          <q-chip 
            :color="getStatusColor(appointment.status)" 
            :text-color="getStatusTextColor()"
            size="xs"
            :icon="getStatusIcon(appointment.status)"
            :label="getStatusLabel(appointment.status)"
            class="mobile-status-chip"
          />
          <div class="mobile-datetime">
            <q-icon name="schedule" size="14px" class="q-mr-xs" :color="primaryColor" />
            <span class="datetime-mobile">{{ formatDateTime(appointment.scheduledDateTime) }}</span>
          </div>
        </div>

        <!-- Linha 2: Barbeiro + Serviço -->
        <div class="mobile-row mobile-row-details">
          <div class="mobile-barber">
            <q-icon name="person" size="12px" class="q-mr-xs text-grey-6" />
            <span class="mobile-text">{{ appointment.barber?.name || appointment.barberName }}</span>
          </div>
          <div class="mobile-service">
            <q-icon name="content_cut" size="12px" class="q-mr-xs text-grey-6" />
            <span class="mobile-text">{{ appointment.service?.name || appointment.serviceName }}</span>
          </div>
        </div>

        <!-- Linha 3: Preço + Ação -->
        <div class="mobile-row mobile-row-action">
          <div class="mobile-price">
            <q-icon name="attach_money" size="12px" class="q-mr-xs text-green" />
            <span class="mobile-price-text">
              R$ {{ (appointment.totalPrice || appointment.service?.price || 0).toFixed(2) }}
            </span>
          </div>
          <q-btn 
            v-if="showActions && canCancel"
            flat 
            dense
            color="negative" 
            icon="cancel"
            size="xs"
            class="mobile-cancel-btn"
            @click="$emit('cancel', appointment)"
          />
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { useSettings } from 'src/composables/useSettings'

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
    const { primaryColor } = useSettings()
    
    const canCancel = computed(() => {
      if (props.appointment.status !== 'scheduled') return false
      
      if (!props.appointment.scheduledDateTime) return false
      
      const appointmentTime = new Date(props.appointment.scheduledDateTime)
      
      if (isNaN(appointmentTime.getTime())) return false
      
      const now = new Date()
      const hoursUntil = (appointmentTime.getTime() - now.getTime()) / (1000 * 60 * 60)
      
      return hoursUntil >= 2 // Pode cancelar se faltam 2+ horas
    })

    return {
      canCancel,
      primaryColor
    }
  },

  methods: {
    formatDateTime(scheduledDateTime) {
      if (!scheduledDateTime) {
        return 'Data inválida'
      }
      
      const dateTime = new Date(scheduledDateTime)
      
      if (isNaN(dateTime.getTime())) {
        return 'Data inválida'
      }
      
      const date = dateTime.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
      
      const time = dateTime.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      })
      
      return `${date} • ${time}`
    },

    getStatusColor(status) {
      const statusLower = status ? status.toLowerCase() : '';
      const colors = {
        'scheduled': 'primary',
        'in_progress': 'orange',
        'completed': 'positive',
        'cancelled': 'negative'
      }
      return colors[statusLower] || 'grey'
    },

    getStatusTextColor() {
      return 'white'
    },

    getStatusLabel(status) {
      const statusLower = status ? status.toLowerCase() : '';
      const labels = {
        'scheduled': 'Agendado',
        'in_progress': 'Em andamento',
        'completed': 'Concluído',
        'cancelled': 'Cancelado'
      }
      return labels[statusLower] || status
    },

    getStatusIcon(status) {
      const statusLower = status ? status.toLowerCase() : '';
      const icons = {
        'scheduled': 'event',
        'in_progress': 'schedule',
        'completed': 'check_circle',
        'cancelled': 'cancel'
      }
      return icons[statusLower] || 'help'
    }
  }
})
</script>

<style lang="scss" scoped>
.appointment-card {
  border-radius: 8px;
  border-left: 4px solid; // Removido $primary, agora usa a cor dinâmica
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  width: 100%;
  
  .q-card__section {
    justify-content: flex-start;
    align-items: center;
  }
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
}

// Layout Desktop - padrão
.desktop-layout {
  display: flex;
}

// Layout Mobile - escondido por padrão
.mobile-layout {
  display: none;
}

// Responsividade para mobile
@media (max-width: 768px) {
  .appointment-card {
    margin-bottom: 0; // Remove completamente o margin-bottom entre cards
  }
  
  // Esconde o layout desktop
  .desktop-layout {
    display: none !important;
  }
  
  // Mostra o layout mobile
  .mobile-layout {
    display: block !important;
    padding: 6px 10px !important; // Reduz ainda mais o padding interno
  }
  
  .mobile-content {
    display: flex;
    flex-direction: column;
    gap: 4px; // Reduz gap interno de 6px para 4px
  }
  
  .mobile-row {
    display: flex;
    align-items: center;
    
    &.mobile-row-main {
      justify-content: space-between;
      margin-bottom: 2px;
    }
    
    &.mobile-row-details {
      justify-content: space-between;
      margin-bottom: 2px;
    }
    
    &.mobile-row-action {
      justify-content: space-between;
      align-items: center;
    }
  }
  
  .mobile-status-chip {
    font-size: 9px !important;
    height: 16px !important;
    
    .q-chip__icon {
      font-size: 10px !important;
    }
  }
  
  .mobile-datetime {
    display: flex;
    align-items: center;
    
    .datetime-mobile {
      font-size: 12px;
      font-weight: 500;
      color: #333;
    }
  }
  
  .mobile-barber,
  .mobile-service {
    display: flex;
    align-items: center;
    flex: 1;
    
    .mobile-text {
      font-size: 11px;
      color: #666;
    }
  }
  
  .mobile-service {
    text-align: right;
  }
  
  .mobile-price {
    display: flex;
    align-items: center;
    
    .mobile-price-text {
      font-size: 12px;
      font-weight: 600;
      color: #4caf50;
    }
  }
  
  .mobile-cancel-btn {
    border: 1px solid #f44336;
    border-radius: 12px;
    font-size: 9px !important;
    padding: 2px 6px !important;
    height: 20px !important;
    min-height: 20px !important;
    
    .q-btn__content {
      .q-icon {
        font-size: 11px !important;
      }
    }
    
    &:hover {
      background-color: rgba(244, 67, 54, 0.1);
    }
  }
}

// Estilos do layout desktop
.cancel-btn {
  border: 1px solid #f44336;
  border-radius: 16px;
  font-size: 11px;
  padding: 2px 8px;
  
  &:hover {
    background-color: rgba(244, 67, 54, 0.1);
  }
}
</style>
