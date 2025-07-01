<template>
  <q-page class="q-pa-lg">
    <!-- Header da página -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h4 class="q-ma-none text-primary text-weight-bold">
          <q-icon name="calendar_month" class="q-mr-sm" />
          Agenda da Barbearia
        </h4>
        <p class="text-grey-6 q-mb-none">Gerencie agendamentos com drag & drop</p>
      </div>
      
      <div class="row q-gutter-sm">
        <!-- Botão para novo agendamento -->
        <q-btn
          color="primary"
          icon="add"
          label="Novo Agendamento"
          @click="showNewAppointmentDialog"
          unelevated
        />
        
        <!-- Botão para agendamento recorrente -->
        <q-btn
          color="secondary"
          icon="repeat"
          label="Agendamento Recorrente"
          @click="showRecurringDialog"
          unelevated
        />
      </div>
    </div>

    <!-- Filtros -->
    <div class="q-mb-md">
      <q-select
        v-model="selectedBarber"
        :options="barberOptions"
        label="Filtrar por barbeiro"
        outlined
        clearable
        style="max-width: 300px"
        @update:model-value="refreshCalendar"
      />
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
    <q-dialog v-model="showNewDialog" @hide="closeNewDialog">
      <q-card style="min-width: 600px; max-width: 800px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="add" class="q-mr-sm" />
            Novo Agendamento
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="createAppointment" class="q-gutter-md">
            <!-- Cliente -->
            <q-select
              v-model="newAppointment.customerId"
              :options="customerOptions"
              label="Cliente *"
              outlined
              :rules="[val => !!val || 'Campo obrigatório']"
            />

            <!-- Barbeiro -->
            <q-select
              v-model="newAppointment.barberId"
              :options="barberOptions"
              label="Barbeiro *"
              outlined
              :rules="[val => !!val || 'Campo obrigatório']"
              @update:model-value="loadAvailableSlots"
            />

            <!-- Serviço -->
            <q-select
              v-model="newAppointment.serviceId"
              :options="serviceOptions"
              label="Serviço *"
              outlined
              :rules="[val => !!val || 'Campo obrigatório']"
              @update:model-value="onServiceChange"
            />

            <!-- Data -->
            <q-input
              v-model="newAppointment.date"
              label="Data *"
              outlined
              type="date"
              :rules="[val => !!val || 'Campo obrigatório']"
              @update:model-value="loadAvailableSlots"
            />

            <!-- Horários Disponíveis -->
            <div v-if="newAppointment.date && newAppointment.barberId && newAppointment.serviceId">
              <q-label>Horários Disponíveis *</q-label>
              <div v-if="loadingSlots" class="text-center q-pa-md">
                <q-spinner color="primary" size="2em" />
                <div class="text-grey-6 q-mt-sm">Carregando horários...</div>
              </div>
              <div v-else-if="availableSlots.length > 0" class="time-slots-grid">
                <q-chip
                  v-for="slot in availableSlots"
                  :key="slot"
                  :selected="newAppointment.selectedTime === slot"
                  @click="newAppointment.selectedTime = slot"
                  clickable
                  :color="newAppointment.selectedTime === slot ? 'primary' : 'grey-3'"
                  :text-color="newAppointment.selectedTime === slot ? 'white' : 'black'"
                  class="time-slot-chip"
                >
                  {{ slot }}
                </q-chip>
              </div>
              <div v-else class="text-center q-pa-md text-grey-6">
                <q-icon name="schedule" size="2em" class="q-mb-sm" />
                <div>Nenhum horário disponível para esta data</div>
              </div>
            </div>

            <!-- Observações -->
            <q-input
              v-model="newAppointment.notes"
              label="Observações"
              outlined
              type="textarea"
              rows="3"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            label="Cancelar"
            @click="closeNewDialog"
            color="grey-7"
          />
          <q-btn
            @click="createAppointment"
            color="primary"
            label="Criar Agendamento"
            :loading="creating"
            :disable="!isNewAppointmentValid"
            unelevated
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para agendamento recorrente -->
    <q-dialog v-model="showRecurringAppointmentDialog" @hide="closeRecurringDialog">
      <q-card style="min-width: 600px; max-width: 800px">
        <q-card-section class="bg-secondary text-white">
          <div class="text-h6">
            <q-icon name="repeat" class="q-mr-sm" />
            Agendamento Recorrente
          </div>
          <div class="text-subtitle2 text-white">
            Ideal para clientes fixos com horários regulares
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="createRecurringAppointment" class="q-gutter-md">
            <!-- Cliente -->
            <q-select
              v-model="recurringAppointment.customerId"
              :options="customerOptions"
              label="Cliente *"
              outlined
              :rules="[val => !!val || 'Campo obrigatório']"
            />

            <!-- Barbeiro -->
            <q-select
              v-model="recurringAppointment.barberId"
              :options="barberOptions"
              label="Barbeiro *"
              outlined
              :rules="[val => !!val || 'Campo obrigatório']"
              @update:model-value="loadRecurringAvailableSlots"
            />

            <!-- Serviço -->
            <q-select
              v-model="recurringAppointment.serviceId"
              :options="serviceOptions"
              label="Serviço *"
              outlined
              :rules="[val => !!val || 'Campo obrigatório']"
              @update:model-value="onRecurringServiceChange"
            />

            <!-- Data inicial -->
            <q-input
              v-model="recurringAppointment.startDate"
              label="Data inicial *"
              outlined
              type="date"
              :rules="[val => !!val || 'Campo obrigatório']"
              @update:model-value="loadRecurringAvailableSlots"
            />

            <!-- Horários Disponíveis -->
            <div v-if="recurringAppointment.startDate && recurringAppointment.barberId && recurringAppointment.serviceId">
              <q-label>Horários Disponíveis *</q-label>
              <div v-if="loadingSlots" class="text-center q-pa-md">
                <q-spinner color="primary" size="2em" />
                <div class="text-grey-6 q-mt-sm">Carregando horários...</div>
              </div>
              <div v-else class="time-slots-grid q-mt-sm">
                <q-btn
                  v-for="slot in recurringAvailableSlots"
                  :key="slot"
                  :color="recurringAppointment.time === slot ? 'primary' : 'grey-3'"
                  :text-color="recurringAppointment.time === slot ? 'white' : 'dark'"
                  :outline="recurringAppointment.time !== slot"
                  size="sm"
                  class="slot-btn"
                  @click="recurringAppointment.time = slot"
                >
                  {{ slot }}
                </q-btn>
                <div v-if="recurringAvailableSlots.length === 0" class="text-grey-6 q-pa-md">
                  Nenhum horário disponível para esta data
                </div>
              </div>
            </div>

            <!-- Tipo de recorrência -->
            <q-select
              v-model="recurringAppointment.recurrenceType"
              :options="recurrenceOptions"
              label="Frequência *"
              outlined
              :rules="[val => !!val || 'Campo obrigatório']"
            />

            <!-- Data fim -->
            <q-input
              v-model="recurringAppointment.endDate"
              label="Data limite (opcional)"
              outlined
              type="date"
              hint="Deixe vazio para criar 10 agendamentos"
            />

            <!-- Observações -->
            <q-input
              v-model="recurringAppointment.notes"
              label="Observações"
              outlined
              type="textarea"
              rows="2"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            label="Cancelar"
            @click="closeRecurringDialog"
            color="grey-7"
          />
          <q-btn
            @click="createRecurringAppointment"
            color="secondary"
            label="Criar Série"
            :loading="creatingRecurring"
            :disable="!isRecurringAppointmentValid"
            unelevated
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para editar agendamento -->
    <q-dialog v-model="showEditDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="edit" class="q-mr-sm" />
            Editar Agendamento
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md" v-if="selectedEvent">
          <div class="q-gutter-md">
            <div class="row items-center q-gutter-x-sm">
              <q-icon name="person" />
              <strong>Cliente:</strong>
              <span>{{ selectedEvent.extendedProps.customerName }}</span>
            </div>
            
            <div class="row items-center q-gutter-x-sm">
              <q-icon name="content_cut" />
              <strong>Barbeiro:</strong>
              <span>{{ selectedEvent.extendedProps.barberName }}</span>
            </div>
            
            <div class="row items-center q-gutter-x-sm">
              <q-icon name="room_service" />
              <strong>Serviço:</strong>
              <span>{{ selectedEvent.extendedProps.serviceName }}</span>
            </div>
            
            <div class="row items-center q-gutter-x-sm">
              <q-icon name="schedule" />
              <strong>Horário:</strong>
              <span>{{ formatDateTime(selectedEvent.start) }}</span>
            </div>
            
            <div class="row items-center q-gutter-x-sm">
              <q-icon name="attach_money" />
              <strong>Preço:</strong>
              <span>R$ {{ selectedEvent.extendedProps.totalPrice.toFixed(2) }}</span>
            </div>

            <div class="row items-center q-gutter-x-sm">
              <q-icon name="info" />
              <strong>Status:</strong>
              <q-chip 
                :color="getStatusColor(selectedEvent.extendedProps.status)"
                text-color="white"
                size="sm"
              >
                {{ getStatusLabel(selectedEvent.extendedProps.status) }}
              </q-chip>
            </div>

            <div v-if="selectedEvent.extendedProps.notes" class="row items-start q-gutter-x-sm">
              <q-icon name="note" class="q-mt-xs" />
              <strong>Observações:</strong>
              <span>{{ selectedEvent.extendedProps.notes }}</span>
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
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue'
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
    
    // Horários disponíveis
    const availableSlots = ref([])
    const recurringAvailableSlots = ref([])
    const loadingSlots = ref(false)
    
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
      selectedTime: '',
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
      // Formatação dos cabeçalhos dos dias
      dayHeaderFormat: {
        weekday: 'long', // Nome completo do dia da semana
        day: '2-digit',  // Dia com 2 dígitos
        month: '2-digit' // Mês com 2 dígitos
      },
      // Formatação alternativa para diferentes visualizações
      views: {
        timeGridWeek: {
          dayHeaderFormat: {
            weekday: 'long', 
            day: '2-digit',
            month: '2-digit'
          }
        },
        timeGridDay: {
          dayHeaderFormat: {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          }
        },
        dayGridMonth: {
          dayHeaderFormat: {
            weekday: 'long'
          }
        }
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
          // Extrair apenas o ID numérico do barbeiro
          const barberId = typeof selectedBarber.value === 'object' 
            ? selectedBarber.value.value 
            : selectedBarber.value
          params.barberId = barberId
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
      
      newAppointment.value.date = date
      newAppointment.value.time = ''
      showNewDialog.value = true
      
      // Carregar horários se já tiver barbeiro e serviço selecionados
      if (newAppointment.value.barberId && newAppointment.value.serviceId) {
        loadAvailableSlots()
      }
    }

    // Clique em data
    function handleDateClick(info) {
      newAppointment.value.date = info.dateStr
      newAppointment.value.time = ''
      showNewDialog.value = true
      
      // Carregar horários se já tiver barbeiro e serviço selecionados
      if (newAppointment.value.barberId && newAppointment.value.serviceId) {
        loadAvailableSlots()
      }
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
          value: service.id,
          duration: service.duration // Guardar a duração para uso posterior
        }))
      } catch (error) {
        console.error('Erro ao carregar opções:', error)
      }
    }

    // Carregar horários disponíveis
    async function loadAvailableSlots() {
      if (!newAppointment.value.barberId || !newAppointment.value.date || !newAppointment.value.serviceId) {
        availableSlots.value = []
        return
      }

      loadingSlots.value = true
      try {
        // Verificar se o usuário está autenticado
        const token = localStorage.getItem('auth_token')
        if (!token) {
          $q.notify({
            type: 'warning',
            message: 'Você precisa estar logado para acessar esta funcionalidade'
          })
          availableSlots.value = []
          return
        }

        // Garantir que barberId seja um número/string válido
        const barberId = typeof newAppointment.value.barberId === 'object' 
          ? newAppointment.value.barberId?.value || newAppointment.value.barberId?.id
          : newAppointment.value.barberId

        // Garantir que serviceId seja um número/string válido
        const serviceId = typeof newAppointment.value.serviceId === 'object'
          ? newAppointment.value.serviceId?.value || newAppointment.value.serviceId?.id
          : newAppointment.value.serviceId

        // Garantir que date seja uma string de data simples (YYYY-MM-DD)
        let dateStr = newAppointment.value.date
        if (dateStr.includes('T')) {
          dateStr = dateStr.split('T')[0]
        }

        // Encontrar a duração do serviço selecionado
        const selectedService = serviceOptions.value.find(s => s.value === serviceId)
        const duration = selectedService?.duration || 60

        const response = await api.get(`/appointments/available-slots/${barberId}/${dateStr}/${duration}?serviceId=${serviceId}`)
        availableSlots.value = response.data.availableSlots
      } catch (error) {
        console.error('Erro ao carregar horários:', error)
        availableSlots.value = []
        
        if (error.response?.status === 401) {
          $q.notify({
            type: 'warning',
            message: 'Sessão expirada. Faça login novamente.'
          })
        } else if (error.response?.status === 500) {
          $q.notify({
            type: 'negative',
            message: 'Erro no servidor. Tente novamente em alguns instantes.',
            caption: 'Se o problema persistir, contate o suporte.'
          })
        } else {
          $q.notify({
            type: 'negative',
            message: 'Erro ao carregar horários disponíveis'
          })
        }
      } finally {
        loadingSlots.value = false
      }
    }

    // Carregar horários disponíveis para agendamento recorrente
    async function loadRecurringAvailableSlots() {
      if (!recurringAppointment.value.barberId || !recurringAppointment.value.startDate || !recurringAppointment.value.serviceId) {
        recurringAvailableSlots.value = []
        return
      }

      loadingSlots.value = true
      try {
        // Garantir que barberId seja um número/string válido
        const barberId = typeof recurringAppointment.value.barberId === 'object' 
          ? recurringAppointment.value.barberId?.value || recurringAppointment.value.barberId?.id
          : recurringAppointment.value.barberId

        // Garantir que serviceId seja um número/string válido
        const serviceId = typeof recurringAppointment.value.serviceId === 'object'
          ? recurringAppointment.value.serviceId?.value || recurringAppointment.value.serviceId?.id
          : recurringAppointment.value.serviceId

        // Garantir que date seja uma string de data simples (YYYY-MM-DD)
        let dateStr = recurringAppointment.value.startDate
        if (dateStr.includes('T')) {
          dateStr = dateStr.split('T')[0]
        }

        // Encontrar a duração do serviço selecionado
        const selectedService = serviceOptions.value.find(s => s.value === serviceId)
        const duration = selectedService?.duration || 60

        console.log('Chamando API recorrente com:', { barberId, dateStr, duration, serviceId })

        const response = await api.get(`/appointments/available-slots/${barberId}/${dateStr}/${duration}?serviceId=${serviceId}`)
        recurringAvailableSlots.value = response.data.availableSlots
      } catch (error) {
        console.error('Erro ao carregar horários:', error)
        recurringAvailableSlots.value = []
        $q.notify({
          type: 'negative',
          message: 'Erro ao carregar horários disponíveis'
        })
      } finally {
        loadingSlots.value = false
      }
    }

    // Quando o serviço muda, recarregar horários
    function onServiceChange() {
      newAppointment.value.time = '' // Limpar horário selecionado
      loadAvailableSlots()
    }

    // Quando o serviço recorrente muda, recarregar horários
    function onRecurringServiceChange() {
      recurringAppointment.value.time = '' // Limpar horário selecionado
      loadRecurringAvailableSlots()
    }

    // Criar agendamento
    async function createAppointment() {
      creating.value = true
      
      try {
        // Extrair valores primitivos dos IDs
        const customerId = typeof newAppointment.value.customerId === 'object' 
          ? newAppointment.value.customerId?.value || newAppointment.value.customerId?.id
          : newAppointment.value.customerId

        const barberId = typeof newAppointment.value.barberId === 'object' 
          ? newAppointment.value.barberId?.value || newAppointment.value.barberId?.id
          : newAppointment.value.barberId

        const serviceId = typeof newAppointment.value.serviceId === 'object' 
          ? newAppointment.value.serviceId?.value || newAppointment.value.serviceId?.id
          : newAppointment.value.serviceId

        await api.post('/appointments', {
          customerId: customerId,
          barberId: barberId,
          serviceIds: [serviceId],
          appointmentDate: newAppointment.value.date,
          startTime: newAppointment.value.selectedTime,
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
        // Extrair valores primitivos dos IDs
        const customerId = typeof recurringAppointment.value.customerId === 'object' 
          ? recurringAppointment.value.customerId?.value || recurringAppointment.value.customerId?.id
          : recurringAppointment.value.customerId

        const barberId = typeof recurringAppointment.value.barberId === 'object' 
          ? recurringAppointment.value.barberId?.value || recurringAppointment.value.barberId?.id
          : recurringAppointment.value.barberId

        const serviceId = typeof recurringAppointment.value.serviceId === 'object' 
          ? recurringAppointment.value.serviceId?.value || recurringAppointment.value.serviceId?.id
          : recurringAppointment.value.serviceId

        await api.post('/appointments/recurring', {
          customerId: customerId,
          barberId: barberId,
          serviceIds: [serviceId],
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
      availableSlots.value = []
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
      recurringAvailableSlots.value = []
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

    // Computed properties para validação dos formulários
    const isNewAppointmentValid = computed(() => {
      return newAppointment.value.customerId &&
             newAppointment.value.barberId &&
             newAppointment.value.serviceId &&
             newAppointment.value.date &&
             newAppointment.value.selectedTime
    })

    const isRecurringAppointmentValid = computed(() => {
      return recurringAppointment.value.customerId &&
             recurringAppointment.value.barberId &&
             recurringAppointment.value.serviceId &&
             recurringAppointment.value.startDate &&
             recurringAppointment.value.time &&
             recurringAppointment.value.recurrenceType
    })

    // Métodos para fechar dialogs
    function closeNewDialog() {
      showNewDialog.value = false
      // Reset form
      newAppointment.value = {
        customerId: null,
        barberId: null,
        serviceId: null,
        date: '',
        selectedTime: '',
        notes: ''
      }
      availableSlots.value = []
    }

    function closeRecurringDialog() {
      showRecurringAppointmentDialog.value = false
      // Reset form
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
      recurringAvailableSlots.value = []
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
      availableSlots,
      recurringAvailableSlots,
      loadingSlots,
      refreshCalendar,
      showNewAppointmentDialog,
      showRecurringDialog,
      createAppointment,
      createRecurringAppointment,
      cancelAppointment,
      completeAppointment,
      formatDateTime,
      getStatusColor,
      getStatusLabel,
      loadAvailableSlots,
      loadRecurringAvailableSlots,
      onServiceChange,
      onRecurringServiceChange,
      isNewAppointmentValid,
      isRecurringAppointmentValid,
      closeNewDialog,
      closeRecurringDialog
    }
  }
})
</script>

<style scoped>
.time-slots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
  padding: 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
}

/* Grid de horários no modo dark */
.body--dark .time-slots-grid {
  border-color: #555555 !important;
  background-color: #2a2a2a !important;
}

.slot-btn {
  min-width: 70px;
  font-size: 0.85em;
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

/* MODO DARK - Estilos prioritários para o cabeçalho */
.body--dark :deep(.fc-col-header-cell) {
  background-color: #2d2d2d !important;
  color: #ffffff !important;
  border-color: #555555 !important;
}

.body--dark :deep(.fc-col-header-cell-cushion) {
  color: #ffffff !important;
  background-color: #2d2d2d !important;
}

.body--dark :deep(.fc-col-header) {
  background-color: #2d2d2d !important;
}

.body--dark :deep(.fc-col-header-cell a) {
  color: #ffffff !important;
  text-decoration: none !important;
}

.body--dark :deep(.fc-col-header th) {
  background-color: #2d2d2d !important;
  color: #ffffff !important;
  border-color: #555555 !important;
}

.body--dark :deep(.fc-daygrid-day-number) {
  color: #ffffff !important;
}

/* Cabeçalho dos dias da semana - mais específico */
.body--dark :deep(.fc-scrollgrid-section-header) {
  background-color: #2d2d2d !important;
}

.body--dark :deep(.fc-scrollgrid-section-header .fc-col-header-cell) {
  background-color: #2d2d2d !important;
  color: #ffffff !important;
}

.body--dark :deep(.fc-scrollgrid-section-header th) {
  background-color: #2d2d2d !important;
  color: #ffffff !important;
}

/* Forçar contraste do cabeçalho principal */
.body--dark :deep(.fc-theme-standard .fc-scrollgrid) {
  border-color: #555555 !important;
}

.body--dark :deep(.fc-theme-standard th) {
  background-color: #2d2d2d !important;
  color: #ffffff !important;
  border-color: #555555 !important;
}

.body--dark :deep(.fc-theme-standard .fc-scrollgrid-section-header th) {
  background-color: #2d2d2d !important;
  color: #ffffff !important;
}

/* Links dos dias da semana */
.body--dark :deep(.fc-col-header-cell .fc-col-header-cell-cushion) {
  color: #ffffff !important;
  background: transparent !important;
}

.body--dark :deep(.fc-day-today) {
  background-color: rgba(25, 118, 210, 0.1) !important;
}

.body--dark :deep(.fc-daygrid-day-frame) {
  background-color: #2a2a2a !important;
}

.body--dark :deep(.fc-scrollgrid) {
  border-color: #555555 !important;
}

.body--dark :deep(.fc-scrollgrid-sync-table) {
  border-color: #555555 !important;
}

.body--dark :deep(.fc-timegrid-axis) {
  background-color: #2a2a2a !important;
  color: #ffffff !important;
}

.body--dark :deep(.fc-timegrid-slot-label) {
  color: #ffffff !important;
}

.body--dark :deep(.fc-timegrid-divider) {
  border-color: #555555 !important;
}

.body--dark :deep(.fc-daygrid-day-events) {
  background-color: transparent !important;
}

.body--dark :deep(.fc-more-link) {
  color: var(--q-primary) !important;
}

/* Bordas e separadores no modo dark */
.body--dark :deep(.fc-scrollgrid-section) {
  border-color: #555555 !important;
}

.body--dark :deep(.fc-daygrid-day) {
  border-color: #555555 !important;
}

.body--dark :deep(.fc-timegrid-col) {
  border-color: #555555 !important;
}

.body--dark :deep(.fc-timegrid-slot) {
  border-color: #555555 !important;
}

/* Toolbar do calendário no modo dark */
.body--dark :deep(.fc-toolbar) {
  color: #ffffff !important;
}

.body--dark :deep(.fc-toolbar-title) {
  color: #ffffff !important;
}

/* Botões do calendário no modo dark */
.body--dark :deep(.fc-button-primary:not(:disabled)) {
  background-color: var(--q-primary) !important;
  border-color: var(--q-primary) !important;
  color: #ffffff !important;
}

.body--dark :deep(.fc-button-primary:hover:not(:disabled)) {
  background-color: #1565c0 !important;
  border-color: #1565c0 !important;
}

/* Lista view no modo dark */
.body--dark :deep(.fc-list-event-title) {
  color: #ffffff !important;
}

.body--dark :deep(.fc-list-event-time) {
  color: #cccccc !important;
}

.body--dark :deep(.fc-list-day-cushion) {
  background-color: #3a3a3a !important;
  color: #ffffff !important;
}

/* Estilos adicionais para garantir contraste do cabeçalho no modo dark */
.body--dark :deep(.fc-scrollgrid-section-header table) {
  background-color: #2d2d2d !important;
}

.body--dark :deep(.fc-scrollgrid-section-header thead) {
  background-color: #2d2d2d !important;
}

.body--dark :deep(.fc-scrollgrid-section-header tbody) {
  background-color: #2d2d2d !important;
}

/* Força todos os elementos do cabeçalho */
.body--dark :deep(.fc-scrollgrid-section-header *) {
  color: #ffffff !important;
}

.body--dark :deep(.fc-scrollgrid-section-header) {
  color: #ffffff !important;
}

/* Cabeçalho do calendário mensal */
.body--dark :deep(.fc-daygrid-header) {
  background-color: #2d2d2d !important;
}

/* Week view header */
.body--dark :deep(.fc-timegrid-header) {
  background-color: #2d2d2d !important;
}

/* Força cor de fundo para toda a área do cabeçalho */
.body--dark :deep(.fc .fc-scrollgrid-section-header) {
  background-color: #2d2d2d !important;
}

/* Célula individual do cabeçalho com máxima especificidade */
.body--dark :deep(.fc-theme-standard .fc-scrollgrid-section-header .fc-col-header-cell) {
  background-color: #2d2d2d !important;
  color: #ffffff !important;
  border-color: #555555 !important;
}

/* Texto dentro das células do cabeçalho */
.body--dark :deep(.fc-theme-standard .fc-scrollgrid-section-header .fc-col-header-cell-cushion) {
  color: #ffffff !important;
  background-color: transparent !important;
}

/* All day slot no modo dark */
.body--dark :deep(.fc-timegrid-body .fc-timegrid-all-day) {
  background-color: #2a2a2a !important;
}

.body--dark :deep(.fc-timegrid-all-day .fc-col-header-cell) {
  background-color: #2d2d2d !important;
  color: #ffffff !important;
}
</style>

<!-- Estilos globais não scoped para máxima prioridade no modo dark -->
<style>
/* Força o cabeçalho do calendário no modo dark com máxima especificidade */
.body--dark .fc-col-header-cell,
.body--dark .fc-col-header-cell-cushion,
.body--dark .fc-scrollgrid-section-header .fc-col-header-cell,
.body--dark .fc-scrollgrid-section-header th,
.body--dark .fc-theme-standard .fc-scrollgrid-section-header .fc-col-header-cell,
.body--dark .fc-theme-standard .fc-scrollgrid-section-header th {
  background-color: #2d2d2d !important;
  color: #ffffff !important;
  border-color: #555555 !important;
}

/* Força o texto do cabeçalho */
.body--dark .fc-col-header-cell a,
.body--dark .fc-col-header-cell-cushion,
.body--dark .fc-scrollgrid-section-header a,
.body--dark .fc-scrollgrid-section-header .fc-col-header-cell-cushion {
  color: #ffffff !important;
  background: transparent !important;
}

/* Força a seção do cabeçalho inteira */
.body--dark .fc-scrollgrid-section-header,
.body--dark .fc-scrollgrid-section-header table,
.body--dark .fc-scrollgrid-section-header thead,
.body--dark .fc-scrollgrid-section-header tbody {
  background-color: #2d2d2d !important;
  color: #ffffff !important;
}

/* Força todos os elementos filhos do cabeçalho */
.body--dark .fc-scrollgrid-section-header * {
  color: #ffffff !important;
}

/* Cabeçalho específico para diferentes visualizações */
.body--dark .fc-daygrid-header,
.body--dark .fc-timegrid-header {
  background-color: #2d2d2d !important;
}

/* Força com ID/class específicas do FullCalendar */
.body--dark [class*="fc-col-header"],
.body--dark [class*="fc-scrollgrid-section-header"] {
  background-color: #2d2d2d !important;
  color: #ffffff !important;
}

.body--dark [class*="fc-col-header"] * {
  color: #ffffff !important;
}
</style>
