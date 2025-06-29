<template>
  <q-page class="q-pa-lg">
    <!-- Header da Página -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h4 class="q-ma-none text-primary text-weight-bold">
          <q-icon name="settings" class="q-mr-sm" />
          Configurações do Sistema
        </h4>
        <p class="text-grey-6 q-mb-none">Configure o servidor SMTP para envio de emails</p>
      </div>
    </div>

    <!-- Card de Configurações SMTP -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row items-center q-mb-md">
          <q-icon name="email" size="md" color="primary" class="q-mr-md" />
          <div>
            <div class="text-h6">Configurações de Email (SMTP)</div>
            <div class="text-subtitle2 text-grey-6">
              Configure o servidor de email para envio de notificações
            </div>
          </div>
        </div>

        <q-form @submit="saveSmtpConfig" class="q-gutter-md">
          <div class="row q-gutter-md">
            <div class="col">
              <q-input
                v-model="smtpConfig.host"
                label="Servidor SMTP"
                outlined
                dense
                :loading="loading"
                hint="Ex: smtp.gmail.com"
                :rules="[val => !!val || 'Campo obrigatório']"
              />
            </div>
            <div class="col-3">
              <q-input
                v-model.number="smtpConfig.port"
                label="Porta"
                outlined
                dense
                type="number"
                :loading="loading"
                hint="Ex: 587"
                :rules="[val => !!val || 'Campo obrigatório']"
              />
            </div>
          </div>

          <div class="row q-gutter-md">
            <div class="col">
              <q-input
                v-model="smtpConfig.user"
                label="Usuário/Email"
                outlined
                dense
                :loading="loading"
                hint="Seu email completo"
                :rules="[val => !!val || 'Campo obrigatório']"
              />
            </div>
            <div class="col">
              <q-input
                v-model="smtpConfig.pass"
                :label="hasPassword ? 'Nova Senha (deixe vazio para manter atual)' : 'Senha'"
                outlined
                dense
                type="password"
                :loading="loading"
                :hint="hasPassword ? 'Deixe vazio para manter a senha atual' : 'Senha do email ou senha de app'"
                :rules="hasPassword ? [] : [val => !!val || 'Campo obrigatório']"
              />
              <div v-if="hasPassword" class="text-caption text-positive q-mt-xs">
                <q-icon name="check_circle" size="xs" /> Senha configurada anteriormente
              </div>
            </div>
          </div>

          <div class="row">
            <div class="col">
              <q-toggle
                v-model="smtpConfig.secure"
                label="Usar SSL/TLS"
                color="primary"
                :loading="loading"
              />
              <div class="text-caption text-grey-6 q-mt-xs">
                Recomendado para maior segurança
              </div>
            </div>
          </div>

          <!-- Campo de Email de Teste -->
          <q-separator class="q-my-md" />
          <div class="row items-center q-mb-md">
            <q-icon name="test_tube" size="sm" color="secondary" class="q-mr-sm" />
            <div class="text-subtitle1 text-weight-medium">Teste de Envio</div>
          </div>
          
          <div class="row q-gutter-md">
            <div class="col">
              <q-input
                v-model="testEmail"
                label="Email para teste"
                outlined
                dense
                type="email"
                :loading="loading"
                hint="Digite um email para receber o teste"
                :rules="[
                  val => !!val || 'Campo obrigatório',
                  val => /.+@.+\..+/.test(val) || 'Email inválido'
                ]"
              />
            </div>
            <div class="col-auto">
              <q-btn
                color="info"
                label="Enviar Teste"
                @click="sendTestEmail"
                :loading="sendingTest"
                :disable="!testEmail || !isConfigValid"
                icon="send"
                outline
              />
            </div>
          </div>

          <div class="row q-gutter-sm">
            <q-btn
              type="submit"
              color="primary"
              label="Salvar Configurações"
              :loading="saving"
              icon="save"
            />
            <q-btn
              color="secondary"
              label="Testar Conexão"
              @click="testConnection"
              :loading="testing"
              icon="send"
              outline
            />
            <q-btn
              color="negative"
              label="Resetar"
              @click="resetConfig"
              :loading="loading"
              icon="refresh"
              outline
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>

    <!-- Status da Configuração -->
    <q-card v-if="connectionStatus">
      <q-card-section>
        <div class="row items-center">
          <q-icon 
            :name="connectionStatus.success ? 'check_circle' : 'error'" 
            :color="connectionStatus.success ? 'positive' : 'negative'"
            size="md" 
            class="q-mr-md" 
          />
          <div>
            <div class="text-h6">
              {{ connectionStatus.success ? 'Conexão bem-sucedida!' : 'Falha na conexão' }}
            </div>
            <div class="text-subtitle2">{{ connectionStatus.message }}</div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { api } from 'boot/axios'

