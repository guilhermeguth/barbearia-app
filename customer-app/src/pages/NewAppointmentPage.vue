<template>
  <q-page class="q-pa-md">
    <!-- Header da página -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h4 class="q-ma-none text-primary text-weight-bold">
          <q-icon name="event" class="q-mr-sm" />
          Novo Agendamento
        </h4>
        <p class="text-grey-6 q-mb-none">Agende seu atendimento em poucos passos</p>
      </div>
    </div>

    <!-- Stepper para processo de agendamento -->
    <q-stepper
      v-model="step"
      ref="stepper"
      color="primary"
      animated
      flat
      bordered
      class="bg-white appointment-stepper"
      :contracted="$q.screen.xs"
    >
      <!-- Passo 1: Selecionar Barbeiro -->
      <q-step
        :name="1"
        title="Barbeiro"
        icon="person"
        :done="step > 1"
        :header-nav="step > 1"
      >
        <div class="text-h6 q-mb-md">Escolha seu barbeiro preferido</div>
        <div class="text-body2 text-grey-6 q-mb-lg">
          Selecione o profissional que irá atendê-lo
        </div>
        
        <div v-if="appointmentStore.isLoading" class="text-center q-py-lg">
          <q-spinner color="primary" size="3em" />
        </div>

        <div v-else class="q-gutter-md">
          <div 
            v-for="barber in appointmentStore.barbers" 
            :key="barber.id"
            class="barber-option"
          >
            <q-card 
              class="barber-card cursor-pointer"
              :class="{ 'selected': selectedBarber?.id === barber.id }"
              @click="selectBarber(barber)"
            >
              <q-card-section class="row items-center">
                <!-- Avatar do barbeiro -->
                <div class="col-auto q-mr-md">
                  <q-avatar size="56px" :color="selectedBarber?.id === barber.id ? 'primary' : 'grey-4'" text-color="white">
                    <img v-if="barber.photoUrl" :src="getBarberPhotoUrl(barber.photoUrl)" :alt="barber.name" />
                    <q-icon v-else name="person" size="28px" />
                  </q-avatar>
                </div>
                
                <!-- Informações do barbeiro -->
                <div class="col">
                  <div class="text-h6 text-weight-medium">{{ barber.name }}</div>
                  <div class="text-body2 text-grey-6" v-if="barber.specialties">
                    <q-icon name="star" size="16px" class="q-mr-xs" />
                    {{ barber.specialties }}
                  </div>
                  <div class="text-body2 text-grey-7" v-else>
                    Barbeiro profissional
                  </div>
                </div>
                
                <!-- Indicador de seleção -->
                <div class="col-auto">
                  <q-icon 
                    :name="selectedBarber?.id === barber.id ? 'check_circle' : 'radio_button_unchecked'"
                    :color="selectedBarber?.id === barber.id ? 'primary' : 'grey-4'"
                    size="24px"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div class="row justify-end q-mt-lg">
          <q-btn 
            color="primary" 
            label="Próximo" 
            @click="nextStep"
            :disable="!selectedBarber"
            unelevated
          />
        </div>
      </q-step>

      <!-- Passo 2: Selecionar Serviço -->
      <q-step
        :name="2"
        title="Serviço"
        icon="content_cut"
        :done="step > 2"
        :header-nav="step > 2"
      >
        <div class="text-h6 q-mb-md">Escolha o serviço desejado</div>
        <div class="text-body2 text-grey-6 q-mb-lg">
          Selecione o tipo de atendimento que você deseja
        </div>
        
        <div class="q-gutter-md">
          <div 
            v-for="service in appointmentStore.services" 
            :key="service.id"
            class="service-option"
          >
            <q-card 
              class="service-card cursor-pointer"
              :class="{ 'selected': selectedService?.id === service.id }"
              @click="selectService(service)"
            >
              <q-card-section class="row items-center">
                <!-- Ícone do serviço -->
                <div class="col-auto q-mr-md">
                  <q-avatar size="48px" :color="selectedService?.id === service.id ? 'primary' : 'grey-4'" text-color="white">
                    <q-icon name="content_cut" />
                  </q-avatar>
                </div>
                
                <!-- Informações do serviço -->
                <div class="col">
                  <div class="text-h6 text-weight-medium">{{ service.name }}</div>
                  <div class="text-body2 text-grey-6 q-mb-xs">
                    <q-icon name="schedule" size="16px" class="q-mr-xs" />
                    {{ service.duration }} minutos
                  </div>
                  <div class="text-body2 text-grey-7" v-if="service.description">
                    {{ service.description }}
                  </div>
                </div>
                
                <!-- Preço -->
                <div class="col-auto text-right">
                  <div class="text-h6 text-weight-bold" :class="selectedService?.id === service.id ? 'text-primary' : 'text-grey-8'">
                    R$ {{ parseFloat(service.price).toFixed(2) }}
                  </div>
                </div>
                
                <!-- Indicador de seleção -->
                <div class="col-auto q-ml-sm">
                  <q-icon 
                    :name="selectedService?.id === service.id ? 'check_circle' : 'radio_button_unchecked'"
                    :color="selectedService?.id === service.id ? 'primary' : 'grey-4'"
                    size="24px"
                  />
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <div class="row justify-between q-mt-lg">
          <q-btn 
            flat 
            color="primary" 
            label="Voltar" 
            @click="prevStep"
          />
          <q-btn 
            color="primary" 
            label="Próximo" 
            @click="nextStep"
            :disable="!selectedService"
          />
        </div>
      </q-step>

      <!-- Passo 3: Selecionar Data -->
      <q-step
        :name="3"
        title="Data"
        icon="today"
        :done="step > 3"
        :header-nav="step > 3"
      >
        <div class="text-h6 q-mb-md">Escolha a data</div>
        
        <div class="date-picker-container">
          <q-date
            v-model="selectedDate"
            :options="dateOptions"
            color="primary"
            minimal
            class="full-width date-picker"
            locale="pt-BR"
            first-day-of-week="1"
          />
        </div>

        <div class="row justify-between q-mt-lg">
          <q-btn 
            flat 
            color="primary" 
            label="Voltar" 
            @click="prevStep"
          />
          <q-btn 
            color="primary" 
            label="Próximo" 
            @click="nextStep"
            :disable="!selectedDate"
          />
        </div>
      </q-step>

      <!-- Passo 4: Selecionar Horário -->
      <q-step
        :name="4"
        title="Horário"
        icon="schedule"
        :done="step > 4"
        :header-nav="step > 4"
      >
        <div class="text-h6 q-mb-md">Escolha o horário</div>
        
        <div v-if="loadingSlots" class="text-center q-py-lg">
          <q-spinner color="primary" size="3em" />
          <div class="q-mt-md">Carregando horários...</div>
        </div>

        <div v-else-if="appointmentStore.availableSlots.length === 0" class="text-center q-py-lg">
          <q-icon name="event_busy" size="48px" color="grey-5" />
          <div class="text-h6 text-grey-6 q-mt-md">
            Nenhum horário disponível
          </div>
          <div class="text-body2 text-grey-5">
            Tente outra data
          </div>
        </div>

        <div v-else class="time-slots-grid">
          <q-btn
            v-for="slot in appointmentStore.availableSlots" 
            :key="slot"
            :label="slot"
            :unelevated="selectedTime !== slot"
            :color="selectedTime === slot ? 'primary' : 'grey-4'"
            :text-color="selectedTime === slot ? 'white' : 'grey-8'"
            class="time-slot-btn"
            @click="selectTime(slot)"
            no-caps
          />
        </div>

        <div class="row justify-between q-mt-lg">
          <q-btn 
            flat 
            color="primary" 
            label="Voltar" 
            @click="prevStep"
          />
          <q-btn 
            color="primary" 
            label="Próximo" 
            @click="nextStep"
            :disable="!selectedTime"
          />
        </div>
      </q-step>

      <!-- Passo 5: Confirmação -->
      <q-step
        :name="5"
        title="Confirmação"
        icon="check_circle"
      >
        <div class="text-h6 q-mb-md">Confirme seu agendamento</div>
        
        <q-card flat bordered class="confirmation-card">
          <q-card-section class="confirmation-section">
            <!-- Avatar do barbeiro no topo -->
            <div class="text-center barber-header" v-if="selectedBarber">
              <q-avatar size="60px" color="primary" text-color="white" class="barber-avatar">
                <img v-if="selectedBarber.photoUrl" :src="getBarberPhotoUrl(selectedBarber.photoUrl)" :alt="selectedBarber.name" />
                <q-icon v-else name="person" size="30px" />
              </q-avatar>
              <div class="text-subtitle1 text-weight-medium">{{ selectedBarber.name }}</div>
            </div>
            
            <div class="appointment-details">
              <q-item class="appointment-item" dense>
                <q-item-section avatar>
                  <q-icon name="content_cut" color="primary" size="20px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ selectedService?.name }}</q-item-label>
                  <q-item-label caption class="text-grey-7">{{ selectedService?.duration }} min</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="text-subtitle1 text-primary text-weight-bold">
                    R$ {{ parseFloat(selectedService?.price || 0).toFixed(2) }}
                  </div>
                </q-item-section>
              </q-item>

              <q-item class="appointment-item" dense>
                <q-item-section avatar>
                  <q-icon name="today" color="primary" size="20px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ formatDate(selectedDate) }}</q-item-label>
                  <q-item-label caption class="text-grey-7">Data do agendamento</q-item-label>
                </q-item-section>
              </q-item>

              <q-item class="appointment-item" dense>
                <q-item-section avatar>
                  <q-icon name="schedule" color="primary" size="20px" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium">{{ selectedTime }}</q-item-label>
                  <q-item-label caption class="text-grey-7">Horário do atendimento</q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </q-card-section>
        </q-card>

        <!-- Observações -->
        <q-input
          v-model="notes"
          label="Observações (opcional)"
          type="textarea"
          outlined
          rows="2"
          class="q-mt-md compact-textarea"
        />

        <div class="row justify-between q-mt-lg">
          <q-btn 
            flat 
            color="primary" 
            label="Voltar" 
            @click="prevStep"
          />
          <q-btn 
            color="primary" 
            label="Confirmar Agendamento" 
            @click="confirmAppointment"
            :loading="appointmentStore.isLoading"
            :disable="appointmentStore.isLoading"
          />
        </div>
      </q-step>
    </q-stepper>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAppointmentStore } from 'src/stores'
