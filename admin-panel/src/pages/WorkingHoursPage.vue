<template>
  <q-page padding>
    <div class="row q-mb-md">
      <div class="col">
        <h4 class="text-h4 q-my-md">Horários de Trabalho</h4>
        <p class="text-body2 text-grey-7">
          Configure seus dias e horários de trabalho. Você também pode definir intervalos para almoço ou descanso.
        </p>
      </div>
    </div>

    <q-card>
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <q-banner 
              v-if="!hasEnabledDays" 
              class="bg-orange-1 text-orange-8 q-mb-md"
              icon="warning"
            >
              <template #avatar>
                <q-icon name="warning" color="orange" />
              </template>
              Você deve habilitar pelo menos um dia da semana para aceitar agendamentos.
            </q-banner>

            <div class="q-mb-lg">
              <div class="row items-center q-mb-md">
                <div class="col">
                  <div class="text-h6">Configuração dos Dias</div>
                </div>
                <div class="col-auto">
                  <q-btn
                    outline
                    color="primary"
                    label="Aplicar para todos"
                    icon="content_copy"
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
                  <q-card-section>
                    <div class="row items-center q-col-gutter-md">
                      <div class="col-auto">
                        <q-toggle
                          v-model="config.enabled"
                          :label="getDayLabel(day)"
                          color="primary"
                          @update:model-value="validateForm"
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
                            style="min-width: 120px"
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
                            style="min-width: 120px"
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
                            @click="toggleBreakConfig(day)"
                          >
                            <q-tooltip>{{ config.showBreak ? 'Ocultar' : 'Configurar' }} intervalo</q-tooltip>
                          </q-btn>
                        </div>
                        
                        <div v-if="config.showBreak" class="col-auto">
                          <div class="row items-center q-col-gutter-sm">
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
                                style="min-width: 120px"
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
                                style="min-width: 120px"
                                @update:model-value="validateDayHours(day)"
                              />
                            </div>
                          </div>
                        </div>
                      </template>
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
            </div>
          </div>
        </div>
      </q-card-section>
      
      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          flat
          label="Cancelar"
          color="grey-7"
          @click="loadWorkingHours"
        />
        <q-btn
          unelevated
          label="Salvar Horários"
          color="primary"
          icon="save"
          :loading="saving"
          :disable="!isFormValid"
          @click="saveWorkingHours"
        />
      </q-card-actions>
    </q-card>

    <!-- Dialog para configuração em lote -->
    <q-dialog v-model="showBulkConfigDialog">
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

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'
import { useAuthStore } from 'stores/auth'

export default defineComponent({
  name: 'WorkingHoursPage',
  
  setup() {
    const $q = useQuasar()
    const authStore = useAuthStore()
    
    const loading = ref(false)
    const saving = ref(false)
    const showBulkConfigDialog = ref(false)
    
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
    
    const hasEnabledDays = computed(() => {
      return Object.values(workingHours.value).some(day => day.enabled)
    })
    
    const hasAnyEnabledDay = computed(() => {
      return Object.values(workingHours.value).some(day => day.enabled)
    })
    
    const isFormValid = computed(() => {
      return hasEnabledDays.value && Object.keys(dayErrors.value).length === 0
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
    
    const validateForm = () => {
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
      
      validateForm()
      showBulkConfigDialog.value = false
      
      $q.notify({
        type: 'positive',
        message: 'Configuração aplicada com sucesso',
        position: 'top'
      })
    }
    
    const loadWorkingHours = async () => {
      try {
        loading.value = true
        
        // Para este exemplo, vamos assumir que o barbeiro logado quer configurar seus próprios horários
        // Em um sistema real, você pode pegar o ID do barbeiro do token ou permitir selecionar
        const user = authStore.user
        if (!user?.barberId) {
          $q.notify({
            type: 'negative',
            message: 'Usuário não é um barbeiro',
            position: 'top'
          })
          return
        }
        
        const response = await api.get(`/barbers/${user.barberId}/working-hours`)
        
        // Adicionar propriedade showBreak baseada na existência de intervalos
        Object.keys(response.data.workingHours).forEach(day => {
          const config = response.data.workingHours[day]
          config.showBreak = !!(config.breakStart && config.breakEnd)
        })
        
        workingHours.value = response.data.workingHours
        validateForm()
        
      } catch (error) {
        console.error('Erro ao carregar horários:', error)
        $q.notify({
          type: 'negative',
          message: 'Erro ao carregar horários de trabalho',
          position: 'top'
        })
      } finally {
        loading.value = false
      }
    }
    
    const saveWorkingHours = async () => {
      try {
        saving.value = true
        
        const user = authStore.user
        if (!user?.barberId) {
          $q.notify({
            type: 'negative',
            message: 'Usuário não é um barbeiro',
            position: 'top'
          })
          return
        }
        
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
        
        await api.put(`/barbers/${user.barberId}/working-hours`, {
          workingHours: hoursToSave
        })
        
        $q.notify({
          type: 'positive',
          message: 'Horários de trabalho salvos com sucesso',
          position: 'top'
        })
        
      } catch (error) {
        console.error('Erro ao salvar horários:', error)
        $q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Erro ao salvar horários de trabalho',
          position: 'top'
        })
      } finally {
        saving.value = false
      }
    }
    
    onMounted(() => {
      loadWorkingHours()
    })
    
    return {
      loading,
      saving,
      workingHours,
      dayErrors,
      hasEnabledDays,
      hasAnyEnabledDay,
      isFormValid,
      showBulkConfigDialog,
      bulkConfig,
      enabledDayOptions,
      allDayOptions,
      getDayLabel,
      validateDayHours,
      validateForm,
      toggleBreakConfig,
      applyBulkConfig,
      loadWorkingHours,
      saveWorkingHours
    }
  }
})
</script>

<style scoped>
.q-card {
  border-radius: 8px;
}

.day-config-card {
  transition: all 0.3s ease;
}

.day-config-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
</style>
