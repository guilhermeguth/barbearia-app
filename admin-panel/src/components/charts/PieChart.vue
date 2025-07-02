<template>
  <div class="pie-chart-container">
    <!-- Loading -->
    <div v-if="loading" class="flex flex-center q-pa-xl">
      <q-spinner-pie size="2rem" :color="color" />
      <span class="q-ml-sm">Carregando gráfico...</span>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="data.length === 0" class="text-center q-pa-xl">
      <q-icon :name="emptyStateIcon" size="3rem" color="grey-4" />
      <div class="text-grey-6 q-mt-md">{{ emptyStateTitle }}</div>
      <div class="text-caption text-grey-7">{{ emptyStateSubtitle }}</div>
    </div>
    
    <!-- Chart -->
    <div v-else>
      <apex-chart
        type="pie"
        height="350"
        :options="chartOptions"
        :series="chartSeries"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

// Registrar componente ApexCharts
import { getCurrentInstance } from 'vue'
const app = getCurrentInstance().appContext.app
app.component('apex-chart', VueApexCharts)

// Props
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'primary'
  },
  colors: {
    type: Array,
    default: () => ['#1976D2', '#42A5F5', '#90CAF9', '#BBDEFB', '#E3F2FD', '#FFF3E0', '#FFE0B2', '#FFCC80', '#FFB74D', '#FF9800']
  },
  emptyStateIcon: {
    type: String,
    default: 'pie_chart'
  },
  emptyStateTitle: {
    type: String,
    default: 'Nenhum dado disponível'
  },
  emptyStateSubtitle: {
    type: String,
    default: 'Dados aparecerão quando houver informações'
  },
  tooltipFormatter: {
    type: Function,
    default: null
  }
})

// Computed
const chartSeries = computed(() => {
  return props.data.map(item => item.value)
})

const chartOptions = computed(() => ({
  chart: {
    type: 'pie',
    height: 300
  },
  labels: props.data.map(item => item.label),
  colors: props.colors,
  legend: {
    position: 'right',
    offsetY: 0,
    fontSize: '14px',
    markers: {
      width: 12,
      height: 12,
      offsetX: -8,
      offsetY: 0
    },
    itemMargin: {
      horizontal: 12,
      vertical: 6
    },
    formatter: function(seriesName) {
      return '<span style="margin-left: 8px;">' + seriesName + '</span>';
    }
  },
  responsive: [{
    breakpoint: 480,
    options: {
      legend: {
        position: 'bottom'
      }
    }
  }],
  tooltip: {
    y: {
      formatter: props.tooltipFormatter || function (value) {
        return value + ' registros'
      }
    }
  }
}))
</script>

<style scoped>
.pie-chart-container {
  width: 100%;
  height: 100%;
}
</style>