import { api } from 'src/boot/axios'

const router = useRouter()
const $q = useQuasar()
const appointmentStore = useAppointmentStore()

// State
const step = ref(1)
const selectedBarber = ref(null)
const selectedService = ref(null)
const selectedDate = ref(null)
const selectedTime = ref(null)
const notes = ref('')
const loadingSlots = ref(false)

// Computed
const dateOptions = computed(() => {
  // Só permite datas futuras
  const today = new Date()
  return (date) => {
    const selectedDate = new Date(date)
    return selectedDate >= today
  }
})

// Methods
function selectBarber(barber) {
  selectedBarber.value = barber
  appointmentStore.selectBarber(barber)
}

function selectService(service) {
  selectedService.value = service
  appointmentStore.selectService(service)
}

function selectTime(time) {
  selectedTime.value = time
  appointmentStore.selectTime(time)
}

function nextStep() {
  if (step.value === 3 && selectedDate.value) {
    // Ao avançar para seleção de horário, carregar slots
    loadAvailableSlots()
  }
  step.value++
}

function prevStep() {
  step.value--
}

async function loadAvailableSlots() {
  if (!selectedBarber.value || !selectedService.value || !selectedDate.value) return
  
  loadingSlots.value = true
  await appointmentStore.fetchAvailableSlots(
    selectedBarber.value.id,
    selectedDate.value,
    selectedService.value.id
  )
  loadingSlots.value = false
}

