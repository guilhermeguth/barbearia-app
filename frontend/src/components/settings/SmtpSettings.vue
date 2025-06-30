<template>
  <div class="smtp-settings">
    <q-form @submit="onSubmit" class="q-gutter-md">
      <div class="row q-mb-lg">
        <div class="col">
          <h5 class="text-h5 q-my-none">Configurações de Email</h5>
          <p class="text-subtitle2 text-grey-7">
            Configure o servidor SMTP para envio de emails
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

      <!-- Configurações do Servidor -->
      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">Servidor SMTP</div>
          
          <div class="row q-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.host"
                label="Servidor SMTP *"
                :rules="[val => !!val || 'Campo obrigatório']"
                outlined
                hint="Ex: smtp.gmail.com"
              />
            </div>
            
            <div class="col-12 col-md-3">
              <q-input
                v-model.number="form.port"
                label="Porta *"
                type="number"
                :rules="[val => val > 0 || 'Porta inválida']"
                outlined
                hint="Ex: 587, 465, 25"
              />
            </div>
            
            <div class="col-12 col-md-3">
              <q-toggle
                v-model="form.secure"
                label="SSL/TLS"
                color="primary"
              />
              <div class="text-caption text-grey-6">
                Ative para porta 465 (SSL) ou 587 (TLS)
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Autenticação -->
      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">Autenticação</div>
          
          <div class="row q-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.user"
                label="Usuário/Email *"
                :rules="[val => !!val || 'Campo obrigatório']"
                outlined
                hint="Seu email ou nome de usuário"
              />
            </div>
            
            <div class="col-12 col-md-6">
              <q-input
                v-model="form.pass"
                :label="passwordLabel"
                :type="showPassword ? 'text' : 'password'"
                outlined
                :hint="passwordHint"
              >
                <template v-slot:append>
                  <q-icon
                    :name="showPassword ? 'visibility_off' : 'visibility'"
                    class="cursor-pointer"
                    @click="showPassword = !showPassword"
                  />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Configurações Rápidas -->
      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">Configurações Rápidas</div>
          <p class="text-caption text-grey-6 q-mb-md">
            Selecione um provedor popular para preencher automaticamente
          </p>
          
          <div class="row q-gutter-md">
            <div class="col-12">
              <div class="provider-buttons">
                <q-btn
                  v-for="provider in providers"
                  :key="provider.name"
                  :label="provider.name"
                  :icon="provider.icon"
                  outline
                  color="primary"
                  class="q-mr-sm q-mb-sm"
                  @click="applyProvider(provider)"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Teste de Conexão -->
      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">Teste de Conexão</div>
          
          <div class="row q-gutter-md items-end">
            <div class="col-12 col-md-8">
              <q-input
                v-model="testEmail"
                label="Email de Teste"
                type="email"
                outlined
                hint="Email para onde será enviado o teste"
              />
            </div>
            
            <div class="col-12 col-md-4">
              <q-btn
                label="Testar Conexão"
                icon="send"
                color="secondary"
                :loading="testing"
                :disable="!testEmail || !form.host || !form.user"
                @click="testConnection"
                class="full-width"
              />
            </div>
          </div>

          <div v-if="testResult" class="q-mt-md">
            <q-banner 
              :class="testResult.success ? 'bg-positive' : 'bg-negative'"
              text-color="white"
              :icon="testResult.success ? 'check_circle' : 'error'"
            >
              {{ testResult.message }}
            </q-banner>
          </div>
        </q-card-section>
      </q-card>

      <!-- Preview das Configurações -->
      <q-card>
        <q-card-section>
          <div class="text-h6 q-mb-md">Resumo das Configurações</div>
          
          <div class="config-summary">
            <div class="summary-item">
              <q-icon name="dns" class="summary-icon" />
              <div>
                <div class="summary-label">Servidor</div>
                <div class="summary-value">{{ form.host || '-' }}:{{ form.port || '-' }}</div>
              </div>
            </div>

            <div class="summary-item">
              <q-icon name="security" class="summary-icon" />
              <div>
                <div class="summary-label">Segurança</div>
                <div class="summary-value">{{ form.secure ? 'SSL/TLS Ativo' : 'Sem Criptografia' }}</div>
              </div>
            </div>

            <div class="summary-item">
              <q-icon name="account_circle" class="summary-icon" />
              <div>
                <div class="summary-label">Usuário</div>
                <div class="summary-value">{{ form.user || '-' }}</div>
              </div>
            </div>

            <div class="summary-item">
              <q-icon name="vpn_key" class="summary-icon" />
              <div>
                <div class="summary-label">Senha</div>
                <div class="summary-value">{{ form.pass ? '••••••••' : 'Não configurada' }}</div>
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
import { defineComponent, ref, watch, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

export default defineComponent({
  name: 'SmtpSettings',
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
    const $q = useQuasar()
    
    const form = ref({
      host: '',
      port: 587,
      user: '',
      pass: '',
      secure: false
    })

    const showPassword = ref(false)
    const testing = ref(false)
    const testEmail = ref('')
    const testResult = ref(null)

    const providers = [
      {
        name: 'Gmail',
        icon: 'mail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: true
      },
      {
        name: 'Outlook',
        icon: 'mail',
        host: 'smtp.live.com',
        port: 587,
        secure: true
      },
      {
        name: 'Yahoo',
        icon: 'mail',
        host: 'smtp.mail.yahoo.com',
        port: 587,
        secure: true
      },
      {
        name: 'Hotmail',
        icon: 'mail',
        host: 'smtp.live.com',
        port: 587,
        secure: true
      }
    ]

    const passwordLabel = computed(() => {
      return form.value.pass && form.value.pass.includes('••') 
        ? 'Senha (deixe em branco para manter atual)' 
        : 'Senha *'
    })

    const passwordHint = computed(() => {
      if (form.value.host?.includes('gmail')) {
        return 'Use uma senha de app do Gmail'
      }
      return 'Sua senha de email ou senha de app'
    })

    // Watch para atualizar form quando config mudar
    watch(() => props.config, (newConfig) => {
      if (newConfig && Object.keys(newConfig).length > 0) {
        Object.assign(form.value, newConfig)
      }
    }, { immediate: true, deep: true })

    const applyProvider = (provider) => {
      form.value.host = provider.host
      form.value.port = provider.port
      form.value.secure = provider.secure
      
      $q.notify({
        type: 'info',
        message: `Configurações do ${provider.name} aplicadas`,
        caption: 'Não esqueça de configurar usuário e senha'
      })
    }

    const testConnection = async () => {
      testing.value = true
      testResult.value = null
      
      try {
        // Simular teste de conexão
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Em um cenário real, você faria uma chamada para o backend
        await api.post('/settings/smtp/test', {
          ...form.value,
          testEmail: testEmail.value
        })
        
        testResult.value = {
          success: true,
          message: `Email de teste enviado com sucesso para ${testEmail.value}`
        }
      } catch (error) {
        testResult.value = {
          success: false,
          message: error.response?.data?.message || 'Falha na conexão SMTP'
        }
      } finally {
        testing.value = false
      }
    }

    const onSubmit = () => {
      const submitData = { ...form.value }
      
      // Se a senha contém ••••••••, não enviar (manter atual)
      if (submitData.pass && submitData.pass.includes('••')) {
        delete submitData.pass
      }
      
      emit('update', submitData)
    }

    return {
      form,
      showPassword,
      testing,
      testEmail,
      testResult,
      providers,
      passwordLabel,
      passwordHint,
      applyProvider,
      testConnection,
      onSubmit
    }
  }
})
</script>

<style scoped>
.provider-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.config-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.summary-icon {
  color: #1976d2;
  font-size: 24px;
}

.summary-label {
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  font-weight: 500;
  color: #333;
}
</style>
