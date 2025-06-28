<template>
  <q-page class="q-pa-lg">
    <!-- Header da página -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h4 class="q-ma-none text-primary text-weight-bold">
          <q-icon name="event" class="q-mr-sm" />
          Gestão de Agendamentos
        </h4>
        <p class="text-grey-6 q-mb-none">Gerencie os agendamentos da barbearia</p>
      </div>
      <q-btn
        color="primary"
        icon="add"
        label="Novo Agendamento"
        @click="openDialog()"
        unelevated
      />
    </div>

    <!-- Controles de visualização -->
    <div class="row q-mb-md q-gutter-md">
      <!-- Filtro de data -->
      <q-input
        v-model="selectedDate"
        type="date"
        outlined
        label="Filtrar por data"
        class="col-12 col-sm-6 col-md-3"
        clearable
      />
      
      <!-- Filtro de barbeiro -->
      <q-select
        v-model="selectedBarber"
        :options="barberOptions"
        option-value="id"
        option-label="name"
        outlined
        label="Filtrar por barbeiro"
        class="col-12 col-sm-6 col-md-3"
        clearable
        emit-value
        map-options
      />

      <!-- Filtro de status -->
      <q-select
        v-model="selectedStatus"
        :options="statusOptions"
        outlined
        label="Filtrar por status"
        class="col-12 col-sm-6 col-md-3"
        clearable
      />

      <!-- Toggle de visualização -->
      <div class="col-12 col-sm-6 col-md-3 flex items-center">
        <q-btn-toggle
          v-model="viewMode"
          :options="[
            { label: 'Lista', value: 'list', icon: 'list' },
            { label: 'Calendário', value: 'calendar', icon: 'calendar_month' }
          ]"
          color="primary"
          outline
          class="full-width"
        />
      </div>
    </div>

    <!-- Visualização em Lista -->
    <div v-if="viewMode === 'list'">
      <!-- Filtro de busca -->
      <div class="q-mb-md">
        <q-input
          v-model="filter"
          placeholder="Buscar por cliente, barbeiro ou serviço..."
          outlined
          clearable
          debounce="300"
          class="full-width"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        
        <!-- Indicador de resultados -->
        <div v-if="filter" class="text-caption text-grey-6 q-mt-xs q-ml-sm">
          {{ filteredAppointments.length }} resultado(s) encontrado(s) para "{{ filter }}"
        </div>
      </div>

      <!-- Tabela de agendamentos -->
      <q-card class="appointment-card">
        <q-card-section class="q-pa-none">
          <q-table
            :rows="filteredAppointments"
            :columns="columns"
            row-key="id"
            :loading="loading"
            :pagination="pagination"
            @update:pagination="pagination = $event"
            flat
            class="appointment-table"
            loading-label="Carregando agendamentos..."
            no-data-label="Nenhum agendamento encontrado"
            no-results-label="Nenhum resultado para o filtro aplicado"
            rows-per-page-label="Registros por página:"
            :pagination-label="paginationLabel"
          >
            <!-- Template para data/hora -->
            <template #body-cell-datetime="props">
              <q-td :props="props">
                <div class="text-weight-medium">
                  {{ formatDateTime(props.row.scheduledDateTime).date }}
                </div>
                <div class="text-caption text-grey-6">
                  {{ formatDateTime(props.row.scheduledDateTime).time }}
                </div>
              </q-td>
            </template>

            <!-- Template para cliente -->
            <template #body-cell-customer="props">
              <q-td :props="props">
                <div class="text-weight-medium">{{ props.row.customer?.name }}</div>
                <div class="text-caption text-grey-6">{{ props.row.customer?.phone }}</div>
              </q-td>
            </template>

            <!-- Template para barbeiro -->
            <template #body-cell-barber="props">
              <q-td :props="props">
                <div class="flex items-center">
                  <q-avatar size="sm" class="q-mr-sm" color="primary" text-color="white">
                    {{ props.row.barber?.name?.charAt(0) }}
                  </q-avatar>
                  {{ props.row.barber?.name }}
                </div>
              </q-td>
            </template>

            <!-- Template para serviços -->
            <template #body-cell-services="props">
              <q-td :props="props">
                <q-chip size="sm" color="secondary" text-color="white">
                  {{ props.row.service?.name }}
                </q-chip>
              </q-td>
            </template>

            <!-- Template para status -->
            <template #body-cell-status="props">
              <q-td :props="props">
                <q-chip
                  :color="getStatusColor(props.value)"
                  text-color="white"
                  size="sm"
                >
                  {{ getStatusLabel(props.value) }}
                </q-chip>
              </q-td>
            </template>

            <!-- Template para ações -->
            <template #body-cell-actions="props">
              <q-td :props="props">
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="edit"
                  @click="openDialog(props.row)"
                  class="q-mr-xs"
                  :disable="props.row.status === 'cancelled'"
                >
                  <q-tooltip>Editar agendamento</q-tooltip>
                </q-btn>
                
                <q-btn
                  v-if="props.row.status === 'scheduled'"
                  flat
                  round
                  dense
                  color="positive"
                  icon="play_arrow"
                  @click="changeStatus(props.row, 'in_progress')"
                  class="q-mr-xs"
                >
                  <q-tooltip>Iniciar atendimento</q-tooltip>
                </q-btn>

                <q-btn
                  v-if="props.row.status === 'in_progress'"
                  flat
                  round
                  dense
                  color="positive"
                  icon="check"
                  @click="changeStatus(props.row, 'completed')"
                  class="q-mr-xs"
                >
                  <q-tooltip>Finalizar atendimento</q-tooltip>
                </q-btn>

                <q-btn
                  v-if="['scheduled', 'in_progress'].includes(props.row.status)"
                  flat
                  round
                  dense
                  color="warning"
                  icon="cancel"
                  @click="cancelAppointment(props.row)"
                  class="q-mr-xs"
                >
                  <q-tooltip>Cancelar agendamento</q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete"
                  @click="confirmDelete(props.row)"
                >
                  <q-tooltip>Excluir agendamento</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </div>

    <!-- Visualização em Calendário -->
    <div v-if="viewMode === 'calendar'">
      <q-card class="calendar-card">
        <q-card-section>
          <div class="text-h6 q-mb-md">
            <q-icon name="calendar_month" class="q-mr-sm" />
            Calendário de Agendamentos
          </div>
          <p class="text-grey-6 q-mb-md">
            Clique em uma data para ver os agendamentos do dia
          </p>
          
          <div class="row">
            <!-- Calendário -->
            <div class="col-12 col-md-7">
              <q-date
                v-model="calendarDate"
                :events="calendarEvents"
                event-color="primary"
                class="full-width"
                @update:model-value="showDayAppointments"
                today-btn
                mask="YYYY-MM-DD"
                :locale="ptBRLocale"
              />
            </div>

            <!-- Resumo e agendamentos do dia selecionado -->
            <div class="col-12 col-md-5 q-pl-md">
              <!-- Resumo -->
              <q-card flat bordered class="q-mb-md">
                <q-card-section>
                  <div class="text-subtitle1 q-mb-sm">📊 Resumo</div>
                  <div class="q-mb-xs">
                    <strong>Total de agendamentos:</strong> {{ appointments.length }}
                  </div>
                  <div class="q-mb-xs">
                    <strong>Este mês:</strong> {{ appointmentsThisMonth }}
                  </div>
                  <div>
                    <strong>Hoje:</strong> {{ appointmentsToday }}
                  </div>
                </q-card-section>
              </q-card>

              <!-- Agendamentos do dia selecionado -->
              <q-card flat bordered>
                <q-card-section>
                  <div class="text-subtitle1 q-mb-sm">
                    📅 {{ calendarDate ? formatDate(calendarDate) : 'Selecione uma data' }}
                  </div>
                  
                  <div v-if="!calendarDate" class="text-grey-6 text-center q-py-md">
                    Clique em uma data no calendário para ver os agendamentos
                  </div>
                  
                  <div v-else-if="selectedDayAppointments.length === 0" class="text-grey-6 text-center q-py-md">
                    <q-icon name="event_busy" size="2em" class="q-mb-sm" />
                    <div>Nenhum agendamento para este dia</div>
                  </div>
                  
                  <q-list v-else separator>
                    <q-item v-for="appointment in selectedDayAppointments" :key="appointment.id" class="q-pa-sm">
                      <q-item-section avatar>
                        <q-avatar :color="getStatusColor(appointment.status)" text-color="white" size="sm">
                          <q-icon name="schedule" />
                        </q-avatar>
                      </q-item-section>
                      
                      <q-item-section>
                        <q-item-label class="text-weight-medium">
                          {{ formatDateTime(appointment.scheduledDateTime).time }}
                        </q-item-label>
                        <q-item-label caption>
                          {{ appointment.customer?.name }}
                        </q-item-label>
                        <q-item-label caption class="text-grey-6">
                          {{ appointment.barber?.name }} • {{ appointment.service?.name }}
                        </q-item-label>
                      </q-item-section>
                      
                      <q-item-section side>
                        <q-chip :color="getStatusColor(appointment.status)" text-color="white" size="sm">
                          {{ getStatusLabel(appointment.status) }}
                        </q-chip>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Dialog de formulário -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 400px; max-width: 600px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">
            <q-icon name="edit" class="q-mr-sm" />
            {{ editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento' }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="saveAppointment" class="q-gutter-md">
            <!-- Cliente -->
            <q-select
              v-model="form.customerId"
              :options="customerOptions"
              option-value="id"
              option-label="name"
              outlined
              label="Cliente *"
              :rules="[val => !!val || 'Cliente é obrigatório']"
              emit-value
              map-options
              use-input
              input-debounce="300"
              @filter="filterCustomers"
            />

            <!-- Barbeiro -->
            <q-select
              v-model="form.barberId"
              :options="barberOptions"
              option-value="id"
              option-label="name"
              outlined
              label="Barbeiro *"
              :rules="[val => !!val || 'Barbeiro é obrigatório']"
              emit-value
              map-options
            />

            <!-- Serviços -->
            <q-select
              v-model="form.serviceIds"
              :options="serviceOptions"
              option-value="id"
              option-label="name"
              outlined
              label="Serviços *"
              multiple
              use-chips
              :rules="[val => val && val.length > 0 || 'Pelo menos um serviço é obrigatório']"
              emit-value
              map-options
            />

            <!-- Data -->
            <q-input
              v-model="form.appointmentDate"
              type="date"
              outlined
              label="Data *"
              :rules="[val => !!val || 'Data é obrigatória']"
              :min="today"
            />

            <!-- Horário de início -->
            <q-input
              v-model="form.startTime"
              type="time"
              outlined
              label="Horário de início *"
              :rules="[val => !!val || 'Horário de início é obrigatório']"
            />

            <!-- Observações -->
            <q-input
              v-model="form.notes"
              outlined
              label="Observações"
              type="textarea"
              rows="3"
              maxlength="500"
              counter
            />

            <!-- Status (apenas para edição) -->
            <q-select
              v-if="editingAppointment"
              v-model="form.status"
              :options="statusOptions"
              outlined
              label="Status"
              emit-value
              map-options
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            label="Salvar"
            color="primary"
            @click="saveAppointment"
            :loading="saving"
            unelevated
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog de confirmação de exclusão -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="delete" color="negative" text-color="white" />
          <span class="q-ml-sm">
            Tem certeza que deseja excluir este agendamento?
          </span>
        </q-card-section>

        <q-card-section v-if="appointmentToDelete">
          <div class="text-body2">
            <strong>Cliente:</strong> {{ appointmentToDelete.customer?.name }}<br>
            <strong>Data:</strong> {{ formatDateTime(appointmentToDelete.scheduledDateTime).date }}<br>
            <strong>Horário:</strong> {{ formatDateTime(appointmentToDelete.scheduledDateTime).time }}
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            label="Excluir"
            color="negative"
            @click="deleteAppointment"
            :loading="deleting"
            unelevated
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

const $q = useQuasar()

// Configuração de localização para português brasileiro
const ptBRLocale = {
  days: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'],
  daysShort: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
  months: [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ],
  monthsShort: [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'
  ]
}

// Estados
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const viewMode = ref('list')

// Dados
const appointments = ref([])
const customers = ref([])
const barbers = ref([])
const services = ref([])

// Filtros
const filter = ref('')
const selectedDate = ref('')
const selectedBarber = ref(null)
const selectedStatus = ref('')

// Calendário
const calendarDate = ref('')
const selectedDayAppointments = ref([])

// Formulário
const editingAppointment = ref(null)
const appointmentToDelete = ref(null)
const form = ref({
  customerId: null,
  barberId: null,
  serviceIds: [],
  appointmentDate: '',
  startTime: '',
  notes: '',
  status: 'SCHEDULED'
})

// Paginação
const pagination = ref({
  sortBy: 'scheduledDateTime',
  descending: false,
  page: 1,
  rowsPerPage: 10
})

// Data de hoje (para validação)
const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

// Colunas da tabela
const columns = [
  {
    name: 'datetime',
    label: 'Data/Horário',
    field: 'scheduledDateTime',
    align: 'left',
    sortable: true
  },
  {
    name: 'customer',
    label: 'Cliente',
    field: row => row.customer?.name,
    align: 'left',
    sortable: true
  },
  {
    name: 'barber',
    label: 'Barbeiro',
    field: row => row.barber?.name,
    align: 'left',
    sortable: true
  },
  {
    name: 'services',
    label: 'Serviço',
    field: row => row.service?.name,
    align: 'left'
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    align: 'center',
    sortable: true
  },
  {
    name: 'totalPrice',
    label: 'Valor Total',
    field: 'totalPrice',
    align: 'right',
    sortable: true,
    format: val => {
      const price = parseFloat(val) || 0
      return `R$ ${price.toFixed(2)}`
    }
  },
  {
    name: 'actions',
    label: 'Ações',
    field: 'actions',
    align: 'center'
  }
]

// Opções para selects
const customerOptions = ref([])
const barberOptions = computed(() => 
  barbers.value.map(barber => ({
    id: barber.id,
    name: barber.name
  }))
)

const serviceOptions = computed(() => 
  services.value.map(service => ({
    id: service.id,
    name: `${service.name} - R$ ${typeof service.price === 'number' ? service.price.toFixed(2) : parseFloat(service.price || '0').toFixed(2)}`
  }))
)

const statusOptions = [
  { label: 'Agendado', value: 'scheduled' },
  { label: 'Em andamento', value: 'in_progress' },
  { label: 'Concluído', value: 'completed' },
  { label: 'Cancelado', value: 'cancelled' }
]

// Dados filtrados
const filteredAppointments = computed(() => {
  let filtered = appointments.value

  // Filtro de texto
  if (filter.value) {
    const searchTerm = filter.value.toLowerCase()
    filtered = filtered.filter(appointment => 
      appointment.customer?.name?.toLowerCase().includes(searchTerm) ||
      appointment.barber?.name?.toLowerCase().includes(searchTerm) ||
      appointment.service?.name?.toLowerCase().includes(searchTerm)
    )
  }

  // Filtro de data
  if (selectedDate.value) {
    filtered = filtered.filter(appointment => {
      const appointmentDate = new Date(appointment.scheduledDateTime).toISOString().split('T')[0]
      return appointmentDate === selectedDate.value
    })
  }

  // Filtro de barbeiro
  if (selectedBarber.value) {
    filtered = filtered.filter(appointment => 
      appointment.barberId === selectedBarber.value
    )
  }

  // Filtro de status
  if (selectedStatus.value) {
    filtered = filtered.filter(appointment => 
      appointment.status === selectedStatus.value
    )
  }

  return filtered
})

// Eventos do calendário
const calendarEvents = computed(() => {
  const events = []
  appointments.value.forEach(appointment => {
    const date = new Date(appointment.scheduledDateTime).toISOString().split('T')[0]
    if (!events.includes(date)) {
      events.push(date)
    }
  })
  return events
})

// Resumos para o calendário
const appointmentsToday = computed(() => {
  const today = new Date().toISOString().split('T')[0]
  return appointments.value.filter(appointment => {
    const appointmentDate = new Date(appointment.scheduledDateTime).toISOString().split('T')[0]
    return appointmentDate === today
  }).length
})

const appointmentsThisMonth = computed(() => {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  return appointments.value.filter(appointment => {
    const appointmentDate = new Date(appointment.scheduledDateTime)
    return appointmentDate.getMonth() === currentMonth && appointmentDate.getFullYear() === currentYear
  }).length
})

// Funções auxiliares
const getStatusColor = (status) => {
  const colors = {
    'scheduled': 'primary',
    'in_progress': 'warning',
    'completed': 'positive',
    'cancelled': 'negative'
  }
  return colors[status] || 'grey'
}

const getStatusLabel = (status) => {
  const labels = {
    'scheduled': 'Agendado',
    'in_progress': 'Em andamento',
    'completed': 'Concluído',
    'cancelled': 'Cancelado'
  }
  return labels[status] || status
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')
}

const formatDateTime = (dateTime) => {
  if (!dateTime) return { date: '', time: '' }
  const dt = new Date(dateTime)
  return {
    date: dt.toLocaleDateString('pt-BR'),
    time: dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  }
}

const paginationLabel = (firstRowIndex, endRowIndex, totalRowsNumber) => {
  return `${firstRowIndex}-${endRowIndex} de ${totalRowsNumber}`
}

// Funções de API
const fetchAppointments = async () => {
  try {
    loading.value = true
    const response = await api.get('/appointments')
    appointments.value = response.data
  } catch (error) {
    console.error('Erro ao carregar agendamentos:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar agendamentos'
    })
  } finally {
    loading.value = false
  }
}

const fetchCustomers = async () => {
  try {
    const response = await api.get('/customers')
    customers.value = response.data
    customerOptions.value = customers.value.map(customer => ({
      id: customer.id,
      name: customer.name
    }))
  } catch (error) {
    console.error('Erro ao carregar clientes:', error)
  }
}

const fetchBarbers = async () => {
  try {
    const response = await api.get('/barbers')
    barbers.value = response.data
  } catch (error) {
    console.error('Erro ao carregar barbeiros:', error)
  }
}

const fetchServices = async () => {
  try {
    const response = await api.get('/services')
    services.value = response.data
  } catch (error) {
    console.error('Erro ao carregar serviços:', error)
  }
}

// Funções de formulário
const openDialog = (appointment = null) => {
  editingAppointment.value = appointment
  if (appointment) {
    const scheduledDate = new Date(appointment.scheduledDateTime)
    form.value = {
      customerId: appointment.customerId,
      barberId: appointment.barberId,
      serviceIds: [appointment.serviceId],
      appointmentDate: scheduledDate.toISOString().split('T')[0],
      startTime: scheduledDate.toTimeString().slice(0, 5),
      notes: appointment.notes || '',
      status: appointment.status
    }
  } else {
    form.value = {
      customerId: null,
      barberId: null,
      serviceIds: [],
      appointmentDate: '',
      startTime: '',
      notes: '',
      status: 'scheduled'
    }
  }
  showDialog.value = true
}

const saveAppointment = async () => {
  try {
    saving.value = true
    
    if (editingAppointment.value) {
      await api.put(`/appointments/${editingAppointment.value.id}`, form.value)
      $q.notify({
        type: 'positive',
        message: 'Agendamento atualizado com sucesso!'
      })
    } else {
      await api.post('/appointments', form.value)
      $q.notify({
        type: 'positive',
        message: 'Agendamento criado com sucesso!'
      })
    }
    
    showDialog.value = false
    await fetchAppointments()
  } catch (error) {
    console.error('Erro ao salvar agendamento:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar agendamento'
    })
  } finally {
    saving.value = false
  }
}