async function confirmAppointment() {
  // Sincronizar todos os dados com a store antes de criar o agendamento
  appointmentStore.selectDate(selectedDate.value)
  appointmentStore.selectTime(selectedTime.value)
  
  console.log('Confirmando agendamento:')
  console.log('- Data:', selectedDate.value)
  console.log('- Horário:', selectedTime.value)
  console.log('- Store selectedTime:', appointmentStore.selectedTime)
  
  const result = await appointmentStore.createAppointment(notes.value)
  
  if (result.success) {
    $q.notify({
      type: 'positive',
      message: 'Agendamento criado com sucesso!',
      position: 'top'
    })
    router.push('/appointments')
  } else {
    $q.notify({
      type: 'negative',
      message: result.message,
      position: 'top'
    })
  }
}

function getBarberPhotoUrl(photo) {
  if (photo?.startsWith('http')) return photo
  return `${api.defaults.baseURL}/uploads/barbers/${photo}`
}

function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Watchers
watch(selectedDate, () => {
  // Limpar horário selecionado quando mudar data
  selectedTime.value = null
  appointmentStore.availableSlots = []
})

// Lifecycle
onMounted(async () => {
  // Carregar dados iniciais
  await appointmentStore.fetchBarbers()
  await appointmentStore.fetchServices()
})
</script>

<style lang="scss" scoped>
// Estilos específicos para o stepper
.appointment-stepper {
  border-radius: 12px;
  overflow: hidden;
  
  // CSS simples para mobile responsivo
  ::v-deep(.q-stepper__header) {
    @media (max-width: 599px) {
      padding: 8px;
      
      .q-stepper__tab {
        padding: 8px 4px;
        
        .q-stepper__label {
          font-size: 0.8rem;
        }
        
        .q-stepper__title {
          font-size: 0.75rem;
        }
      }
    }
  }
  
  ::v-deep(.q-stepper__content) {
    padding: 20px 16px;
    
    @media (max-width: 599px) {
      padding: 16px 12px;
    }
  }
}

