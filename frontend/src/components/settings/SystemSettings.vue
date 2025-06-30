<template>
  <div class="system-settings">
    <q-form @submit="onSubmit" class="q-gutter-md">
      <div class="row q-mb-lg">
        <div class="col">
          <h5 class="text-h5 q-my-none">Configurações do Sistema</h5>
          <p class="text-subtitle2 text-grey-7">
            Configurações gerais de funcionamento do sistema
          </p>
        </div>
        <div class="col-auto">
          <q-btn 
            flat 
            round 
            icon="refresh" 
            color="grey-7"
            @click="$emit('reset')"
            :disable="loading"
          >
            <q-tooltip>Resetar para valores padrão</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Agendamentos -->
      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">Configurações de Agendamento</div>
          
          <div class="row q-gutter-md">
            <div class="col-12 col-md-4">
              <q-input
                v-model.number="form.appointmentDuration"
                label="Duração Padrão (minutos) *"
                type="number"
                :rules="[val => val > 0 || 'Deve ser maior que 0']"
                outlined
                min="15"
                max="480"
                step="15"
              />
            </div>
            
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.businessHoursStart"
                label="Horário de Abertura *"
                outlined
                mask="##:##"
                :rules="[val => !!val || 'Campo obrigatório']"
              />
            </div>
            
            <div class="col-12 col-md-4">
              <q-input
                v-model="form.businessHoursEnd"
                label="Horário de Fechamento *"
                outlined
                mask="##:##"
                :rules="[val => !!val || 'Campo obrigatório']"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Localização e Idioma -->
      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">Localização e Idioma</div>
          
          <div class="row q-gutter-md">
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.timeZone"
                label="Fuso Horário"
                :options="timezoneOptions"
                outlined
                emit-value
                map-options
              />
            </div>
            
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.language"
                label="Idioma do Sistema"
                :options="languageOptions"
                outlined
                emit-value
                map-options
              />
            </div>
            
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.dateFormat"
                label="Formato de Data"
                :options="dateFormatOptions"
                outlined
                emit-value
                map-options
              />
            </div>
          </div>

          <div class="row q-gutter-md q-mt-md">
            <div class="col-12 col-md-4">
              <q-select
                v-model="form.currency"
                label="Moeda"
                :options="currencyOptions"
                outlined
                emit-value
                map-options
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Preview das Configurações -->
      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">Preview das Configurações</div>
          
          <div class="preview-grid">
            <div class="preview-item">
              <q-icon name="schedule" class="preview-icon" />
              <div>
                <div class="preview-label">Duração dos Agendamentos</div>
                <div class="preview-value">{{ form.appointmentDuration }} minutos</div>
              </div>
            </div>

            <div class="preview-item">
              <q-icon name="business_center" class="preview-icon" />
              <div>
                <div class="preview-label">Horário de Funcionamento</div>
                <div class="preview-value">{{ form.businessHoursStart }} às {{ form.businessHoursEnd }}</div>
              </div>
            </div>

            <div class="preview-item">
              <q-icon name="public" class="preview-icon" />
              <div>
                <div class="preview-label">Fuso Horário</div>
                <div class="preview-value">{{ getTimezoneLabel() }}</div>
              </div>
            </div>

            <div class="preview-item">
              <q-icon name="language" class="preview-icon" />
              <div>
                <div class="preview-label">Idioma</div>
                <div class="preview-value">{{ getLanguageLabel() }}</div>
              </div>
            </div>

            <div class="preview-item">
              <q-icon name="today" class="preview-icon" />
              <div>
                <div class="preview-label">Data de Exemplo</div>
                <div class="preview-value">{{ formatExampleDate() }}</div>
              </div>
            </div>

            <div class="preview-item">
              <q-icon name="attach_money" class="preview-icon" />
              <div>
                <div class="preview-label">Moeda</div>
                <div class="preview-value">{{ getCurrencyLabel() }} ({{ formatExamplePrice() }})</div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Botões de ação -->
      <div class="row q-gutter-md q-mt-lg">
        <div class="col">
          <q-btn
            type="submit"
            label="Salvar Configurações"
            color="primary"
            icon="save"
            :loading="loading"
            class="full-width"
          />
        </div>
      </div>
    </q-form>
  </div>
