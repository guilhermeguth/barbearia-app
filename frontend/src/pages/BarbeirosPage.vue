<template>
  <q-page class="q-pa-lg">
    <!-- Header da página -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h4 class="q-ma-none text-primary text-weight-bold">
          <q-icon name="person" class="q-mr-sm" />
          Gestão de Barbeiros
        </h4>
        <p class="text-grey-6 q-mb-none">Gerencie os profissionais da barbearia</p>
      </div>
      <q-btn
        color="primary"
        icon="add"
        label="Novo Barbeiro"
        @click="openDialog()"
        unelevated
      />
    </div>

    <!-- Filtro de busca -->
    <div class="q-mb-md">
      <q-input
        v-model="filter"
        placeholder="Buscar barbeiro por nome, email ou telefone..."
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
        {{ filteredBarbers.length }} resultado(s) encontrado(s) para "{{ filter }}"
      </div>
    </div>

    <!-- Tabela de barbeiros -->
    <q-card class="barber-card">
      <q-card-section class="q-pa-none">
        <q-table
          :rows="filteredBarbers"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination="pagination"
          @update:pagination="pagination = $event"
          flat
          class="barber-table"
          loading-label="Carregando barbeiros..."
          no-data-label="Nenhum barbeiro encontrado"
          no-results-label="Nenhum resultado para o filtro aplicado"
          rows-per-page-label="Registros por página:"
          :pagination-label="paginationLabel"
        >
          <!-- Template para foto -->
          <template #body-cell-photo="props">
            <q-td :props="props">
              <q-avatar 
                size="40px" 
                :class="props.value ? 'cursor-pointer' : ''"
                @click="props.value ? openPhotoDialog(props.value, props.row.name) : null"
              >
                <img 
                  v-if="props.value" 
                  :src="props.value" 
                  :alt="`Foto de ${props.row.name}`"
                  @error="$event.target.src = 'https://via.placeholder.com/40x40/ccc/666?text=?'"
                  class="cursor-pointer"
                />
                <q-icon 
                  v-else 
                  name="person" 
                  size="24px" 
                  color="grey-5"
                />
              </q-avatar>
              
              <!-- Tooltip -->
              <q-tooltip v-if="props.value" class="bg-white text-dark shadow-4">
                Clique para ampliar a foto
              </q-tooltip>
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
              >
                <q-tooltip>Editar barbeiro</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                @click="confirmDelete(props.row)"
              >
                <q-tooltip>Excluir barbeiro</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <!-- Template para status (se necessário) -->
          <template #body-cell-status="props">
            <q-td :props="props">
              <q-chip
                :color="props.value === 'ativo' ? 'positive' : 'grey'"
                text-color="white"
                size="sm"
              >
                {{ props.value }}
              </q-chip>
            </q-td>
          </template>

          <!-- Template quando não há dados -->
          <template #no-data>
            <div class="full-width row flex-center text-grey-6 q-gutter-sm q-py-xl">
              <q-icon size="2em" :name="filter ? 'search_off' : 'person_off'" />
              <span class="text-h6">
                <span v-if="filter">
                  Nenhum barbeiro encontrado para "{{ filter }}"
                </span>
                <span v-else>
                  Nenhum barbeiro cadastrado
                </span>
              </span>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Dialog para adicionar/editar barbeiro -->
    <q-dialog v-model="showDialog" @hide="closeDialog">
      <q-card style="min-width: 600px; max-width: 800px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="edit" class="q-mr-sm" />
            {{ editingBarber ? 'Editar Barbeiro' : 'Novo Barbeiro' }}
          </div>
        </q-card-section>

        <q-card-section class="q-pa-none">
          <!-- Abas -->
          <q-tabs
            v-model="activeTab"
            dense
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            narrow-indicator
          >
            <q-tab name="dados" label="Dados Básicos" icon="person" />
            <q-tab name="horarios" label="Horários de Trabalho" icon="schedule" />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="activeTab" animated>
            <!-- Aba: Dados Básicos -->
            <q-tab-panel name="dados" class="q-pa-md">
              <q-form @submit.prevent="saveBarber" class="q-gutter-md">
                <!-- Nome -->
                <q-input
                  v-model="form.name"
                  label="Nome completo"
                  outlined
                  :rules="[val => !!val || 'Nome é obrigatório']"
                  prepend-icon="person"
                />

                <!-- Email -->
                <q-input
                  v-model="form.email"
                  type="email"
                  label="Email"
                  outlined
                  :rules="[
                    val => !!val || 'Email é obrigatório',
                    val => val.includes('@') || 'Email deve ser válido'
                  ]"
                  prepend-icon="email"
                />

                <!-- Telefone -->
                <q-input
                  v-model="form.phone"
                  label="Telefone"
                  outlined
                  mask="(##) #####-####"
                  :rules="[val => !!val || 'Telefone é obrigatório']"
                  prepend-icon="phone"
                />

                <!-- Upload da Foto -->
                <div class="q-mb-md">
                  <q-label class="q-mb-sm text-subtitle2">Foto do Barbeiro</q-label>
                  
                  <!-- Preview da foto atual -->
                  <div v-if="form.photoPreview || editingBarber?.photoUrl" class="q-mb-md text-center">
                    <q-avatar size="80px" class="q-mb-sm">
                      <img 
                        :src="form.photoPreview || editingBarber?.photoUrl" 
                        :alt="`Foto de ${form.name || 'barbeiro'}`"
                        @error="$event.target.src = 'https://via.placeholder.com/80x80/ccc/666?text=?'"
                      />
                    </q-avatar>
                    <div class="text-caption text-grey-6">
                      {{ form.photoPreview ? 'Nova foto selecionada' : 'Foto atual' }}
                    </div>
                  </div>

                  <!-- Input de arquivo -->
                  <q-file
                    v-model="form.photoFile"
                    label="Selecionar foto"
                    outlined
                    accept="image/*"
                    max-file-size="5242880"
                    @update:model-value="onPhotoSelected"
                    @rejected="onPhotoRejected"
                    prepend-icon="photo_camera"
                    hint="Formatos aceitos: JPG, PNG, GIF, WebP (máximo 5MB)"
                    clearable
                    @clear="clearPhoto"
                  >
                    <template #prepend>
                      <q-icon name="photo_camera" />
                    </template>
                  </q-file>
                </div>
              </q-form>
            </q-tab-panel>

            <!-- Aba: Horários de Trabalho -->
            <q-tab-panel name="horarios" class="q-pa-md">
              <div class="text-h6 q-mb-md">Configuração de Horários</div>
              <p class="text-body2 text-grey-7 q-mb-lg">
                Configure os dias e horários de trabalho do barbeiro. Você também pode definir intervalos para almoço ou descanso.
              </p>

              <q-banner 
                v-if="!hasEnabledDays" 
                class="bg-orange-1 text-orange-8 q-mb-md"
                icon="warning"
              >
                <template #avatar>
                  <q-icon name="warning" color="orange" />
                </template>
                O barbeiro deve ter pelo menos um dia da semana configurado para aceitar agendamentos.
              </q-banner>

              <div class="row items-center q-mb-md">
                <div class="col">
                  <div class="text-subtitle1">Configuração dos Dias</div>
                </div>
                <div class="col-auto">
                  <q-btn
                    outline
                    color="primary"
                    label="Aplicar para todos"
                    icon="content_copy"
                    size="sm"
                    @click="showBulkConfigDialog = true"
                    :disable="!hasAnyEnabledDay"
                  />
                </div>
              </div>
              
              <div class="q-gutter-md">
                <q-card 
                  v-for="(config, day) in workingHours" 
                  :key="day"
                  flat
                  bordered
                  :class="config.enabled ? 'bg-green-1' : 'bg-grey-1'"
                >
                  <q-card-section class="q-pa-sm">
                    <div class="row items-center q-col-gutter-sm">
                      <div class="col-auto" style="min-width: 140px">
                        <q-toggle
                          v-model="config.enabled"
                          :label="getDayLabel(day)"
                          color="primary"
                          @update:model-value="validateWorkingHours"
                        />
                      </div>
                      
                      <template v-if="config.enabled">
                        <div class="col-auto">
                          <q-input
                            v-model="config.startTime"
                            label="Início"
                            type="time"
                            outlined
                            dense
                            style="min-width: 100px"
                            :rules="[val => !!val || 'Obrigatório']"
                            @update:model-value="validateDayHours(day)"
                          />
                        </div>
                        
                        <div class="col-auto">
                          <q-input
                            v-model="config.endTime"
                            label="Fim"
                            type="time"
                            outlined
                            dense
                            style="min-width: 100px"
                            :rules="[val => !!val || 'Obrigatório']"
                            @update:model-value="validateDayHours(day)"
                          />
                        </div>
                        
                        <div class="col-auto">
                          <q-btn
                            flat
                            round
                            icon="more_horiz"
                            color="primary"
                            size="sm"
                            @click="toggleBreakConfig(day)"
                          >
                            <q-tooltip>{{ config.showBreak ? 'Ocultar' : 'Configurar' }} intervalo</q-tooltip>
                          </q-btn>
                        </div>
                      </template>
                    </div>
                    
                    <!-- Configuração de intervalo -->
                    <div v-if="config.enabled && config.showBreak" class="row items-center q-col-gutter-sm q-mt-sm q-ml-lg">
                      <div class="col-auto text-caption text-grey-7">
                        Intervalo:
                      </div>
                      <div class="col-auto">
                        <q-input
                          v-model="config.breakStart"
                          label="Início"
                          type="time"
                          outlined
                          dense
                          style="min-width: 100px"
                          @update:model-value="validateDayHours(day)"
                        />
                      </div>
                      <div class="col-auto">
                        <q-input
                          v-model="config.breakEnd"
                          label="Fim"
                          type="time"
                          outlined
                          dense
                          style="min-width: 100px"
                          @update:model-value="validateDayHours(day)"
                        />
                      </div>
                    </div>
                    
                    <div v-if="dayErrors[day]" class="q-mt-sm">
                      <q-banner class="bg-red-1 text-red-8" dense>
                        <template #avatar>
                          <q-icon name="error" color="red" />
                        </template>
                        {{ dayErrors[day] }}
                      </q-banner>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            label="Cancelar"
            @click="closeDialog"
            color="grey-7"
          />
          <q-btn
            @click="saveBarber"
            color="primary"
            label="Salvar"
            :loading="saving"
            :disable="!isFormValid"
            unelevated
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog de confirmação de exclusão -->
    <q-dialog v-model="showDeleteDialog" @hide="closeDeleteDialog">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm text-h6">Confirmar exclusão</span>
        </q-card-section>

        <q-card-section>
          Tem certeza que deseja excluir o barbeiro <strong>{{ barberToDelete?.name }}</strong>?
          Esta ação não pode ser desfeita.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancelar"
            @click="showDeleteDialog = false"
            color="grey-7"
          />
          <q-btn
            @click="deleteBarber"
            color="negative"
            label="Excluir"
            :loading="deleting"
            unelevated
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog de visualização de foto -->
    <q-dialog v-model="showPhotoDialog" @hide="closePhotoDialog">
      <q-card class="photo-dialog">
        <q-card-section class="bg-primary text-white q-pa-md">
          <div class="text-h6 flex items-center">
            <q-icon name="photo" class="q-mr-sm" />
            Foto de {{ selectedPhoto.barberName }}
          </div>
        </q-card-section>

        <q-card-section class="q-pa-none">
          <div class="photo-container">
            <img 
              :src="selectedPhoto.url" 
              :alt="`Foto de ${selectedPhoto.barberName}`"
              @error="$event.target.src = 'https://via.placeholder.com/400x400/ccc/666?text=Erro+ao+carregar'"
              class="full-width"
              style="max-height: 70vh; object-fit: contain;"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            label="Fechar"
            @click="closePhotoDialog"
            color="primary"
            icon="close"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para configuração em lote de horários -->
    <q-dialog v-model="showBulkConfigDialog" @hide="closeBulkConfigDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Aplicar Configuração</div>
          <div class="text-body2 text-grey-7 q-mt-sm">
            Copie a configuração de um dia para outros dias selecionados.
          </div>
        </q-card-section>
        
        <q-card-section class="q-pt-none">
          <div class="q-mb-md">
            <q-select
              v-model="bulkConfig.sourceDay"
              :options="enabledDayOptions"
              label="Copiar configuração de"
              emit-value
              map-options
              outlined
            />
          </div>
          
          <div class="q-mb-md">
            <div class="text-body2 q-mb-sm">Aplicar nos dias:</div>
            <q-option-group
              v-model="bulkConfig.targetDays"
              :options="allDayOptions"
              type="checkbox"
              color="primary"
            />
          </div>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn 
            unelevated 
            label="Aplicar" 
            color="primary" 
            @click="applyBulkConfig"
            :disable="!bulkConfig.sourceDay || bulkConfig.targetDays.length === 0"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Notify, useQuasar } from 'quasar'
