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

    <!-- Placeholder para gráficos futuros -->
    <div class="row q-gutter-md">
      <div class="col-12">
        <q-card>
          <q-card-section class="text-center q-pa-xl">
            <q-icon name="bar_chart" size="4rem" color="grey-4" />
            <div class="text-h6 q-mt-md text-grey-6">Gráficos em breve</div>
            <div class="text-grey-7">Os gráficos serão implementados em seguida</div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api as axios } from 'src/boot/axios'
import { Notify } from 'quasar'

// Estados reativos
const loading = ref(false)

// Métricas do dashboard
const metrics = ref({
  appointmentsToday: 0,
  activeBarbers: 0,
  totalClients: 0,
  totalServices: 0
})

onMounted(() => {
  console.log('Dashboard carregado')
  loadDashboardData()
})

// Função para carregar todos os dados do dashboard
async function loadDashboardData() {
  loading.value = true
  
  try {
    console.log('Carregando dados do dashboard...')
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

.metric-card {
  min-height: 120px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

/* Mobile - 1 coluna */
@media (max-width: 599px) {
  .metrics-grid {
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
  
  .metric-card {
    min-height: 130px;
  }
}

/* Desktop - 4 colunas */
@media (min-width: 960px) {
  .metrics-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .metric-card {
    min-height: 120px;
  }
}
</style>
