<template>
  <q-page class="q-pa-md">
    <!-- Header do Dashboard -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h4 class="q-ma-none">Dashboard</h4>
        <p class="text-grey-7 q-ma-none">Bem-vindo ao sistema da Barbearia</p>
      </div>
      <q-btn 
        color="primary" 
        icon="refresh" 
        :label="$q.screen.gt.xs ? 'Atualizar' : ''"
        @click="refreshData"
        :loading="loading"
        :round="$q.screen.xs"
      />
    </div>

    <!-- Cards de Métricas -->
    <div class="metrics-grid q-mb-lg">
      <q-card class="bg-primary text-white metric-card">
        <q-card-section class="q-pa-md">
          <div class="row items-center no-wrap">
            <div class="col">
              <div class="text-subtitle1 text-weight-medium">Agendamentos Hoje</div>
              <div class="text-h3 text-weight-bold q-mt-xs">{{ metrics.appointmentsToday }}</div>
              <div class="text-caption opacity-70 q-mt-xs">+15% vs ontem</div>
            </div>
            <div class="col-auto q-ml-md">
              <q-icon name="event" size="2.5rem" class="opacity-60" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="bg-secondary text-white metric-card">
        <q-card-section class="q-pa-md">
          <div class="row items-center no-wrap">
            <div class="col">
              <div class="text-subtitle1 text-weight-medium">Barbeiros Cadastrados</div>
              <div class="text-h3 text-weight-bold q-mt-xs">
                <span v-if="loading">...</span>
                <span v-else>{{ metrics.activeBarbers }}</span>
              </div>
              <div class="text-caption opacity-70 q-mt-xs">
                <span v-if="loading">carregando...</span>
                <span v-else>
                  {{ metrics.activeBarbers > 0 ? 'profissionais disponíveis' : 'nenhum cadastrado' }}
                </span>
              </div>
            </div>
            <div class="col-auto q-ml-md">
              <q-icon name="content_cut" size="2.5rem" class="opacity-60" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="bg-info text-white metric-card">
        <q-card-section class="q-pa-md">
          <div class="row items-center no-wrap">
            <div class="col">
              <div class="text-subtitle1 text-weight-medium">Clientes Cadastrados</div>
              <div class="text-h3 text-weight-bold q-mt-xs">
                <span v-if="loading">...</span>
                <span v-else>{{ metrics.totalClients }}</span>
              </div>
              <div class="text-caption opacity-70 q-mt-xs">
                <span v-if="loading">carregando...</span>
                <span v-else>
                  {{ metrics.totalClients > 0 ? 'clientes ativos' : 'nenhum cadastrado' }}
                </span>
              </div>
            </div>
            <div class="col-auto q-ml-md">
              <q-icon name="people" size="2.5rem" class="opacity-60" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="bg-accent text-white metric-card">
        <q-card-section class="q-pa-md">
          <div class="row items-center no-wrap">
            <div class="col">
              <div class="text-subtitle1 text-weight-medium">Serviços Disponíveis</div>
              <div class="text-h3 text-weight-bold q-mt-xs">{{ metrics.totalServices || 0 }}</div>
              <div class="text-caption opacity-70 q-mt-xs">serviços oferecidos</div>
            </div>
            <div class="col-auto q-ml-md">
              <q-icon name="design_services" size="2.5rem" class="opacity-60" />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Gráficos -->
    <div class="charts-grid">
      <!-- Ranking de Clientes -->
      <q-card class="full-height">
        <q-card-section>
          <div class="text-h6 q-mb-md flex items-center">
            <q-icon name="people" class="q-mr-sm" color="primary" />
            Ranking de Clientes
          </div>
          <div class="text-caption text-grey-7 q-mb-md">
            Clientes com mais atendimentos concluídos
          </div>
          
          <PieChart
            :data="customerRankingData"
            :loading="loadingCharts"
            title="Ranking de Clientes"
            color="primary"
            :colors="['#1976D2', '#42A5F5', '#90CAF9', '#BBDEFB', '#E3F2FD', '#FFF3E0', '#FFE0B2', '#FFCC80', '#FFB74D', '#FF9800']"
            empty-state-icon="people_outline"
            empty-state-title="Nenhum dado disponível"
            empty-state-subtitle="Dados aparecerão após atendimentos serem concluídos"
            :tooltip-formatter="customerTooltipFormatter"
          />
        </q-card-section>
      </q-card>

      <!-- Ranking de Serviços -->
      <q-card class="full-height">
        <q-card-section>
          <div class="text-h6 q-mb-md flex items-center">
            <q-icon name="design_services" class="q-mr-sm" color="secondary" />
            Ranking de Serviços
          </div>
          <div class="text-caption text-grey-7 q-mb-md">
            Serviços mais realizados
          </div>
          
          <PieChart
            :data="serviceRankingData"
            :loading="loadingCharts"
            title="Ranking de Serviços"
            color="secondary"
            :colors="['#7B1FA2', '#AB47BC', '#CE93D8', '#E1BEE7', '#F3E5F5', '#FFF8E1', '#FFECB3', '#FFE082', '#FFD54F', '#FFC107']"
            empty-state-icon="design_services"
            empty-state-title="Nenhum dado disponível"
            empty-state-subtitle="Dados aparecerão após atendimentos serem concluídos"
            :tooltip-formatter="serviceTooltipFormatter"
          />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api as axios } from 'src/boot/axios'