import { api } from 'src/boot/axios'

// Quasar instance
const $q = useQuasar()

// Estados reativos
const barbers = ref([])
const filter = ref('')
const loading = ref(false)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const showPhotoDialog = ref(false)
const showBulkConfigDialog = ref(false)
const saving = ref(false)
const deleting = ref(false)
const editingBarber = ref(null)
const barberToDelete = ref(null)
const selectedPhoto = ref({
  url: '',
  barberName: ''
})

// Formulário
const form = ref({
  name: '',
  email: '',
  phone: '',
  photoFile: null,
  photoPreview: null
})

// Estados para controle de abas no modal
const activeTab = ref('dados')

// Estados para horários de trabalho
const workingHours = ref({
  monday: { enabled: false, startTime: '08:00', endTime: '18:00', showBreak: false },
  tuesday: { enabled: false, startTime: '08:00', endTime: '18:00', showBreak: false },
  wednesday: { enabled: false, startTime: '08:00', endTime: '18:00', showBreak: false },
  thursday: { enabled: false, startTime: '08:00', endTime: '18:00', showBreak: false },
  friday: { enabled: false, startTime: '08:00', endTime: '18:00', showBreak: false },
  saturday: { enabled: false, startTime: '08:00', endTime: '18:00', showBreak: false },
  sunday: { enabled: false, startTime: '08:00', endTime: '18:00', showBreak: false }
})