export default defineComponent({
  name: 'SettingsPage',
  setup() {
    const $q = useQuasar()
    
    const loading = ref(false)
    const saving = ref(false)
    const testing = ref(false)
    const sendingTest = ref(false)
    const connectionStatus = ref(null)
    const testEmail = ref('')
    const hasPassword = ref(false)
    
    const smtpConfig = ref({
      host: '',
      port: 587,
      user: '',
      pass: '',
      secure: true
    })

    // Carregar configurações SMTP
    const loadSmtpConfig = async () => {
      loading.value = true
      try {
        const response = await api.get('/settings/smtp')
        const { hasPassword: hasPass, ...config } = response.data
        smtpConfig.value = { ...config }
        hasPassword.value = !!hasPass
      } catch (error) {
        console.error('Erro ao carregar configurações SMTP:', error)
        $q.notify({
          type: 'negative',
          message: 'Erro ao carregar configurações',
          caption: 'Usando configurações padrão'
        })
      } finally {
        loading.value = false
      }
    }

    // Salvar configurações SMTP
    const saveSmtpConfig = async () => {
      saving.value = true
      connectionStatus.value = null
      
      try {
        await api.put('/settings/smtp', smtpConfig.value)
        
        $q.notify({
          type: 'positive',
          message: 'Configurações salvas com sucesso!',
          icon: 'save'
        })
      } catch (error) {
        console.error('Erro ao salvar configurações:', error)
        $q.notify({
          type: 'negative',
          message: 'Erro ao salvar configurações',
          caption: error.response?.data?.message || 'Tente novamente'
        })
      } finally {
        saving.value = false
      }
    }

    // Testar conexão SMTP
    const testConnection = async () => {
      testing.value = true
      connectionStatus.value = null
      
      try {
        const response = await api.post('/settings/smtp/test', smtpConfig.value)
        
        connectionStatus.value = {
          success: true,
          message: response.data.message || 'Conexão estabelecida com sucesso!'
        }
        
        $q.notify({
          type: 'positive',
          message: 'Conexão testada com sucesso!',
          icon: 'check_circle'
        })
      } catch (error) {
        console.error('Erro ao testar conexão:', error)
        
        connectionStatus.value = {
          success: false,
          message: error.response?.data?.message || 'Não foi possível conectar ao servidor SMTP'
        }
        
        $q.notify({
          type: 'negative',
          message: 'Falha no teste de conexão',
          caption: error.response?.data?.message || 'Verifique as configurações'
        })
      } finally {
        testing.value = false
      }
    }

    // Enviar email de teste
    const sendTestEmail = async () => {
      if (!testEmail.value) {
        $q.notify({
          type: 'warning',
          message: 'Digite um email para enviar o teste'
        })
        return
      }

      sendingTest.value = true
      
      try {
        await api.post('/settings/smtp/send-test', {
          config: smtpConfig.value,
          testEmail: testEmail.value
        })
        
        $q.notify({
          type: 'positive',
          message: 'Email de teste enviado com sucesso!',
          caption: `Verifique a caixa de entrada de ${testEmail.value}`,
          icon: 'mark_email_read',
          timeout: 5000
        })
      } catch (error) {
        console.error('Erro ao enviar email de teste:', error)
        
        $q.notify({
          type: 'negative',
          message: 'Falha ao enviar email de teste',
          caption: error.response?.data?.message || 'Verifique as configurações SMTP',
          timeout: 5000
        })
      } finally {
        sendingTest.value = false
      }
    }

    // Computed para verificar se config é válida
    const isConfigValid = computed(() => {
      return smtpConfig.value.host && 
             smtpConfig.value.port && 
             smtpConfig.value.user && 
             (smtpConfig.value.pass || hasPassword.value) // Senha atual OU senha já existe
    })

    // Resetar configurações
    const resetConfig = () => {
      $q.dialog({
        title: 'Resetar Configurações',
        message: 'Tem certeza que deseja resetar as configurações de email?',
        cancel: true
      }).onOk(async () => {
        loading.value = true
        connectionStatus.value = null
        
        try {
          await api.post('/settings/initialize')
          await loadSmtpConfig()
          
          $q.notify({
            type: 'positive',
            message: 'Configurações resetadas!',
            icon: 'refresh'
          })
        } catch (error) {
          $q.notify({
            type: 'negative',
            message: 'Erro ao resetar configurações',
            caption: error.response?.data?.message
          })
        } finally {
          loading.value = false
        }
      })
    }

    onMounted(() => {
      loadSmtpConfig()
    })

    return {
      loading,
      saving,
      testing,
      sendingTest,
      connectionStatus,
      smtpConfig,
      testEmail,
      hasPassword,
      isConfigValid,
      saveSmtpConfig,
      testConnection,
      sendTestEmail,
      resetConfig
    }
  }
})
</script>

<style scoped>
.q-card {
  border-radius: 12px;
}
</style>
