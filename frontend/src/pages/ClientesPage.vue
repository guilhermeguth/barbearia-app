<template>
  <q-page class="q-pa-lg">
    <!-- Header da página -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h4 class="q-ma-none text-primary text-weight-bold">
          <q-icon name="people" class="q-mr-sm" />
          Gestão de Clientes
        </h4>
        <p class="text-grey-6 q-mb-none">Gerencie os clientes da barbearia</p>
      </div>
      <q-btn
        color="primary"
        icon="add"
        label="Novo Cliente"
        @click="openDialog()"
        unelevated
      />
    </div>

    <!-- Filtro de busca -->
    <div class="q-mb-md">
      <q-input
        v-model="filter"
        placeholder="Buscar cliente por nome, email ou telefone..."
        outlined
        clearable
        debounce="300"
        class="full-width"
      >
        <template #prepend>
          <q-icon name="search" />
        </template>
      </q-input>
    </div>

    <!-- Tabela de clientes -->
    <q-card class="client-card">
      <q-card-section class="q-pa-none">
        <q-table
          :rows="filteredClients"
          :columns="columns"
          row-key="id"
          :loading="loading"
          :pagination="pagination"
          @update:pagination="pagination = $event"
          flat
          class="client-table"
          loading-label="Carregando clientes..."
          no-data-label="Nenhum cliente encontrado"
          no-results-label="Nenhum resultado para o filtro aplicado"
          rows-per-page-label="Registros por página:"
          :pagination-label="paginationLabel"
        >
          <!-- Template para tipo de cliente -->
          <template #body-cell-type="props">
            <q-td :props="props">
              <q-chip
                :color="props.value === 'Com App' ? 'positive' : 'grey'"
                text-color="white"
                size="sm"
                :icon="props.value === 'Com App' ? 'smartphone' : 'person'"
              >
                {{ props.value }}
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
              >
                <q-tooltip>Editar cliente</q-tooltip>
              </q-btn>
              
              <!-- Botão para vincular usuário (apenas para clientes sem app) -->
              <q-btn
                v-if="!props.row.user"
                flat
                round
                dense
                color="info"
                icon="link"
                @click="openLinkDialog(props.row)"
                class="q-mr-xs"
              >
                <q-tooltip>Vincular a usuário existente</q-tooltip>
              </q-btn>
              
              <!-- Botão para desvincular usuário (apenas para clientes com app) -->
              <q-btn
                v-if="props.row.user"
                flat
                round
                dense
                color="warning"
                icon="link_off"
                @click="confirmUnlink(props.row)"
                class="q-mr-xs"
              >
                <q-tooltip>Desvincular usuário</q-tooltip>
              </q-btn>
              
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                @click="confirmDelete(props.row)"
              >
                <q-tooltip>Excluir cliente</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <!-- Template quando não há dados -->
          <template #no-data>
            <div class="full-width row flex-center text-grey-6 q-gutter-sm q-py-xl">
              <q-icon size="2em" :name="filter ? 'search_off' : 'people_off'" />
              <span class="text-h6">
                <span v-if="filter">
                  Nenhum cliente encontrado para "{{ filter }}"
                </span>
                <span v-else>
                  Nenhum cliente cadastrado
                </span>
              </span>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Dialog para adicionar/editar cliente -->
    <q-dialog v-model="showDialog" persistent>
      <q-card style="min-width: 500px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="edit" class="q-mr-sm" />
            {{ editingClient ? 'Editar Cliente' : 'Novo Cliente' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="saveClient" class="q-gutter-md">
            <!-- Tipo de Cliente -->
            <div class="q-mb-md">
              <q-banner class="bg-blue-1 text-blue-8">
                <template #avatar>
                  <q-icon name="info" color="blue" />
                </template>
                <div class="text-body2">
                  <strong>Tipos de Cliente:</strong><br>
                  • <strong>Cliente Simples:</strong> Cadastrado pelo barbeiro, não usa o app<br>
                  • <strong>Cliente com App:</strong> Tem conta no sistema e pode agendar pelo app
                </div>
              </q-banner>
            </div>

            <q-select
              v-model="form.clientType"
              :options="[
                { label: 'Cliente Simples (sem app)', value: 'simple' },
                { label: 'Cliente com App', value: 'withApp' }
              ]"
              label="Tipo de Cliente"
              outlined
              emit-value
              map-options
              prepend-icon="category"
              :rules="[val => !!val || 'Tipo de cliente é obrigatório']"
            />

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
              :rules="form.clientType === 'withApp' ? [
                val => !!val || 'Email é obrigatório para clientes com app',
                val => val.includes('@') || 'Email deve ser válido'
              ] : [
                val => !val || val.includes('@') || 'Email deve ser válido'
              ]"
              prepend-icon="email"
              :hint="form.clientType === 'withApp' ? 'Obrigatório para clientes com app' : 'Opcional'"
            />

            <!-- Telefone -->
            <q-input
              v-model="form.phone"
              label="Telefone"
              outlined
              mask="(##) #####-####"
              prepend-icon="phone"
              hint="Opcional"
            />

            <!-- Data de Nascimento -->
            <q-input
              v-model="form.birthDate"
              label="Data de Nascimento"
              outlined
              type="date"
              prepend-icon="cake"
              hint="Opcional"
            />

            <!-- Observações -->
            <q-input
              v-model="form.notes"
              label="Observações"
              outlined
              type="textarea"
              rows="3"
              prepend-icon="note"
              hint="Observações internas sobre o cliente"
            />

            <!-- Senha para cliente com app (simplificado) -->
            <div v-if="form.clientType === 'withApp'" class="q-mt-md">
              <q-separator class="q-mb-md" />
              <div class="text-h6 text-primary q-mb-md">
                <q-icon name="smartphone" class="q-mr-sm" />
                Acesso ao App
              </div>

              <q-banner class="bg-green-1 text-green-8 q-mb-md">
                <template #avatar>
                  <q-icon name="add_circle" color="green" />
                </template>
                Um novo usuário será criado automaticamente para este cliente acessar o app.
              </q-banner>

              <q-input
                v-model="form.password"
                type="password"
                label="Senha para acesso ao app"
                outlined
                :rules="[val => !!val || 'Senha é obrigatória para clientes com app']"
                prepend-icon="lock"
                hint="Senha que o cliente usará para acessar o app"
              />
            </div>
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
            @click="saveClient"
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
          Tem certeza que deseja excluir o cliente <strong>{{ clientToDelete?.name }}</strong>?
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
            @click="deleteClient"
            color="negative"
            label="Excluir"
            :loading="deleting"
            unelevated
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog para vincular usuário -->
    <q-dialog v-model="showLinkDialog" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="link" class="q-mr-sm" />
            Vincular Cliente a Usuário
          </div>
        </q-card-section>

        <q-card-section>
          <div class="q-mb-md">
            <q-banner class="bg-blue-1 text-blue-8">
              <template #avatar>
                <q-icon name="info" color="blue" />
              </template>
              <div class="text-body2">
                Vincule o cliente <strong>{{ clientToLink?.name }}</strong> a um usuário existente que já possui conta no sistema.
              </div>
            </q-banner>
          </div>

          <q-form @submit.prevent="linkUserToClient" class="q-gutter-md">
            <q-input
              v-model="linkForm.userEmail"
              label="Email do usuário"
              outlined
              type="email"
              prepend-icon="email"
              debounce="500"
              @input="searchUnlinkedUsers"
              :rules="[val => !!val || 'Email é obrigatório']"
              hint="Digite o email do usuário para buscar"
            />

            <div v-if="unlinkedUsers.length > 0" class="q-mt-md">
              <q-list bordered separator>
                <q-item-label header>Usuários encontrados:</q-item-label>
                <q-item
                  v-for="user in unlinkedUsers"
                  :key="user.id"
                  clickable
                  @click="selectUser(user)"
                  :class="{ 'bg-blue-1': linkForm.selectedUserId === user.id }"
                >
                  <q-item-section avatar>
                    <q-icon name="person" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ user.name }}</q-item-label>
                    <q-item-label caption>{{ user.email }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-radio
                      v-model="linkForm.selectedUserId"
                      :val="user.id"
                      color="primary"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
            </div>

            <div v-else-if="linkForm.userEmail && linkForm.userEmail.length > 3" class="text-center q-py-md">
              <q-icon name="search_off" size="2em" color="grey-5" />
              <div class="text-grey-6">Nenhum usuário encontrado para este email</div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn
            flat
            label="Cancelar"
            @click="closeLinkDialog"
            color="grey-7"
          />
          <q-btn
            @click="linkUserToClient"
            color="info"
            label="Vincular"
            :loading="linking"
            :disable="!linkForm.selectedUserId"
            unelevated
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog de confirmação para desvincular usuário -->
    <q-dialog v-model="showUnlinkDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="link_off" color="warning" text-color="white" />
          <span class="q-ml-sm text-h6">Confirmar desvinculação</span>
        </q-card-section>

        <q-card-section>
          Tem certeza que deseja desvincular o usuário do cliente <strong>{{ clientToUnlink?.name }}</strong>?
          O cliente continuará existindo, mas não poderá mais acessar o app.
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancelar"
            @click="showUnlinkDialog = false"
            color="grey-7"
          />
          <q-btn
            @click="unlinkUser"
            color="warning"
            label="Desvincular"
            :loading="unlinking"
            unelevated
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { api } from 'src/boot/axios'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Estados reativas
const clients = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const filter = ref('')
const showDialog = ref(false)
const showDeleteDialog = ref(false)
const editingClient = ref(null)
const clientToDelete = ref(null)

// Estados para vinculação de usuários
const showLinkDialog = ref(false)
const showUnlinkDialog = ref(false)
const clientToLink = ref(null)
const clientToUnlink = ref(null)
const linking = ref(false)
const unlinking = ref(false)
const unlinkedUsers = ref([])

// Formulário
const form = ref({
  name: '',
  email: '',
  phone: '',
  birthDate: '',
  notes: '',
  clientType: 'simple', // 'simple' ou 'withApp'
  password: ''
})

// Formulário para vinculação
const linkForm = ref({
  userEmail: '',
  selectedUserId: null
})

// Configuração da paginação
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  sortBy: 'name',
  descending: false,
  rowsPerPageOptions: [5, 10, 15, 25, 50]
})