const dayErrors = ref({})

const bulkConfig = ref({
  sourceDay: null,
  targetDays: []
})

const dayLabels = {
  monday: 'Segunda-feira',
  tuesday: 'Terça-feira', 
  wednesday: 'Quarta-feira',
  thursday: 'Quinta-feira',
  friday: 'Sexta-feira',
  saturday: 'Sábado',
  sunday: 'Domingo'
}

// Configuração da tabela
const columns = [
  {
    name: 'photo',
    label: 'Foto',
    field: 'photoUrl',
    align: 'center',
    style: 'width: 80px'
  },
  {
    name: 'name',
    label: 'Nome',
    field: 'name',
    align: 'left',
    sortable: true
  },
  {
    name: 'email',
    label: 'Email',
    field: 'email',
    align: 'left',
    sortable: true
  },
  {
    name: 'phone',
    label: 'Telefone',
    field: 'phone',
    align: 'left'
  },
  {
    name: 'createdAt',
    label: 'Cadastrado em',
    field: 'createdAt',
    align: 'left',
    format: (val) => new Date(val).toLocaleDateString('pt-BR'),
    sortable: true
  },
  {
    name: 'actions',
    label: 'Ações',
    field: 'actions',
    align: 'center',
    style: 'width: 120px'
  }
]

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  sortBy: 'name',
  descending: false,
  rowsPerPageOptions: [5, 10, 15, 25, 50]
})