const confirmDelete = (appointment) => {
  appointmentToDelete.value = appointment
  showDeleteDialog.value = true
}

const deleteAppointment = async () => {
  try {
    deleting.value = true
    await api.delete(`/appointments/${appointmentToDelete.value.id}`)
    $q.notify({
      type: 'positive',
      message: 'Agendamento excluído com sucesso!'
    })
    showDeleteDialog.value = false
    appointmentToDelete.value = null
    await fetchAppointments()
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao excluir agendamento'
    })
  } finally {
    deleting.value = false
  }
}

const changeStatus = async (appointment, newStatus) => {
  try {
    if (newStatus === 'cancelled') {
      await api.put(`/appointments/${appointment.id}/cancel`)
    } else {
      await api.put(`/appointments/${appointment.id}`, {
        status: newStatus
      })
    }
    
    $q.notify({
      type: 'positive',
      message: 'Status do agendamento atualizado!'
    })
    
    await fetchAppointments()
  } catch (error) {
    console.error('Erro ao atualizar status:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao atualizar status do agendamento'
    })
  }
}

const cancelAppointment = (appointment) => {
  $q.dialog({
    title: 'Cancelar Agendamento',
    message: 'Tem certeza que deseja cancelar este agendamento?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    await changeStatus(appointment, 'cancelled')
  })
}

