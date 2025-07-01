<template>
  <q-page class="q-pa-lg">
    <!-- Header da Página -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h4 class="q-ma-none text-primary text-weight-bold">
          <q-icon name="settings" class="q-mr-sm" />
          Configurações do Sistema
        </h4>
        <p class="text-grey-6 q-mb-none">Configure e gerencie as configurações do sistema</p>
      </div>
    </div>

    <!-- Tabs para organizar as configurações -->
    <q-tabs
      v-model="activeTab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
    >
      <q-tab name="general" icon="tune" label="Geral" />
      <q-tab name="email" icon="email" label="Email / SMTP" />
      <q-tab name="security" icon="security" label="Segurança" />
      <q-tab name="notifications" icon="notifications" label="Notificações" />
    </q-tabs>

    <q-separator class="q-mb-lg" />

    <q-tab-panels v-model="activeTab" animated>
      <!-- Painel de Configurações de Email -->
      <q-tab-panel name="email">
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

        <!-- Status da Conexão -->
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
      </q-tab-panel>

      <!-- Painel de Configurações Gerais -->
      <q-tab-panel name="general">
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="row items-center q-mb-md">
              <q-icon name="tune" size="md" color="primary" class="q-mr-md" />
              <div>
                <div class="text-h6">Configurações Gerais</div>
                <div class="text-subtitle2 text-grey-6">
                  Configure opções gerais do sistema
                </div>
              </div>
            </div>

            <div class="text-center text-grey-6 q-pa-xl">
              <q-icon name="construction" size="xl" />
              <div class="text-h6 q-mt-md">Em Desenvolvimento</div>
              <div class="text-subtitle2">
                Esta seção estará disponível em breve com configurações gerais do sistema
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-tab-panel>

      <!-- Painel de Configurações de Segurança -->
      <q-tab-panel name="security">
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="row items-center q-mb-md">
              <q-icon name="security" size="md" color="primary" class="q-mr-md" />
              <div>
                <div class="text-h6">Configurações de Segurança</div>
                <div class="text-subtitle2 text-grey-6">
                  Configure opções de segurança e autenticação
                </div>
              </div>
            </div>

            <div class="text-center text-grey-6 q-pa-xl">
              <q-icon name="construction" size="xl" />
              <div class="text-h6 q-mt-md">Em Desenvolvimento</div>
              <div class="text-subtitle2">
                Esta seção estará disponível em breve com configurações de segurança
              </div>
            </div>
          </q-card-section>
        </q-card>
      </q-tab-panel>

      <!-- Painel de Configurações de Notificações -->
      <q-tab-panel name="notifications">
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="row items-center q-mb-md">
              <q-icon name="notifications" size="md" color="primary" class="q-mr-md" />
              <div>
                <div class="text-h6">Configurações de Notificações</div>
                <div class="text-subtitle2 text-grey-6">
                  Configure quando e como enviar notificações automáticas
                </div>
              </div>
            </div>

            <!-- Status das Notificações -->
            <q-card flat bordered class="q-mb-md">
              <q-card-section>
                <div class="row items-center q-mb-md">
                  <q-icon name="email" size="sm" color="info" class="q-mr-sm" />
                  <div class="text-subtitle1 text-weight-medium">Status das Notificações por Email</div>
                </div>
                
                <div class="row items-center q-gutter-md">
                  <div class="col">
                    <q-item>
                      <q-item-section avatar>
                        <q-avatar 
                          size="32px" 
                          :color="hasPassword && smtpConfig.host ? 'positive' : 'negative'" 
                          text-color="white"
                        >
                          <q-icon 
                            :name="hasPassword && smtpConfig.host ? 'check_circle' : 'error'"
                            size="16px"
                          />
                        </q-avatar>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-medium">Configurações SMTP</q-item-label>
                        <q-item-label caption class="text-grey-6">
                          {{ hasPassword && smtpConfig.host ? 'Configurado' : 'Não configurado' }}
                        </q-item-label>
                      </q-item-section>
                    </q-item>
                  </div>
                  <div class="col">
                    <q-btn
                      color="primary"
                      label="Ir para Email/SMTP"
                      icon="settings"
                      @click="activeTab = 'email'"
                      outline
                      dense
                    />
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <!-- Tipos de Notificações -->
            <q-card flat bordered class="q-mb-md">
              <q-card-section>
                <div class="text-subtitle1 text-weight-medium q-mb-md">
                  <q-icon name="auto_awesome" size="sm" class="q-mr-sm" />
                  Notificações Automáticas Ativas
                </div>
                
                <q-list>
                  <q-item>
                    <q-item-section avatar>
                      <q-avatar size="32px" color="positive" text-color="white">
                        <q-icon name="check_circle" size="16px" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">Confirmação de Agendamento</q-item-label>
                      <q-item-label caption class="text-grey-6">
                        Enviada automaticamente quando um agendamento é criado
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  
                  <q-item>
                    <q-item-section avatar>
                      <q-avatar size="32px" color="positive" text-color="white">
                        <q-icon name="check_circle" size="16px" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">Cancelamento de Agendamento</q-item-label>
                      <q-item-label caption class="text-grey-6">
                        Enviada automaticamente quando um agendamento é cancelado
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  
                  <q-item>
                    <q-item-section avatar>
                      <q-avatar size="32px" color="primary" text-color="white">
                        <q-icon name="schedule" size="16px" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">Lembretes de Agendamento</q-item-label>
                      <q-item-label caption>
                        Lembretes automáticos ativos (09:00 e 18:00) + teste manual disponível
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>

            <!-- Lembretes Automáticos -->
            <q-card flat bordered class="q-mb-md">
              <q-card-section>
                <div class="row items-center q-mb-md">
                  <q-icon name="schedule_send" size="sm" color="info" class="q-mr-sm" />
                  <div class="text-subtitle1 text-weight-medium">Lembretes Automáticos</div>
                </div>
                
                <div class="row q-gutter-md">
                  <!-- Status do Serviço -->
                  <div class="col-12 col-md-6">
                    <q-item class="q-pa-md">
                      <q-item-section avatar>
                        <q-avatar size="40px" :color="reminderStatus.isRunning ? 'positive' : 'grey-4'" text-color="white">
                          <q-icon 
                            :name="reminderStatus.isRunning ? 'schedule' : 'schedule_off'"
                            size="20px"
                          />
                        </q-avatar>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-medium">Status do Serviço</q-item-label>
                        <q-item-label caption class="text-grey-6">
                          {{ reminderStatus.message || 'Aguardando status...' }}
                        </q-item-label>
                        <q-item-label caption v-if="reminderStatus.schedule" class="text-primary">
                          {{ reminderStatus.schedule }}
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-btn
                          size="sm"
                          icon="refresh"
                          color="primary"
                          round
                          flat
                          @click="loadReminderStatus"
                          :loading="loadingReminderStatus"
                        >
                          <q-tooltip>Atualizar status</q-tooltip>
                        </q-btn>
                      </q-item-section>
                    </q-item>
                  </div>

                  <!-- Teste Manual -->
                  <div class="col-12 col-md-6">
                    <q-item class="q-pa-md">
                      <q-item-section avatar>
                        <q-avatar size="40px" color="secondary" text-color="white">
                          <q-icon name="play_arrow" size="20px" />
                        </q-avatar>
                      </q-item-section>
                      <q-item-section>
                        <q-item-label class="text-weight-medium">Teste Manual</q-item-label>
                        <q-item-label caption class="text-grey-6">
                          Enviar lembretes para agendamentos de amanhã
                        </q-item-label>
                      </q-item-section>
                      <q-item-section side>
                        <q-btn
                          color="secondary"
                          label="Testar"
                          icon="send"
                          @click="testReminders"
                          :loading="testingReminders"
                          :disable="!hasPassword || !smtpConfig.host"
                          outline
                          dense
                        >
                          <q-tooltip v-if="!hasPassword || !smtpConfig.host">
                            Configure o SMTP primeiro
                          </q-tooltip>
                        </q-btn>
                      </q-item-section>
                    </q-item>
                  </div>
                </div>

                <!-- Informações dos Horários -->
                <q-separator class="q-my-md" />
                <div class="text-caption text-grey-6">
                  <q-icon name="info" size="xs" class="q-mr-xs" />
                  <strong>Horários automáticos:</strong> 09:00 e 18:00 (lembretes para agendamentos do próximo dia útil)
                </div>
              </q-card-section>
            </q-card>

            <!-- Funcionalidades Futuras -->
            <q-card flat bordered>
              <q-card-section>
                <div class="text-subtitle1 text-weight-medium q-mb-md">
                  <q-icon name="construction" size="sm" class="q-mr-sm" />
                  Funcionalidades em Desenvolvimento
                </div>
                
                <q-list>
                  <q-item>
                    <q-item-section avatar>
                      <q-avatar size="32px" color="grey-4" text-color="grey-8">
                        <q-icon name="person" size="16px" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-grey-6">Notificações para Barbeiros</q-item-label>
                      <q-item-label caption class="text-grey-5">
                        Notificar barbeiros sobre novos agendamentos e alterações
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                  
                  <q-item>
                    <q-item-section avatar>
                      <q-avatar size="32px" color="grey-4" text-color="grey-8">
                        <q-icon name="edit" size="16px" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-grey-6">Templates Personalizáveis</q-item-label>
                      <q-item-label caption class="text-grey-5">
                        Editor de templates de email com personalização
                      </q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section avatar>
                      <q-avatar size="32px" color="grey-4" text-color="grey-8">
                        <q-icon name="schedule" size="16px" />
                      </q-avatar>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-grey-6">Configuração de Horários</q-item-label>
                      <q-item-label caption class="text-grey-5">
                        Personalizar horários de envio dos lembretes automáticos
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card-section>
            </q-card>
          </q-card-section>
        </q-card>
      </q-tab-panel>
    </q-tab-panels>
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
    
    const activeTab = ref('email')
    const loading = ref(false)
    const saving = ref(false)
    const testing = ref(false)
    const sendingTest = ref(false)
    const testingReminders = ref(false)
    const loadingReminderStatus = ref(false)
    const connectionStatus = ref(null)
    const testEmail = ref('')
    const hasPassword = ref(false)
    
    const reminderStatus = ref({
      isRunning: false,
      message: 'Aguardando status...',
      schedule: null
    })
    
    const smtpConfig = ref({
      host: '',
      port: 587,
      user: '',
      pass: '',
      secure: true
    })

    // Carregar status das notificações
    const loadNotificationStatus = async () => {
      try {
        await api.get('/notification-status-public')
      } catch (error) {
        console.error('Erro ao carregar status das notificações:', error)
      }
    }

    // Carregar status dos lembretes
    const loadReminderStatus = async () => {
      loadingReminderStatus.value = true
      try {
        const response = await api.get('/reminder-status-public')
        reminderStatus.value = response.data
        
        // Feedback visual de sucesso
        $q.notify({
          type: response.data.isRunning ? 'positive' : 'info',
          message: response.data.isRunning ? 'Serviço Ativo!' : 'Serviço Inativo',
          caption: response.data.message + (response.data.schedule ? ` - ${response.data.schedule}` : ''),
          icon: response.data.isRunning ? 'check_circle' : 'info',
          timeout: 4000,
          position: 'top-right',
          actions: [
            {
              icon: 'close',
              color: 'white',
              round: true,
              handler: () => {}
            }
          ]
        })
      } catch {
        reminderStatus.value = {
          isRunning: false,
          message: 'Serviço offline ou erro de conexão',
          schedule: null
        }
        
        // Feedback visual de erro
        $q.notify({
          type: 'negative',
          message: 'Erro ao verificar status',
          caption: 'Não foi possível conectar com o servidor',
          icon: 'error',
          timeout: 4000,
          position: 'top-right'
        })
      } finally {
        loadingReminderStatus.value = false
      }
    }

    // Testar lembretes manualmente
    const testReminders = async () => {
      testingReminders.value = true
      
      try {
        const response = await api.post('/test-reminders-public')
        
        $q.notify({
          type: 'positive',
          message: 'Teste de lembretes executado!',
          caption: response.data.message || 'Lembretes enviados para agendamentos de amanhã',
          icon: 'schedule_send',
          timeout: 5000
        })
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Falha no teste de lembretes',
          caption: error.response?.data?.message || 'Verifique as configurações de email',
          timeout: 5000
        })
      } finally {
        testingReminders.value = false
      }
    }

    // Carregar configurações SMTP
    const loadSmtpConfig = async () => {
      loading.value = true
      try {
        const response = await api.get('/settings/smtp')
        const { hasPassword: hasPass, ...config } = response.data
        smtpConfig.value = { ...config }
        hasPassword.value = !!hasPass
      } catch {
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
      loadNotificationStatus()
      loadReminderStatus()
    })

    return {
      activeTab,
      loading,
      saving,
      testing,
      sendingTest,
      testingReminders,
      loadingReminderStatus,
      connectionStatus,
      smtpConfig,
      testEmail,
      hasPassword,
      reminderStatus,
      isConfigValid,
      saveSmtpConfig,
      testConnection,
      sendTestEmail,
      resetConfig,
      loadNotificationStatus,
      loadReminderStatus,
      testReminders
    }
  }
})
</script>

<style scoped>
.q-card {
  border-radius: 12px;
}
</style>