// Computed properties
const isFormValid = computed(() => {
  return form.value.name && form.value.email && form.value.phone && form.value.email.includes('@')
})

const hasEnabledDays = computed(() => {
  return Object.values(workingHours.value).some(day => day.enabled)
})

const hasAnyEnabledDay = computed(() => {
  return Object.values(workingHours.value).some(day => day.enabled)
})

const enabledDayOptions = computed(() => {
  return Object.entries(workingHours.value)
    .filter(([, config]) => config.enabled)
    .map(([day]) => ({
      label: dayLabels[day],
      value: day
    }))
})

const allDayOptions = computed(() => {
  return Object.keys(workingHours.value).map(day => ({
    label: dayLabels[day],
    value: day
  }))
})

const filteredBarbers = computed(() => {
  if (!filter.value) {
    return barbers.value
  }
  
  const searchTerm = filter.value.toLowerCase()
  
  return barbers.value.filter(barber => {
    return (
      barber.name?.toLowerCase().includes(searchTerm) ||
      barber.email?.toLowerCase().includes(searchTerm) ||
      barber.phone?.toLowerCase().includes(searchTerm)
    )
  })
})

const paginationLabel = (firstRowIndex, endRowIndex, totalRowsNumber) => {
  return `${firstRowIndex}-${endRowIndex} de ${totalRowsNumber}`
}

