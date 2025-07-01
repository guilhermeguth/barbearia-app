<template>
  <div class="calendar-container">
    <!-- Header com filtros e controles -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h4 class="q-ma-none text-primary text-weight-bold">
          <q-icon name="calendar_month" class="q-mr-sm" />
          Agenda da Barbearia
        </h4>
        <p class="text-grey-6 q-mb-none">Gerencie agendamentos com drag & drop</p>
      </div>
      
      <div class="row q-gutter-sm">
        <!-- Filtro por barbeiro -->
        <q-select
          v-model="selectedBarber"
          :options="barberOptions"
          label="Filtrar por barbeiro"
          outlined
          dense
          clearable
          style="min-width: 200px"
          @update:model-value="refreshCalendar"
        />
        
        <!-- Botão para novo agendamento -->
        <q-btn
          color="primary"
          icon="add"
          label="Novo Agendamento"
          @click="showNewAppointmentDialog"
        />
        
        <!-- Botão para agendamento recorrente -->
        <q-btn
          color="secondary"
          icon="repeat"
          label="Agendamento Recorrente"
          @click="showRecurringDialog"
        />
      </div>
    </div>

    <!-- Calendário -->
    <q-card>
      <q-card-section>
        <FullCalendar
          ref="calendar"
          :options="calendarOptions"
        />
      </q-card-section>
    </q-card>

    <!-- Dialog para novo agendamento -->
    <q-dialog v-model="showNewDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Novo Agendamento</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="createAppointment" class="q-gutter-md">
            <!-- Cliente -->
            <q-select
              v-model="newAppointment.customerId"
              :options="customerOptions"
              label="Cliente *"
              outlined
              dense
              :rules="[val => !!val || 'Campo obrigatório']"
            />

            <!-- Barbeiro -->
            <q-select
              v-model="newAppointment.barberId"
              :options="barberOptions"
              label="Barbeiro *"
              outlined
              dense
              :rules="[val => !!val || 'Campo obrigatório']"
            />

            <!-- Serviço -->
            <q-select
              v-model="newAppointment.serviceId"
              :options="serviceOptions"
              label="Serviço *"
              outlined
              dense
              :rules="[val => !!val || 'Campo obrigatório']"
            />

            <!-- Data -->
            <q-input
              v-model="newAppointment.date"
              label="Data *"
              outlined
              dense
              type="date"
              :rules="[val => !!val || 'Campo obrigatório']"
            />

            <!-- Horário -->
            <q-input
              v-model="newAppointment.time"
              label="Horário *"
              outlined
              dense
              type="time"
              :rules="[val => !!val || 'Campo obrigatório']"
            />

            <!-- Observações -->
            <q-input
              v-model="newAppointment.notes"
              label="Observações"
              outlined
              dense
              type="textarea"
              rows="3"
            />

            <div class="row q-gutter-sm">
              <q-btn
                type="submit"
                color="primary"
                label="Criar"
                :loading="creating"
              />
              <q-btn
                color="grey"
                label="Cancelar"
                @click="showNewDialog = false"
                outline
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog para agendamento recorrente -->
    <q-dialog v-model="showRecurringAppointmentDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section>
          <div class="text-h6">Agendamento Recorrente</div>
          <div class="text-subtitle2 text-grey-6">
            Ideal para clientes fixos com horários regulares
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-form @submit="createRecurringAppointment" class="q-gutter-md">
            <!-- Cliente -->
            <q-select
              v-model="recurringAppointment.customerId"
              :options="customerOptions"
              label="Cliente *"
              outlined
              dense
              :rules="[val => !!val || 'Campo obrigatório']"
            />

            <!-- Barbeiro -->
            <q-select
              v-model="recurringAppointment.barberId"
              :options="barberOptions"
              label="Barbeiro *"
              outlined
              dense
              :rules="[val => !!val || 'Campo obrigatório']"
            />

            <!-- Serviço -->
            <q-select
              v-model="recurringAppointment.serviceId"
              :options="serviceOptions"
              label="Serviço *"
              outlined
              dense
              :rules="[val => !!val || 'Campo obrigatório']"
            />

            <!-- Data inicial -->
            <q-input
              v-model="recurringAppointment.startDate"
              label="Data inicial *"
              outlined
              dense
              type="date"
              :rules="[val => !!val || 'Campo obrigatório']"
            />

            <!-- Horário -->
            <q-input
              v-model="recurringAppointment.time"
              label="Horário *"
              outlined
              dense
              type="time"
              :rules="[val => !!val || 'Campo obrigatório']"
            />

            <!-- Tipo de recorrência -->
            <q-select
              v-model="recurringAppointment.recurrenceType"
              :options="recurrenceOptions"
              label="Frequência *"
              outlined
              dense
              :rules="[val => !!val || 'Campo obrigatório']"
            />

            <!-- Data fim -->
            <q-input
              v-model="recurringAppointment.endDate"
              label="Data limite (opcional)"
              outlined
              dense
              type="date"
              hint="Deixe vazio para criar 10 agendamentos"
            />

            <!-- Observações -->
            <q-input
              v-model="recurringAppointment.notes"
              label="Observações"
              outlined
              dense
              type="textarea"
              rows="2"
            />

            <div class="row q-gutter-sm">
              <q-btn
                type="submit"
                color="secondary"
                label="Criar Série"
                :loading="creatingRecurring"
              />
              <q-btn
                color="grey"
                label="Cancelar"
                @click="showRecurringAppointmentDialog = false"
                outline
              />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog para editar agendamento -->
    <q-dialog v-model="showEditDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Editar Agendamento</div>
        </q-card-section>

        <q-card-section class="q-pt-none" v-if="selectedEvent">
          <div class="q-gutter-md">
            <div class="row items-center">
              <q-icon name="person" class="q-mr-sm" />
              <strong>Cliente:</strong> {{ selectedEvent.extendedProps.customerName }}
            </div>
            
            <div class="row items-center">
              <q-icon name="content_cut" class="q-mr-sm" />
              <strong>Barbeiro:</strong> {{ selectedEvent.extendedProps.barberName }}
            </div>
            
            <div class="row items-center">
              <q-icon name="room_service" class="q-mr-sm" />
              <strong>Serviço:</strong> {{ selectedEvent.extendedProps.serviceName }}
            </div>
            
            <div class="row items-center">
              <q-icon name="schedule" class="q-mr-sm" />
              <strong>Horário:</strong> {{ formatDateTime(selectedEvent.start) }}
            </div>
            
            <div class="row items-center">
              <q-icon name="attach_money" class="q-mr-sm" />
              <strong>Preço:</strong> R$ {{ selectedEvent.extendedProps.totalPrice.toFixed(2) }}
            </div>

            <div class="row items-center">
              <q-icon name="info" class="q-mr-sm" />
              <strong>Status:</strong> 
              <q-chip 
                :color="getStatusColor(selectedEvent.extendedProps.status)"
                text-color="white"
                size="sm"
                class="q-ml-sm"
              >
                {{ getStatusLabel(selectedEvent.extendedProps.status) }}
              </q-chip>
            </div>

            <div v-if="selectedEvent.extendedProps.notes" class="row items-start">
              <q-icon name="note" class="q-mr-sm q-mt-xs" />
              <div>
                <strong>Observações:</strong><br>
                {{ selectedEvent.extendedProps.notes }}
              </div>
            </div>

            <q-separator />

            <div class="row q-gutter-sm">
              <q-btn
                color="negative"
                label="Cancelar"
                icon="cancel"
                @click="cancelAppointment"
                :loading="cancelling"
                size="sm"
              />
              <q-btn
                color="positive"
                label="Marcar Concluído"
                icon="check"
                @click="completeAppointment"
                :loading="completing"
                size="sm"
                v-if="selectedEvent.extendedProps.status === 'scheduled'"
              />
              <q-btn
                color="grey"
                label="Fechar"
                @click="showEditDialog = false"
                outline
                size="sm"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import listPlugin from '@fullcalendar/list'