// Colunas da tabela
const columns = [
  {
    name: 'name',
    required: true,
    label: 'Nome',
    align: 'left',
    field: 'name',
    sortable: true
  },
  {
    name: 'email',
    label: 'Email',
    align: 'left',
    field: 'email',
    sortable: true
  },
  {
    name: 'phone',
    label: 'Telefone',
    align: 'left',
    field: 'phone',
    sortable: true
  },
  {
    name: 'type',
    label: 'Tipo',
    align: 'center',
    field: row => row.user ? 'Com App' : 'Simples',
    sortable: true
  },
  {
    name: 'birthDate',
    label: 'Nascimento',
    align: 'center',
    field: 'birthDate',
    format: val => val ? new Date(val).toLocaleDateString('pt-BR') : '-',
    sortable: true
  },
  {
    name: 'createdAt',
    label: 'Cadastrado em',
    align: 'center',
    field: 'createdAt',
    format: val => new Date(val).toLocaleDateString('pt-BR'),
    sortable: true
  },
  {
    name: 'actions',
    label: 'Ações',
    align: 'center'
  }
]

// Computed para clientes filtrados
const filteredClients = computed(() => {
  if (!filter.value) return clients.value
  
  const searchTerm = filter.value.toLowerCase()
  return clients.value.filter(client => 
    client.name?.toLowerCase().includes(searchTerm) ||
    client.email?.toLowerCase().includes(searchTerm) ||
    client.phone?.toLowerCase().includes(searchTerm)
  )
})

