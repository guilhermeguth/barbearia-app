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
          flat
          class="barber-table"
          loading-label="Carregando barbeiros..."
          no-data-label="Nenhum barbeiro encontrado"
          no-results-label="Nenhum resultado para o filtro aplicado"
          rows-per-page-label="Registros por página:"
          :pagination-label="paginationLabel"
        >
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
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="edit" class="q-mr-sm" />
            {{ editingBarber ? 'Editar Barbeiro' : 'Novo Barbeiro' }}
          </div>
        </q-card-section>

        <q-card-section>
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
          </q-form>
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
    <q-dialog v-model="showDeleteDialog" persistent>
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
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Notify } from 'quasar'
import { api as axios } from 'src/boot/axios'

// Estados reativos
const barbers = ref([])
const filter = ref('')
const loading = ref(false)
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const saving = ref(false)
const deleting = ref(false)
const editingBarber = ref(null)
const barberToDelete = ref(null)

// Formulário
const form = ref({
  name: '',
  email: '',
  phone: ''
})

// Configuração da tabela
const columns = [
  {
    name: 'id',
    label: 'ID',
    field: 'id',
    align: 'left',
    sortable: true,
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

// Computed
const isFormValid = computed(() => {
  return form.value.name && 
         form.value.email && 
         form.value.phone &&
         form.value.email.includes('@')
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

// Métodos
async function loadBarbers() {
  loading.value = true
  try {
    const response = await axios.get('/barbers')
    
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
  
  if (barber) {
    form.value = {
      name: barber.name,
      email: barber.email,
      phone: barber.phone
    }
  } else {
    form.value = {
      name: '',
      email: '',
      phone: ''
    }
  }
  
  showDialog.value = true
}

function closeDialog() {
  showDialog.value = false
  editingBarber.value = null
  form.value = {
    name: '',
    email: '',
    phone: ''
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
    const data = {
      ...form.value,
      ...(editingBarber.value ? { id: editingBarber.value.id } : {})
    }

    const response = await axios.post('/barbers', data)
    
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
    await axios.delete(`/barbers/${barberToDelete.value.id}`)
    
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

@media (max-width: 600px) {
  .q-page {
    padding: 16px 8px;
  }
  
  .barber-card {
    margin: 0 -8px;
  }
}
</style>