</template>

<script>
import { defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'SystemSettings',
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update', 'reset'],
  setup(props, { emit }) {
    const form = ref({
      appointmentDuration: 60,
      businessHoursStart: '08:00',
      businessHoursEnd: '18:00',
      timeZone: 'America/Sao_Paulo',
      language: 'pt-BR',
      dateFormat: 'DD/MM/YYYY',
      currency: 'BRL'
    })

    const timezoneOptions = [
      { label: 'São Paulo (GMT-3)', value: 'America/Sao_Paulo' },
      { label: 'Rio de Janeiro (GMT-3)', value: 'America/Sao_Paulo' },
      { label: 'Brasília (GMT-3)', value: 'America/Sao_Paulo' },
      { label: 'Manaus (GMT-4)', value: 'America/Manaus' },
      { label: 'Acre (GMT-5)', value: 'America/Acre' }
    ]

    const languageOptions = [
      { label: 'Português (Brasil)', value: 'pt-BR' },
      { label: 'English (US)', value: 'en-US' },
      { label: 'Español', value: 'es-ES' }
    ]

    const dateFormatOptions = [
      { label: 'DD/MM/YYYY (31/12/2023)', value: 'DD/MM/YYYY' },
      { label: 'MM/DD/YYYY (12/31/2023)', value: 'MM/DD/YYYY' },
      { label: 'YYYY-MM-DD (2023-12-31)', value: 'YYYY-MM-DD' },
      { label: 'DD-MM-YYYY (31-12-2023)', value: 'DD-MM-YYYY' }
    ]

    const currencyOptions = [
      { label: 'Real Brasileiro (R$)', value: 'BRL' },
      { label: 'Dólar Americano ($)', value: 'USD' },
      { label: 'Euro (€)', value: 'EUR' }
    ]

    // Watch para atualizar form quando config mudar
    watch(() => props.config, (newConfig) => {
      if (newConfig && Object.keys(newConfig).length > 0) {
        Object.assign(form.value, newConfig)
      }
    }, { immediate: true, deep: true })

    const getTimezoneLabel = () => {
      const option = timezoneOptions.find(opt => opt.value === form.value.timeZone)
      return option ? option.label : form.value.timeZone
    }

    const getLanguageLabel = () => {
      const option = languageOptions.find(opt => opt.value === form.value.language)
      return option ? option.label : form.value.language
    }

    const getCurrencyLabel = () => {
      const option = currencyOptions.find(opt => opt.value === form.value.currency)
      return option ? option.label : form.value.currency
    }

    const formatExampleDate = () => {
      const now = new Date()
      const day = String(now.getDate()).padStart(2, '0')
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const year = now.getFullYear()

      switch (form.value.dateFormat) {
        case 'MM/DD/YYYY':
          return `${month}/${day}/${year}`
        case 'YYYY-MM-DD':
          return `${year}-${month}-${day}`
        case 'DD-MM-YYYY':
          return `${day}-${month}-${year}`
        default:
          return `${day}/${month}/${year}`
      }
    }

    const formatExamplePrice = () => {
      const price = 50
      switch (form.value.currency) {
        case 'USD':
          return `$${price}.00`
        case 'EUR':
          return `€${price}.00`
        default:
          return `R$ ${price},00`
      }
    }

    const onSubmit = () => {
      emit('update', { ...form.value })
    }

    return {
      form,
      timezoneOptions,
      languageOptions,
      dateFormatOptions,
      currencyOptions,
      getTimezoneLabel,
      getLanguageLabel,
      getCurrencyLabel,
      formatExampleDate,
      formatExamplePrice,
      onSubmit
    }
  }
})
</script>

<style scoped>
.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.preview-icon {
  color: #1976d2;
  font-size: 24px;
}

.preview-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-value {
  font-weight: 500;
  color: #333;
}
</style>