export default defineComponent({
  name: 'CalendarPage',
  components: {
    FullCalendar
  },
  setup() {
    const $q = useQuasar()
    const calendar = ref(null)
    
    // Estados reativo
    const selectedBarber = ref(null)
    const showNewDialog = ref(false)
    const showRecurringAppointmentDialog = ref(false)
    const showEditDialog = ref(false)
    const creating = ref(false)
    const creatingRecurring = ref(false)
    const cancelling = ref(false)
    const completing = ref(false)
    const selectedEvent = ref(null)

    // Opções para selects
    const barberOptions = ref([])
    const customerOptions = ref([])
    const serviceOptions = ref([])
    
    const recurrenceOptions = [
      { label: 'Semanal', value: 'weekly' },
      { label: 'Quinzenal', value: 'biweekly' },
      { label: 'Mensal', value: 'monthly' }
    ]

    // Dados do novo agendamento
    const newAppointment = ref({
      customerId: null,
      barberId: null,
      serviceId: null,
      date: '',
      time: '',
      notes: ''
    })

    // Dados do agendamento recorrente
    const recurringAppointment = ref({
      customerId: null,
      barberId: null,
      serviceId: null,
      startDate: '',
      endDate: '',
      time: '',
      recurrenceType: null,
      notes: ''
    })

    // Configurações do FullCalendar
    const calendarOptions = ref({
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin],
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
      },
      initialView: 'timeGridWeek',
      locale: 'pt-br',
      buttonText: {
        today: 'Hoje',
        month: 'Mês',
        week: 'Semana',
        day: 'Dia',
        list: 'Lista'
      },
      slotMinTime: '08:00:00',
      slotMaxTime: '18:00:00',
      businessHours: {
        daysOfWeek: [1, 2, 3, 4, 5, 6], // Segunda a sábado
        startTime: '08:00',
        endTime: '18:00'
      },
      height: 'auto',
      editable: true, // Permite drag & drop
      droppable: true,
      eventResizableFromStart: true,
      eventDurationEditable: false,
      selectable: true,
      selectMirror: true,
      weekends: true,
      allDaySlot: false,
      events: loadCalendarEvents,
      eventClick: handleEventClick,
      eventDrop: handleEventDrop,
      eventResize: handleEventResize,
      select: handleDateSelect,
      dateClick: handleDateClick
    })

    // Carregar eventos do calendário
    async function loadCalendarEvents(info) {
      try {
        const params = {
          start: info.startStr,
          end: info.endStr
        }
        
        if (selectedBarber.value) {
          params.barberId = selectedBarber.value
        }

        const response = await api.get('/appointments/calendar/events', { params })
        return response.data
      } catch (error) {
        console.error('Erro ao carregar eventos:', error)
        $q.notify({
          type: 'negative',
          message: 'Erro ao carregar agendamentos',
          caption: 'Tente novamente em alguns instantes'
        })
        return []
      }
    }

    // Refresh do calendário
    function refreshCalendar() {
      if (calendar.value) {
        calendar.value.getApi().refetchEvents()
      }
    }

    // Clique em evento
    function handleEventClick(info) {
      selectedEvent.value = info.event
      showEditDialog.value = true
    }

    // Drag & drop de evento
    async function handleEventDrop(info) {
      try {
        await api.put(`/appointments/${info.event.id}/move`, {
          newDateTime: info.event.start.toISOString(),
          barberId: info.event.extendedProps.barberId
        })

        $q.notify({
          type: 'positive',
          message: 'Agendamento movido com sucesso',
          icon: 'check'
        })
      } catch (error) {
        info.revert() // Desfaz a mudança
        
        $q.notify({
          type: 'negative',
          message: 'Erro ao mover agendamento',
          caption: error.response?.data?.message || 'Horário pode estar ocupado'
        })
      }
    }

    // Redimensionar evento
    function handleEventResize(info) {
      // Por ora, não permitir redimensionar
      info.revert()
      $q.notify({
        type: 'info',
        message: 'Redimensionamento não disponível',
        caption: 'Use a edição manual para alterar a duração'
      })
    }

    // Seleção de data/horário
    function handleDateSelect(info) {
      const date = info.startStr.split('T')[0]
      const time = info.startStr.includes('T') ? info.startStr.split('T')[1].substring(0, 5) : '09:00'
      
      newAppointment.value.date = date
      newAppointment.value.time = time
      showNewDialog.value = true
    }

    // Clique em data
    function handleDateClick(info) {
      newAppointment.value.date = info.dateStr
      newAppointment.value.time = '09:00'
      showNewDialog.value = true
    }

    // Carregar dados para selects
    async function loadSelectOptions() {
      try {
        // Carregar barbeiros
        const barbersResponse = await api.get('/barbers')
        barberOptions.value = barbersResponse.data.map(barber => ({
          label: barber.name,
          value: barber.id
        }))

        // Carregar clientes
        const customersResponse = await api.get('/customers')
        customerOptions.value = customersResponse.data.map(customer => ({
          label: customer.name,
          value: customer.id
        }))

        // Carregar serviços
        const servicesResponse = await api.get('/services')
        serviceOptions.value = servicesResponse.data.map(service => ({
          label: `${service.name} - R$ ${parseFloat(service.price).toFixed(2)}`,
          value: service.id
        }))
      } catch (error) {
        console.error('Erro ao carregar opções:', error)
      }
    }

    // Criar agendamento
    async function createAppointment() {
      creating.value = true
      
      try {
        await api.post('/appointments', {
          customerId: newAppointment.value.customerId,
          barberId: newAppointment.value.barberId,
          serviceIds: [newAppointment.value.serviceId],
          appointmentDate: newAppointment.value.date,
          startTime: newAppointment.value.time,
          notes: newAppointment.value.notes
        })

        $q.notify({
          type: 'positive',
          message: 'Agendamento criado com sucesso',
          icon: 'check'
        })

        showNewDialog.value = false
        refreshCalendar()
        resetNewAppointment()
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Erro ao criar agendamento',
          caption: error.response?.data?.message || 'Tente novamente'
        })
      } finally {
        creating.value = false
      }
    }

    // Criar agendamento recorrente
    async function createRecurringAppointment() {
      creatingRecurring.value = true
      
      try {
        await api.post('/appointments/recurring', {
          customerId: recurringAppointment.value.customerId,
          barberId: recurringAppointment.value.barberId,
          serviceIds: [recurringAppointment.value.serviceId],
          appointmentDate: recurringAppointment.value.startDate,
          startTime: recurringAppointment.value.time,
          recurrenceType: recurringAppointment.value.recurrenceType,
          recurrenceEndDate: recurringAppointment.value.endDate || null,
          notes: recurringAppointment.value.notes
        })

        $q.notify({
          type: 'positive',
          message: 'Agendamentos recorrentes criados com sucesso',
          icon: 'repeat'
        })

        showRecurringAppointmentDialog.value = false
        refreshCalendar()
        resetRecurringAppointment()
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Erro ao criar agendamentos recorrentes',
          caption: error.response?.data?.message || 'Tente novamente'
        })
      } finally {
        creatingRecurring.value = false
      }
    }

    // Cancelar agendamento
    async function cancelAppointment() {
      cancelling.value = true
      
      try {
        await api.put(`/appointments/${selectedEvent.value.id}/cancel`)
        
        $q.notify({
          type: 'positive',
          message: 'Agendamento cancelado',
          icon: 'cancel'
        })

        showEditDialog.value = false
        refreshCalendar()
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Erro ao cancelar agendamento',
          caption: error.response?.data?.message
        })
      } finally {
        cancelling.value = false
      }
    }

    // Concluir agendamento
    async function completeAppointment() {
      completing.value = true
      
      try {
        await api.put(`/appointments/${selectedEvent.value.id}`, {
          status: 'completed'
        })
        
        $q.notify({
          type: 'positive',
          message: 'Agendamento concluído',
          icon: 'check'
        })

        showEditDialog.value = false
        refreshCalendar()
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Erro ao concluir agendamento',
          caption: error.response?.data?.message
        })
      } finally {
        completing.value = false
      }
    }

    // Funções auxiliares
    function showNewAppointmentDialog() {
      resetNewAppointment()
      showNewDialog.value = true
    }

    function showRecurringDialog() {
      resetRecurringAppointment()
      showRecurringAppointmentDialog.value = true
    }

    function resetNewAppointment() {
      newAppointment.value = {
        customerId: null,
        barberId: null,
        serviceId: null,
        date: '',
        time: '',
        notes: ''
      }
    }

    function resetRecurringAppointment() {
      recurringAppointment.value = {
        customerId: null,
        barberId: null,
        serviceId: null,
        startDate: '',
        endDate: '',
        time: '',
        recurrenceType: null,
        notes: ''
      }
    }

    function formatDateTime(date) {
      return new Date(date).toLocaleString('pt-BR')
    }

    function getStatusColor(status) {
      switch (status) {
        case 'scheduled': return 'primary'
        case 'in_progress': return 'positive'
        case 'completed': return 'grey'
        case 'cancelled': return 'negative'
        default: return 'primary'
      }
    }

    function getStatusLabel(status) {
      switch (status) {
        case 'scheduled': return 'Agendado'
        case 'in_progress': return 'Em Andamento'
        case 'completed': return 'Concluído'
        case 'cancelled': return 'Cancelado'
        default: return 'Agendado'
      }
    }

    onMounted(async () => {
      await loadSelectOptions()
    })

    return {
      calendar,
      selectedBarber,
      showNewDialog,
      showRecurringAppointmentDialog,
      showEditDialog,
      creating,
      creatingRecurring,
      cancelling,
      completing,
      selectedEvent,
      barberOptions,
      customerOptions,
      serviceOptions,
      recurrenceOptions,
      newAppointment,
      recurringAppointment,
      calendarOptions,
      refreshCalendar,
      showNewAppointmentDialog,
      showRecurringDialog,
      createAppointment,
      createRecurringAppointment,
      cancelAppointment,
      completeAppointment,
      formatDateTime,
      getStatusColor,
      getStatusLabel
    }
  }
})
</script>

<style scoped>
.calendar-container {
  max-width: 100%;
}

:deep(.fc-toolbar-title) {
  font-size: 1.5em !important;
  font-weight: 600 !important;
}

:deep(.fc-button-primary) {
  background-color: var(--q-primary) !important;
  border-color: var(--q-primary) !important;
}

:deep(.fc-event) {
  border-radius: 4px !important;
  font-size: 0.85em !important;
  cursor: pointer !important;
}

:deep(.fc-timegrid-slot) {
  height: 40px !important;
}

:deep(.fc-col-header-cell) {
  background-color: #f5f5f5 !important;
}
</style>
