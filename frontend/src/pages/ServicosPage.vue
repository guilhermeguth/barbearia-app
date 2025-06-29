<template>
  <q-page class="q-pa-lg">
    <!-- Header da página -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h4 class="q-ma-none text-primary text-weight-bold">
          <q-icon name="content_cut" class="q-mr-sm" />
          Gestão de Serviços
        </h4>
        <p class="text-grey-6 q-mb-none">Gerencie os serviços oferecidos pela barbearia</p>
      </div>
      <q-btn
        color="primary"
        icon="add"
        label="Novo Serviço"
        @click="abrirModalServico()"
        unelevated
      />
    </div>

    <!-- Filtro de busca -->
    <div class="q-mb-md">
      <q-input
        v-model="filtro"
        placeholder="Buscar serviço por nome..."
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
      <div v-if="filtro" class="text-caption text-grey-6 q-mt-xs q-ml-sm">
        {{ servicosFiltrados.length }} resultado(s) encontrado(s) para "{{ filtro }}"
      </div>
    </div>

    <!-- Tabela de serviços -->
    <q-card class="service-card">
      <q-card-section class="q-pa-none">
        <q-table
          :rows="servicosFiltrados"
          :columns="columns"
          row-key="id"
          :loading="carregando"
          :pagination="pagination"
          @update:pagination="pagination = $event"
          flat
          class="service-table"
          loading-label="Carregando serviços..."
          no-data-label="Nenhum serviço encontrado"
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
                @click="abrirModalServico(props.row)"
                class="q-mr-xs"
              >
                <q-tooltip>Editar serviço</q-tooltip>
              </q-btn>
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                @click="confirmarExclusao(props.row)"
              >
                <q-tooltip>Excluir serviço</q-tooltip>
              </q-btn>
            </q-td>
          </template>

          <!-- Template para preço -->
          <template #body-cell-price="props">
            <q-td :props="props">
              <span class="text-weight-medium text-positive">
                R$ {{ formatarPreco(props.value) }}
              </span>
            </q-td>
          </template>

          <!-- Template para duração -->
          <template #body-cell-duration="props">
            <q-td :props="props">
              <q-chip
                color="blue-1"
                text-color="blue-8"
                size="sm"
              >
                <q-icon name="schedule" class="q-mr-xs" size="14px" />
                {{ props.value }} min
              </q-chip>
            </q-td>
          </template>

          <!-- Template quando não há dados -->
          <template #no-data>
            <div class="full-width row flex-center text-grey-6 q-gutter-sm q-py-xl">
              <q-icon size="2em" :name="filtro ? 'search_off' : 'content_cut'" />
              <span class="text-h6">
                <span v-if="filtro">
                  Nenhum serviço encontrado para "{{ filtro }}"
                </span>
                <span v-else>
                  Nenhum serviço cadastrado
                </span>
              </span>
            </div>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Modal para adicionar/editar serviço -->
    <q-dialog v-model="modalServico" @hide="fecharModal">
      <q-card style="min-width: 400px">
        <q-card-section class="bg-primary text-white">
          <div class="text-h6">
            <q-icon name="edit" class="q-mr-sm" />
            {{ servicoEdicao.id ? 'Editar Serviço' : 'Novo Serviço' }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-form @submit="salvarServico" class="q-gutter-md">
            <q-input
              v-model="servicoEdicao.name"
              label="Nome do Serviço *"
              outlined
              dense
              :rules="[val => !!val || 'Nome é obrigatório']"
              ref="inputNome"
            />

            <q-input
              v-model="servicoEdicao.price"
              label="Preço (R$) *"
              outlined
              dense
              type="number"
              step="0.01"
              min="0"
              :rules="[
                val => !!val || 'Preço é obrigatório',
                val => val > 0 || 'Preço deve ser maior que zero'
              ]"
            />

            <q-input
              v-model="servicoEdicao.duration"
              label="Duração (minutos) *"
              outlined
              dense
              type="number"
              min="1"
              :rules="[
                val => !!val || 'Duração é obrigatória',
                val => val > 0 || 'Duração deve ser maior que zero'
              ]"
            />

            <q-card-actions align="right" class="q-pa-md">
              <q-btn flat label="Cancelar" @click="fecharModal" />
              <q-btn
                color="primary"
                label="Salvar"
                type="submit"
                :loading="salvando"
                unelevated
              />
            </q-card-actions>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Dialog de confirmação de exclusão -->
    <q-dialog v-model="dialogExclusao" @hide="fecharDialogExclusao">
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="negative" text-color="white" />
          <span class="q-ml-sm">
            Tem certeza que deseja excluir o serviço <strong>{{ servicoParaExcluir?.name }}</strong>?
          </span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" @click="dialogExclusao = false" />
          <q-btn
            color="negative"
            label="Excluir"
            @click="excluirServico"
            :loading="excluindo"
            unelevated
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
/* eslint-disable */
import { ref, computed, onMounted, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { api as axios } from 'boot/axios'

const $q = useQuasar()

// Estado reativo
const servicos = ref([])
const carregando = ref(false)
const filtro = ref('')
const modalServico = ref(false)
const salvando = ref(false)
const dialogExclusao = ref(false)
const excluindo = ref(false)
const servicoParaExcluir = ref(null)
const inputNome = ref(null)

// Serviço em edição
const servicoEdicao = ref({
  id: null,
  name: '',
  price: '',
  duration: ''
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
    name: 'price',
    label: 'Preço',
    field: 'price',
    align: 'left',
    sortable: true,
    style: 'width: 120px'
  },
  {
    name: 'duration',
    label: 'Duração',
    field: 'duration',
    align: 'center',
    sortable: true,
    style: 'width: 120px'
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
const servicosFiltrados = computed(() => {
  if (!servicos.value || !Array.isArray(servicos.value)) return []
  if (!filtro.value) return servicos.value
  
  const termo = filtro.value.toLowerCase()
  return servicos.value.filter(servico =>
    servico.name && servico.name.toLowerCase().includes(termo)
  )
})

const paginationLabel = (firstRowIndex, endRowIndex, totalRowsNumber) => {
  return `${firstRowIndex}-${endRowIndex} de ${totalRowsNumber}`
}

// Métodos
async function carregarServicos() {
  console.log('=== INÍCIO DO CARREGAMENTO ===')
  
  try {
    carregando.value = true
    console.log('Estado carregando definido como true')
    
    // Verificar se há token
    const token = localStorage.getItem('auth_token')
    console.log('Token encontrado:', !!token)
    
    console.log('Fazendo requisição para /services...')
    const response = await axios.get('/services')
    console.log('Resposta recebida:', response.status, response.data?.length, 'itens')
    
    // Garantir que sempre temos um array
    const data = response.data
    if (Array.isArray(data)) {
      servicos.value = data
    } else if (data && Array.isArray(data.data)) {
      servicos.value = data.data
    } else {
      console.warn('Resposta da API não é um array:', data)
      servicos.value = []
    }
    
    console.log('Serviços carregados com sucesso:', servicos.value.length, 'itens')
    
  } catch (error) {
    console.error('=== ERRO NO CARREGAMENTO ===')
    console.error('Erro completo:', error)
    console.error('Status:', error.response?.status)
    console.error('Data:', error.response?.data)
    
    if (error.response?.status === 404) {
      servicos.value = []
    } else {
      servicos.value = []
      $q.notify({
        type: 'negative',
        message: 'Erro ao carregar serviços',
        caption: error.response?.data?.message || 'Verifique sua conexão',
        position: 'bottom-right',
        icon: 'error'
      })
    }
  } finally {
    carregando.value = false
    console.log('=== FIM DO CARREGAMENTO ===')
    console.log('Estado final - carregando:', carregando.value, 'servicos:', servicos.value.length)
  }
}

function abrirModalServico(servico = null) {
  if (servico) {
    servicoEdicao.value = {
      id: servico.id,
      name: servico.name,
      price: servico.price,
      duration: servico.duration
    }
  } else {
    servicoEdicao.value = {
      id: null,
      name: '',
      price: '',
      duration: ''
    }
  }
  modalServico.value = true
  
  // Focar no campo nome após abrir o modal
  nextTick(() => {
    if (inputNome.value) {
      inputNome.value.focus()
    }
  })
}

function fecharModal() {
  modalServico.value = false
  servicoEdicao.value = {
    id: null,
    name: '',
    price: '',
    duration: ''
  }
}

async function salvarServico() {
  try {
    salvando.value = true
    
    const dadosServico = {
      id: servicoEdicao.value.id || undefined,
      name: servicoEdicao.value.name,
      price: parseFloat(servicoEdicao.value.price),
      duration: parseInt(servicoEdicao.value.duration)
    }

    const response = await axios.post('/services', dadosServico)
    
    $q.notify({
      type: 'positive',
      message: response.data.message,
      position: 'top'
    })
    
    fecharModal()
    await carregarServicos()
  } catch (error) {
    console.error('Erro ao salvar serviço:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao salvar serviço',
      caption: error.response?.data?.message || 'Verifique os dados e tente novamente'
    })
  } finally {
    salvando.value = false
  }
}

function confirmarExclusao(servico) {
  servicoParaExcluir.value = servico
  dialogExclusao.value = true
}

async function excluirServico() {
  try {
    excluindo.value = true
    
    const response = await axios.delete(`/services/${servicoParaExcluir.value.id}`)
    
    $q.notify({
      type: 'positive',
      message: response.data.message,
      position: 'top'
    })
    
    dialogExclusao.value = false
    servicoParaExcluir.value = null
    await carregarServicos()
  } catch (error) {
    console.error('Erro ao excluir serviço:', error)
    $q.notify({
      type: 'negative',
      message: 'Erro ao excluir serviço',
      caption: error.response?.data?.message || 'Tente novamente'
    })
  } finally {
    excluindo.value = false
  }
}

function formatarPreco(preco) {
  // Converter para número se vier como string
  const valor = typeof preco === 'string' ? parseFloat(preco) : preco
  return valor.toFixed(2).replace('.', ',')
}

// Lifecycle
onMounted(() => {
  carregarServicos()
})

// Exportar funções para o template (evitar warnings do ESLint)
// servicosFiltrados, abrirModalServico, salvarServico, confirmarExclusao, excluirServico, formatarPreco
</script>

<style scoped>
.service-card {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.service-table {
  .q-table__top {
    padding: 16px;
    background: rgba(25, 118, 210, 0.02);
  }
  
  .q-table__bottom {
    padding: 16px;
    background: rgba(25, 118, 210, 0.02);
  }
}

@media (max-width: 600px) {
  .q-pa-lg {
    padding: 16px;
  }
}
</style>