// Funções para upload de foto
function onPhotoSelected(file) {
  if (file) {
    // Criar preview da imagem
    const reader = new FileReader()
    reader.onload = (e) => {
      form.value.photoPreview = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

function onPhotoRejected(rejectedEntries) {
  const rejection = rejectedEntries[0]
  let message = 'Erro ao selecionar arquivo'
  
  if (rejection.failedPropValidation === 'max-file-size') {
    message = 'Arquivo muito grande. Máximo 5MB'
  } else if (rejection.failedPropValidation === 'accept') {
    message = 'Tipo de arquivo não aceito. Use apenas imagens'
  }
  
  Notify.create({
    type: 'negative',
    message,
    position: 'bottom-right',
    icon: 'error'
  })
}

function clearPhoto() {
  form.value.photoFile = null
  form.value.photoPreview = null
}

// Funções para dialog de visualização de foto
function openPhotoDialog(photoUrl, barberName) {
  selectedPhoto.value = {
    url: photoUrl,
    barberName: barberName
  }
  showPhotoDialog.value = true
}

function closePhotoDialog() {
  showPhotoDialog.value = false
  selectedPhoto.value = {
    url: '',
    barberName: ''
  }
}

// Métodos
async function loadBarbers() {
  loading.value = true
  try {
    const response = await api.get('/barbers')
    
    // Garantir que sempre temos um array
    const data = response.data
    if (Array.isArray(data)) {
      barbers.value = data
    } else if (data && Array.isArray(data.data)) {
      barbers.value = data.data
    } else {
      console.warn('Resposta da API não é um array:', data)
      barbers.value = []
    }
  } catch (error) {
    console.error('Erro ao carregar barbeiros:', error)
    
    if (error.response?.status === 404) {
      barbers.value = []
    } else {
      Notify.create({
        type: 'negative',
        message: 'Erro ao carregar barbeiros',
        position: 'bottom-right',
        icon: 'error'
      })
    }
  } finally {
    loading.value = false
  }
}

function openDialog(barber = null) {
  editingBarber.value = barber
  activeTab.value = 'dados' // Sempre começar na aba de dados
  
  if (barber) {
    form.value = {
      name: barber.name,
      email: barber.email,
      phone: barber.phone,
      photoFile: null,
      photoPreview: null
    }
    
    // Carregar horários de trabalho do barbeiro
    loadBarberWorkingHours(barber.id)
  } else {
    form.value = {
      name: '',
      email: '',
      phone: '',
      photoFile: null,
      photoPreview: null
    }
    
    // Reset horários para padrão
    loadBarberWorkingHours(null)
  }
  
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
  editingBarber.value = null
  form.value = {
    name: '',
    email: '',
    phone: '',
    photoFile: null,
    photoPreview: null
  }
}

function closeDeleteDialog() {
  showDeleteDialog.value = false
  barberToDelete.value = null
}

function closeBulkConfigDialog() {
  showBulkConfigDialog.value = false
  bulkConfig.value = {
    sourceDay: null,
    targetDays: []
  }
}

async function saveBarber() {
  if (!isFormValid.value) {
    Notify.create({
      type: 'warning',
      message: 'Preencha todos os campos obrigatórios',
      position: 'bottom-right'
    })
    return
  }

  saving.value = true
  
  try {
    // Criar FormData para envio do arquivo
    const formData = new FormData()
    formData.append('name', form.value.name)
    formData.append('email', form.value.email)
    formData.append('phone', form.value.phone)
    
    if (editingBarber.value) {
      formData.append('id', editingBarber.value.id.toString())
    }
    
    // Adicionar foto se selecionada
    if (form.value.photoFile) {
      formData.append('photo', form.value.photoFile)
    }

    const response = await api.post('/barbers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    
    // Se salvou o barbeiro com sucesso, salvar também os horários (se editando)
    if (editingBarber.value || response.data.barber) {
      const barberId = editingBarber.value?.id || response.data.barber?.id
      
      if (barberId) {
        await saveBarberWorkingHours(barberId)
      }
    }
    
    Notify.create({
      type: 'positive',
      message: response.data.message,
      position: 'bottom-right',
      icon: 'check_circle'
    })

    closeDialog()
    await loadBarbers()
    
  } catch (error) {
    console.error('Erro ao salvar barbeiro:', error)
    
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || 'Erro ao salvar barbeiro',
      position: 'bottom-right',
      icon: 'error'
    })
  } finally {
    saving.value = false
  }
}

function confirmDelete(barber) {
  barberToDelete.value = barber
  showDeleteDialog.value = true
}

async function deleteBarber() {
  if (!barberToDelete.value) return
  
  deleting.value = true
  
  try {
    await api.delete(`/barbers/${barberToDelete.value.id}`)
    
    Notify.create({
      type: 'positive',
      message: 'Barbeiro excluído com sucesso',
      position: 'bottom-right',
      icon: 'check_circle'
    })

    showDeleteDialog.value = false
    barberToDelete.value = null
    await loadBarbers()
    
  } catch (error) {
    console.error('Erro ao excluir barbeiro:', error)
    
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || 'Erro ao excluir barbeiro',
      position: 'bottom-right',
      icon: 'error'
    })
  } finally {
    deleting.value = false
  }
}

