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
              <div class="text-subtitle1 text-weight-medium">Barbeiros Ativos</div>
              <div class="text-h3 text-weight-bold q-mt-xs">{{ metrics.activeBarbers }}</div>
              <div class="text-caption opacity-70 q-mt-xs">de 6 disponíveis</div>
            </div>
            <div class="col-auto q-ml-md">
              <q-icon name="person" size="2.5rem" class="opacity-60" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="bg-accent text-white metric-card">
        <q-card-section class="q-pa-md">
          <div class="row items-center no-wrap">
            <div class="col">
              <div class="text-subtitle1 text-weight-medium">Receita Hoje</div>
              <div class="text-h3 text-weight-bold q-mt-xs">R$ {{ metrics.revenueToday }}</div>
              <div class="text-caption opacity-70 q-mt-xs">Meta: R$ 1.000</div>
            </div>
            <div class="col-auto q-ml-md">
              <q-icon name="attach_money" size="2.5rem" class="opacity-60" />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <q-card class="bg-positive text-white metric-card">
        <q-card-section class="q-pa-md">
          <div class="row items-center no-wrap">
            <div class="col">
              <div class="text-subtitle1 text-weight-medium">Total Clientes</div>
              <div class="text-h3 text-weight-bold q-mt-xs">{{ metrics.totalClients }}</div>
              <div class="text-caption opacity-70 q-mt-xs">+12 este mês</div>
            </div>
            <div class="col-auto q-ml-md">
              <q-icon name="people" size="2.5rem" class="opacity-60" />
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

// Métricas do dashboard
const metrics = ref({
  appointmentsToday: 12,
  activeBarbers: 5,
  revenueToday: 850,
  totalClients: 248
})

onMounted(() => {
  console.log('Dashboard carregado')
})

function refreshData() {
  // Simular atualização de dados
  metrics.value.appointmentsToday = Math.floor(Math.random() * 20) + 5
  metrics.value.revenueToday = Math.floor(Math.random() * 1000) + 500
  console.log('Dados atualizados')
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