.barber-card,
.service-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
    border-color: rgba($primary, 0.3);
  }
  
  &.selected {
    border-color: $primary;
    background-color: rgba($primary, 0.05);
    box-shadow: 0 4px 16px rgba($primary, 0.2);
    transform: translateY(-1px);
  }
}

.barber-option,
.service-option {
  width: 100%;
}

.barber-card {
  min-height: 70px;
  
  .q-card-section {
    padding: 16px 20px;
  }
}

.service-card {
  min-height: 80px;
  
  .q-card-section {
    padding: 20px;
  }
}

// Melhorar aparência no mobile
@media (max-width: 599px) {
  .barber-card,
  .service-card {
    .q-card-section {
      padding: 16px;
    }
    
    .q-avatar {
      width: 48px !important;
      height: 48px !important;
    }
    
    .text-h6 {
      font-size: 1rem;
    }
  }
}

// Estilos para o seletor de data
.date-picker-container {
  display: flex;
  justify-content: center;
  margin: 20px 0;
  
  .date-picker {
    max-width: 100%;
    
    @media (max-width: 599px) {
      // Melhorar responsividade do date picker
      ::v-deep(.q-date) {
        width: 100% !important;
        max-width: none !important;
        
        .q-date__header {
          padding: 8px 12px;
        }
        
        .q-date__content {
          padding: 8px;
        }
        
        .q-date__calendar-item {
          min-height: 36px;
          font-size: 0.9rem;
        }
      }
    }
  }
}

// Grid responsivo para horários
.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 10px;
  margin: 20px 0;
  
  @media (max-width: 599px) {
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
  }
  
  @media (max-width: 360px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 4px;
  }
}

.time-slot-btn {
  min-height: 40px;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-weight: 500;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  @media (max-width: 599px) {
    min-height: 36px;
    font-size: 0.85rem;
    padding: 0 8px;
  }
  
  @media (max-width: 480px) {
    min-height: 34px;
    font-size: 0.8rem;
    padding: 0 6px;
  }
  
  @media (max-width: 360px) {
    min-height: 32px;
    font-size: 0.75rem;
    padding: 0 4px;
  }
}

// Estados de animação para seleção
.barber-card,
.service-card {
  &.selected {
    .q-avatar {
      animation: pulse 0.6s ease-in-out;
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

// Melhorar espaçamento vertical
.barber-option,
.service-option {
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

// Melhorar layout da confirmação
.confirmation-card {
  border-radius: 16px;
  overflow: hidden;
  
  .confirmation-section {
    padding: 16px;
    
    @media (max-width: 599px) {
      padding: 12px;
    }
  }
  
  .barber-header {
    margin-bottom: 16px;
    
    @media (max-width: 599px) {
      margin-bottom: 12px;
    }
  }
  
  .barber-avatar {
    border: 2px solid $primary;
    box-shadow: 0 4px 12px rgba($primary, 0.3);
    
    @media (max-width: 599px) {
      border: 2px solid $primary;
      box-shadow: 0 2px 8px rgba($primary, 0.3);
    }
  }
  
  .appointment-details {
    .appointment-item {
      padding: 12px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      min-height: auto;
      
      &:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
      
      @media (max-width: 599px) {
        padding: 8px 0;
        
        .q-item__section--avatar {
          min-width: 32px;
        }
        
        .q-item__label {
          font-size: 0.9rem;
        }
        
        .q-item__label--caption {
          font-size: 0.75rem;
        }
      }
    }
  }
}

// Campo de observações compacto
.compact-textarea {
  @media (max-width: 599px) {
    ::v-deep(.q-field__control) {
      min-height: 60px;
    }
    
    ::v-deep(.q-field__native) {
      min-height: 40px;
    }
  }
}

// Campo de observações compacto
.compact-textarea {
  @media (max-width: 599px) {
    ::v-deep(.q-field__control) {
      min-height: 60px;
    }
    
    ::v-deep(.q-field__native) {
      min-height: 40px;
    }
  }
}

// Melhorar layout dos botões de navegação
.row.justify-between,
.row.justify-end {
  @media (max-width: 599px) {
    gap: 12px;
    
    .q-btn {
      flex: 1;
      min-width: 100px;
    }
  }
}
</style>