// Carregar barbeiros ao montar o componente
onMounted(() => {
  loadBarbers()
})

// Funções para gerenciamento de horários de trabalho
const getDayLabel = (day) => {
  return dayLabels[day] || day
}

const timeToMinutes = (time) => {
  if (!time) return 0
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

const validateDayHours = (day) => {
  const config = workingHours.value[day]
  delete dayErrors.value[day]
  
  if (!config.enabled) return
  
  if (!config.startTime || !config.endTime) {
    dayErrors.value[day] = 'Horário de início e fim são obrigatórios'
    return
  }
  
  const startMinutes = timeToMinutes(config.startTime)
  const endMinutes = timeToMinutes(config.endTime)
  
  if (endMinutes <= startMinutes) {
    dayErrors.value[day] = 'Horário de fim deve ser posterior ao de início'
    return
  }
  
  // Validar intervalo se configurado
  if (config.breakStart && config.breakEnd) {
    const breakStartMinutes = timeToMinutes(config.breakStart)
    const breakEndMinutes = timeToMinutes(config.breakEnd)
    
    if (breakEndMinutes <= breakStartMinutes) {
      dayErrors.value[day] = 'Horário de fim do intervalo deve ser posterior ao de início'
      return
    }
    
    if (breakStartMinutes < startMinutes || breakEndMinutes > endMinutes) {
      dayErrors.value[day] = 'Intervalo deve estar dentro do horário de trabalho'
      return
    }
  }
}

const validateWorkingHours = () => {
  dayErrors.value = {}
  Object.keys(workingHours.value).forEach(day => {
    validateDayHours(day)
  })
}

const toggleBreakConfig = (day) => {
  workingHours.value[day].showBreak = !workingHours.value[day].showBreak
  
  // Limpar horários de intervalo se ocultar
  if (!workingHours.value[day].showBreak) {
    workingHours.value[day].breakStart = ''
    workingHours.value[day].breakEnd = ''
    validateDayHours(day)
  }
}

const applyBulkConfig = () => {
  const sourceConfig = workingHours.value[bulkConfig.value.sourceDay]
  
  bulkConfig.value.targetDays.forEach(targetDay => {
    workingHours.value[targetDay] = {
      ...sourceConfig,
      showBreak: sourceConfig.breakStart && sourceConfig.breakEnd
    }
  })
  
  validateWorkingHours()
  showBulkConfigDialog.value = false
  
  $q.notify({
    type: 'positive',
    message: 'Configuração aplicada com sucesso',
    position: 'top'
  })
}

const loadBarberWorkingHours = async (barberId) => {
  if (!barberId) {
    // Reset para horários padrão se não tem barbeiro
    workingHours.value = {
      monday: { enabled: false, startTime: '08:00', endTime: '18:00', showBreak: false },
      tuesday: { enabled: false, startTime: '08:00', endTime: '18:00', showBreak: false },
      wednesday: { enabled: false, startTime: '08:00', endTime: '18:00', showBreak: false },
      thursday: { enabled: false, startTime: '08:00', endTime: '18:00', showBreak: false },
      friday: { enabled: false, startTime: '08:00', endTime: '18:00', showBreak: false },
      saturday: { enabled: false, startTime: '08:00', endTime: '18:00', showBreak: false },
      sunday: { enabled: false, startTime: '08:00', endTime: '18:00', showBreak: false }
    }
    return
  }
  
  try {
    const response = await api.get(`/barbers/${barberId}/working-hours`)
    
    // Adicionar propriedade showBreak baseada na existência de intervalos
    Object.keys(response.data.workingHours).forEach(day => {
      const config = response.data.workingHours[day]
      config.showBreak = !!(config.breakStart && config.breakEnd)
    })
    
    workingHours.value = response.data.workingHours
    validateWorkingHours()
    
  } catch (error) {
    console.error('Erro ao carregar horários:', error)
    // Em caso de erro, manter horários padrão
  }
}

const saveBarberWorkingHours = async (barberId) => {
  try {
    // Preparar dados removendo propriedades de UI
    const hoursToSave = {}
    Object.keys(workingHours.value).forEach(day => {
      const config = { ...workingHours.value[day] }
      delete config.showBreak
      
      // Limpar intervalos se não estiverem completos
      if (!config.breakStart || !config.breakEnd) {
        delete config.breakStart
        delete config.breakEnd
      }
      
      hoursToSave[day] = config
    })
    
    await api.put(`/barbers/${barberId}/working-hours`, {
      workingHours: hoursToSave
    })
    
    console.log('Horários de trabalho salvos com sucesso')
    
  } catch (error) {
    console.error('Erro ao salvar horários:', error)
    
    $q.notify({
      type: 'warning',
      message: 'Barbeiro salvo, mas houve erro ao salvar horários de trabalho',
      position: 'top'
    })
  }
}
</script>

<style scoped>
.barber-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.barber-table {
  .q-table__top {
    padding: 16px;
    border-bottom: 1px solid #e0e0e0;
  }
}

.q-table tbody td {
  border-bottom: 1px solid #f5f5f5;
}

.q-table tbody tr:hover {
  background-color: #f9f9f9;
}

/* Estilos para o dialog de foto */
.photo-dialog {
  max-width: 90vw;
  max-height: 90vh;
}

.photo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.photo-container img {
  border-radius: 4px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Cursor pointer para fotos clicáveis */
.cursor-pointer {
  cursor: pointer;
  transition: transform 0.2s ease;
}

.cursor-pointer:hover {
  transform: scale(1.05);
}

@media (max-width: 600px) {
  .q-page {
    padding: 16px 8px;
  }
  
  .barber-card {
    margin: 0 -8px;
  }
  
  .photo-dialog {
    max-width: 95vw;
    max-height: 80vh;
  }
}
</style>