import { Notify } from 'quasar'
import PieChart from 'src/components/charts/PieChart.vue'

// Estados reativos
const loading = ref(false)
const loadingCharts = ref(false)

// Métricas do dashboard
const metrics = ref({
  appointmentsToday: 0,
  activeBarbers: 0,
  totalClients: 0,
  totalServices: 0
})

// Dados dos rankings
const customerRankingData = ref([])
const serviceRankingData = ref([])

// Funções de formatação de tooltip
const customerTooltipFormatter = (value, { dataPointIndex }) => {
  const client = customerRankingData.value[dataPointIndex]
  const totalValue = client?.totalValue || 0
  return `${value} atendimento${value !== 1 ? 's' : ''} (R$ ${totalValue.toFixed(2).replace('.', ',')})`
}

const serviceTooltipFormatter = (value, { dataPointIndex }) => {
  const service = serviceRankingData.value[dataPointIndex]
  const totalValue = service?.totalValue || 0
  return `${value} realização${value !== 1 ? 'ões' : ''} (R$ ${totalValue.toFixed(2).replace('.', ',')})`
}

onMounted(() => {
  console.log('Dashboard carregado')
  loadDashboardData()
})

// Função para carregar todos os dados do dashboard
async function loadDashboardData() {
  loading.value = true
  
  try {
    console.log('Carregando dados do dashboard...')
    
    // Carregar métricas básicas
    const response = await axios.get('/dashboard')
    
    // Atualizar métricas com dados da API
    const data = response.data
    metrics.value = {
      appointmentsToday: data.metrics.appointmentsToday,
      activeBarbers: data.metrics.totalBarbers,
      totalClients: data.metrics.totalCustomers,
      totalServices: data.metrics.totalServices || 0
    }
    
    console.log('Dados do dashboard carregados:', data)
    
    // Carregar dados dos gráficos
    await loadChartsData()
    
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error)
    
    // Fallback para dados simulados em caso de erro
    metrics.value = {
      appointmentsToday: 0,
      activeBarbers: 0,
      totalClients: 0,
      totalServices: 0
    }
    
    Notify.create({
      type: 'negative',
      message: 'Erro ao carregar dados do dashboard',
      position: 'bottom-right',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Função para carregar dados dos gráficos
async function loadChartsData() {
  loadingCharts.value = true
  
  try {
    console.log('Carregando dados dos gráficos...')
    
    // Carregar ranking de clientes e serviços em paralelo
    const [customersResponse, servicesResponse] = await Promise.all([
      axios.get('/dashboard/customer-ranking'),
      axios.get('/dashboard/service-ranking')
    ])
    
    console.log('Dados de clientes recebidos:', customersResponse.data)
    console.log('Dados de serviços recebidos:', servicesResponse.data)
    
    customerRankingData.value = customersResponse.data.ranking || []
    serviceRankingData.value = servicesResponse.data.ranking || []
    
    console.log('Dados processados - Clientes:', customerRankingData.value)
    console.log('Dados processados - Serviços:', serviceRankingData.value)
    
  } catch (error) {
    console.error('Erro ao carregar dados dos gráficos:', error)
    customerRankingData.value = []
    serviceRankingData.value = []
    
    Notify.create({
      type: 'negative',
      message: 'Erro ao carregar dados dos gráficos',
      position: 'bottom-right',
      icon: 'error'
    })
  } finally {
    loadingCharts.value = false
  }
}

function refreshData() {
  loadDashboardData()
}
</script>

<style scoped>
.metrics-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(4, 1fr);
}

.charts-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(2, 1fr);
}

.metric-card {
  min-height: 120px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.full-height {
  height: 100%;
}

/* Mobile - 1 coluna */
@media (max-width: 599px) {
  .metrics-grid {
    grid-template-columns: 1fr;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .metric-card .text-h3 {
    font-size: 2rem;
  }
  
  .metric-card .q-icon {
    font-size: 2rem !important;
  }
  
  .metric-card {
    min-height: 100px;
  }
}

/* Tablet - 2 colunas */
@media (min-width: 600px) and (max-width: 959px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .metric-card {
    min-height: 130px;
  }
}

/* Desktop - 4 colunas para métricas, 2 para gráficos */
@media (min-width: 960px) {
  .metrics-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .charts-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