const filterCustomers = (val, update) => {
  update(() => {
    if (val === '') {
      customerOptions.value = customers.value.map(customer => ({
        id: customer.id,
        name: customer.name
      }))
    } else {
      const searchTerm = val.toLowerCase()
      customerOptions.value = customers.value
        .filter(customer => customer.name.toLowerCase().includes(searchTerm))
        .map(customer => ({
          id: customer.id,
          name: customer.name
        }))
    }
  })
}

const showDayAppointments = (date) => {
  if (!date) return
  
  calendarDate.value = date
  selectedDayAppointments.value = appointments.value.filter(
    appointment => {
      const appointmentDate = new Date(appointment.scheduledDateTime).toISOString().split('T')[0]
      return appointmentDate === date
    }
  ).sort((a, b) => new Date(a.scheduledDateTime) - new Date(b.scheduledDateTime))
}

// Watchers
watch(calendarDate, (newDate) => {
  if (newDate) {
    showDayAppointments(newDate)
  }
})

// Lifecycle
onMounted(async () => {
  await Promise.all([
    fetchAppointments(),
    fetchCustomers(),
    fetchBarbers(),
    fetchServices()
  ])
  
  // Definir data do calendário para hoje
  calendarDate.value = today.value
})
</script>

<style lang="scss" scoped>
.appointment-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.appointment-table {
  .q-table__top {
    padding: 16px;
  }
}

.calendar-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.calendar-view {
  .q-date {
    width: 100%;
    max-width: none;
  }
}

@media (max-width: 768px) {
  .q-page {
    padding: 16px;
  }
  
  .appointment-table {
    font-size: 0.875rem;
  }
}
</style>
