<template>
  <div class="company-settings">
    <q-form @submit="onSubmit" class="q-gutter-md">
      <div class="row q-mb-lg">
        <div class="col">
          <h5 class="text-h5 q-my-none">Configurações da Empresa</h5>
          <p class="text-subtitle2 text-grey-7">
            Informações básicas da sua barbearia
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

      <!-- Informações Básicas -->
      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">Informações Básicas</div>
          
          <div class="row q-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.name"
                label="Nome da Empresa *"
                :rules="[val => !!val || 'Campo obrigatório']"
                outlined
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.email"
                label="Email de Contato"
                type="email"
                outlined
              />
            </div>
          </div>

          <div class="row q-gutter-md q-mt-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.phone"
                label="Telefone"
                outlined
                mask="(##) #####-####"
                unmasked-value
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.website"
                label="Website"
                outlined
                hint="https://exemplo.com"
              />
            </div>
          </div>

          <div class="row q-gutter-md q-mt-md">
            <div class="col-12">
              <q-input
                v-model="form.address"
                label="Endereço Completo"
                outlined
                type="textarea"
                rows="3"
              />
            </div>
          </div>

          <div class="row q-gutter-md q-mt-md">
            <div class="col-12">
              <q-input
                v-model="form.description"
                label="Descrição da Empresa"
                outlined
                type="textarea"
                rows="4"
                hint="Breve descrição sobre sua barbearia"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Horários de Funcionamento -->
      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">Dias de Funcionamento</div>
          
          <div class="row q-gutter-sm">
            <div class="col-12">
              <q-option-group
                v-model="form.workingDays"
                :options="dayOptions"
                color="primary"
                type="checkbox"
                inline
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Preview das Informações -->
      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">Preview</div>
          
          <div class="company-preview">
            <div class="row q-gutter-md">
              <div class="col">
                <div class="text-h6">{{ form.name || 'Nome da Empresa' }}</div>
                <div v-if="form.description" class="text-body2 text-grey-7 q-mb-md">
                  {{ form.description }}
                </div>
                
                <div class="contact-info">
                  <div v-if="form.phone" class="row items-center q-mb-xs">
                    <q-icon name="phone" class="q-mr-sm" />
                    <span>{{ formatPhone(form.phone) }}</span>
                  </div>
                  
                  <div v-if="form.email" class="row items-center q-mb-xs">
                    <q-icon name="email" class="q-mr-sm" />
                    <span>{{ form.email }}</span>
                  </div>
                  
                  <div v-if="form.website" class="row items-center q-mb-xs">
                    <q-icon name="language" class="q-mr-sm" />
                    <span>{{ form.website }}</span>
                  </div>
                  
                  <div v-if="form.address" class="row items-center q-mb-xs">
                    <q-icon name="location_on" class="q-mr-sm" />
                    <span>{{ form.address }}</span>
                  </div>
                </div>

                <div v-if="form.workingDays.length > 0" class="q-mt-md">
                  <div class="text-subtitle2 q-mb-xs">Funcionamento:</div>
                  <div class="working-days">
                    <q-chip 
                      v-for="day in getWorkingDaysLabels()" 
                      :key="day"
                      color="primary" 
                      text-color="white"
                      size="sm"
                    >
                      {{ day }}
                    </q-chip>
                  </div>
                </div>
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
  name: 'CompanySettings',
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
      name: '',
      address: '',
      phone: '',
      email: '',
      website: '',
      description: '',
      workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    })

    const dayOptions = [
      { label: 'Segunda', value: 'monday' },
      { label: 'Terça', value: 'tuesday' },
      { label: 'Quarta', value: 'wednesday' },
      { label: 'Quinta', value: 'thursday' },
      { label: 'Sexta', value: 'friday' },
      { label: 'Sábado', value: 'saturday' },
      { label: 'Domingo', value: 'sunday' }
    ]

    const dayLabels = {
      monday: 'Seg',
      tuesday: 'Ter',
      wednesday: 'Qua',
      thursday: 'Qui',
      friday: 'Sex',
      saturday: 'Sáb',
      sunday: 'Dom'
    }

    // Watch para atualizar form quando config mudar
    watch(() => props.config, (newConfig) => {
      if (newConfig && Object.keys(newConfig).length > 0) {
        Object.assign(form.value, newConfig)
      }
    }, { immediate: true, deep: true })

    const formatPhone = (phone) => {
      if (!phone) return ''
      const cleaned = phone.replace(/\D/g, '')
      const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/)
      if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`
      }
      return phone
    }

    const getWorkingDaysLabels = () => {
      return form.value.workingDays.map(day => dayLabels[day]).filter(Boolean)
    }

    const onSubmit = () => {
      emit('update', { ...form.value })
    }

    return {
      form,
      dayOptions,
      formatPhone,
      getWorkingDaysLabels,
      onSubmit
    }
  }
})
</script>

<style scoped>
.company-preview {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e9ecef;
}

.contact-info .q-icon {
  color: #666;
  font-size: 18px;
}

.working-days {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
</style>