// Computed para validação do formulário
const isFormValid = computed(() => {
  const baseValid = form.value.name.trim() !== '' && form.value.clientType !== ''
  
  if (form.value.clientType === 'withApp') {
    const emailValid = form.value.email.trim() !== '' && form.value.email.includes('@')
    const passwordValid = form.value.password.trim() !== ''
    return baseValid && emailValid && passwordValid
  }
  
  return baseValid
})

// Label da paginação
const paginationLabel = (firstRowIndex, endRowIndex, totalRowsNumber) => {
  return `${firstRowIndex}-${endRowIndex} de ${totalRowsNumber}`
}

// Função para carregar clientes
async function loadClients() {
  try {
    loading.value = true
    const response = await api.get('/customers')
    clients.value = response.data
  } catch (error) {
    console.error('Erro ao carregar clientes:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao carregar clientes',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

// Função para abrir dialog
function openDialog(client = null) {
  editingClient.value = client
  
  if (client) {
    form.value = {
      name: client.name || '',
      email: client.email || '',
      phone: client.phone || '',
      birthDate: client.birthDate || '',
      notes: client.notes || '',
      clientType: client.user ? 'withApp' : 'simple',
      password: ''
    }
  } else {
    form.value = {
      name: '',
      email: '',
      phone: '',
      birthDate: '',
      notes: '',
      clientType: 'simple',
      password: ''
    }
  }
  
  showDialog.value = true
}

// Função para fechar dialog
function closeDialog() {
  showDialog.value = false
  editingClient.value = null
  form.value = {
    name: '',
    email: '',
    phone: '',
    birthDate: '',
    notes: '',
    clientType: 'simple',
    password: ''
  }
}

// Função para salvar cliente
async function saveClient() {
  if (!isFormValid.value) return

  try {
    saving.value = true
    
    const payload = {
      name: form.value.name,
      email: form.value.email || null,
      phone: form.value.phone || null,
      birthDate: form.value.birthDate || null,
      notes: form.value.notes || null
    }

    // Se for cliente com app, criar usuário automaticamente
    if (form.value.clientType === 'withApp') {
      payload.createUser = true
      payload.password = form.value.password
    }

    // Se estiver editando, adicionar ID
    if (editingClient.value) {
      payload.id = editingClient.value.id
    }

    const response = await api.post('/customers', payload)
    
    $q.notify({
      type: 'positive',
      message: response.data.message,
      position: 'top'
    })

    await loadClients()
    closeDialog()
    
  } catch (error) {
    console.error('Erro ao salvar cliente:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Erro ao salvar cliente',
      position: 'top'
    })
  } finally {
    saving.value = false
  }
}

// Função para confirmar exclusão
function confirmDelete(client) {
  clientToDelete.value = client
  showDeleteDialog.value = true
}

// Função para excluir cliente
async function deleteClient() {
  try {
    deleting.value = true
    
    await api.delete(`/customers/${clientToDelete.value.id}`)
    
    $q.notify({
      type: 'positive',
      message: 'Cliente excluído com sucesso',
      position: 'top'
    })

    await loadClients()
    showDeleteDialog.value = false
    clientToDelete.value = null
    
  } catch (error) {
    console.error('Erro ao excluir cliente:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Erro ao excluir cliente',
      position: 'top'
    })
  } finally {
    deleting.value = false
  }
}

// Funções para vinculação de usuários
function openLinkDialog(client) {
  clientToLink.value = client
  linkForm.value = {
    userEmail: '',
    selectedUserId: null
  }
  unlinkedUsers.value = []
  showLinkDialog.value = true
}

function closeLinkDialog() {
  showLinkDialog.value = false
  clientToLink.value = null
  linkForm.value = {
    userEmail: '',
    selectedUserId: null
  }
  unlinkedUsers.value = []
}

async function searchUnlinkedUsers() {
  if (!linkForm.value.userEmail || linkForm.value.userEmail.length < 3) {
    unlinkedUsers.value = []
    return
  }

  try {
    const response = await api.get('/customers/search-unlinked-users', {
      params: { email: linkForm.value.userEmail }
    })
    unlinkedUsers.value = response.data
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    unlinkedUsers.value = []
  }
}

function selectUser(user) {
  linkForm.value.selectedUserId = user.id
}

async function linkUserToClient() {
  if (!linkForm.value.selectedUserId || !clientToLink.value) return

  linking.value = true
  try {
    await api.post('/customers/link-user', {
      customerId: clientToLink.value.id,
      userId: linkForm.value.selectedUserId
    })

    $q.notify({
      type: 'positive',
      message: 'Cliente vinculado ao usuário com sucesso',
      position: 'top'
    })

    await loadClients()
    closeLinkDialog()
    
  } catch (error) {
    console.error('Erro ao vincular usuário:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Erro ao vincular usuário',
      position: 'top'
    })
  } finally {
    linking.value = false
  }
}

function confirmUnlink(client) {
  clientToUnlink.value = client
  showUnlinkDialog.value = true
}

async function unlinkUser() {
  if (!clientToUnlink.value) return

  unlinking.value = true
  try {
    await api.delete(`/customers/${clientToUnlink.value.id}/unlink-user`)

    $q.notify({
      type: 'positive',
      message: 'Cliente desvinculado do usuário com sucesso',
      position: 'top'
    })

    await loadClients()
    showUnlinkDialog.value = false
    clientToUnlink.value = null
    
  } catch (error) {
    console.error('Erro ao desvincular usuário:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Erro ao desvincular usuário',
      position: 'top'
    })
  } finally {
    unlinking.value = false
  }
}

// Carregar dados ao montar o componente
onMounted(() => {
  loadClients()
})
</script>

<style scoped>
.client-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.client-table {
  border-radius: 12px;
}

.client-table .q-table__top {
  padding: 16px;
}

.client-table .q-table thead th {
  background: #f8f9fa;
  font-weight: 600;
  color: #1976d2;
}

.client-table .q-table tbody td {
  padding: 12px 16px;
}

.client-table .q-table tbody tr:hover {
  background: #f5f5f5;
}
</style>
