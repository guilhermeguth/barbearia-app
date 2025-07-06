<template>
  <q-page class="q-pa-md">
    <!-- Header da página -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <h4 class="q-ma-none text-primary text-weight-bold">
          <q-icon name="person" class="q-mr-sm" />
          Meu Perfil
        </h4>
        <p class="text-grey-6 q-mb-none">Gerencie suas informações pessoais</p>
      </div>
      <q-btn
        icon="home"
        label="Voltar"
        color="primary"
        unelevated
        class="q-ml-sm"
        @click="$router.push('/')"
      />
    </div>
    
    <!-- Formulário do Perfil -->
    <div class="row justify-center">
      <div class="col-12" style="max-width: 650px;">
        <q-form class="q-gutter-md" @submit="onSubmit">
      <!-- Informações Pessoais -->
      <q-card>
        <q-card-section>
          <div class="row justify-center">
            <div class="col-12" style="max-width: 600px;">
              <div class="text-center q-mb-lg">
                <div class="text-h6 text-weight-medium q-mb-md text-center">
                  <q-icon name="person_outline" class="q-mr-sm" />
                  Informações Pessoais
                </div>
                
                <q-avatar size="100px" class="q-mb-md profile-avatar" @click="$refs.fileInput.click()">
                  <template v-if="tempPhotoPreview">
                    <img 
                      :src="tempPhotoPreview"
                      alt="Pré-visualização"
                      class="user-avatar-img"
                    />
                  </template>
                  <template v-else-if="user && (user.photo || user.photoUrl) && !uploadingPhoto">
                    <img 
                      :key="photoTimestamp" 
                      :src="getPhotoUrl(user.photo || user.photoUrl)"
                      alt="Avatar"
                      class="user-avatar-img"
                      @error="handleImageError"
                      @load="handleImageLoad"
                    />
                  </template>
                  <template v-else-if="!uploadingPhoto">
                    <q-icon 
                      name="person" 
                      size="50px" 
                      color="grey-6"
                    />
                  </template>
                  <q-spinner-dots
                    v-if="uploadingPhoto"
                    color="primary"
                    size="50px"
                    class="absolute-center avatar-spinner"
                  />
                  <div class="avatar-overlay">
                    <q-icon name="camera_alt" size="24px" color="white" />
                  </div>
                </q-avatar>
                
                <div class="q-mt-sm">
                  <q-btn
                    flat
                    icon="camera_alt"
                    :label="uploadingPhoto ? 'Enviando...' : 'Alterar foto'"
                    color="primary"
                    size="sm"
                    class="q-mb-xs"
                    :disable="uploadingPhoto"
                    @click="$refs.fileInput.click()"
                  />
                  <div class="text-caption text-grey-6">
                    JPG, PNG ou GIF até 5MB
                  </div>
                </div>
                
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  style="display: none"
                  @change="handlePhotoChange"
                />
                
                <q-separator class="q-my-md" />
              </div>
              
              <div class="row q-gutter-md justify-center">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.name"
                    label="Nome completo *"
                    outlined
                    dense
                    :rules="[val => !!val || 'Nome é obrigatório']"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.email"
                    label="E-mail"
                    type="email"
                    outlined
                    dense
                    readonly
                    :rules="[val => !!val || 'E-mail é obrigatório']"
                  >
                    <template #append>
                      <q-icon name="lock" color="grey-5">
                        <q-tooltip>E-mail não pode ser alterado</q-tooltip>
                      </q-icon>
                    </template>
                  </q-input>
                </div>

                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.phone"
                    label="Telefone"
                    mask="(##) #####-####"
                    outlined
                    dense
                    hint="Formato: (11) 99999-9999"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Alterar Senha -->
      <q-card class="q-mt-md">
        <q-card-section>
          <div class="row justify-center">
            <div class="col-12" style="max-width: 600px;">
              <div class="text-h6 text-weight-medium q-mb-md text-center">
                <q-icon name="lock_outline" class="q-mr-sm" />
                Alterar Senha
              </div>
              
              <div class="row q-gutter-md justify-center">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.currentPassword"
                    label="Senha atual"
                    type="password"
                    outlined
                    dense
                    autocomplete="current-password"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.newPassword"
                    label="Nova senha"
                    type="password"
                    outlined
                    dense
                    autocomplete="new-password"
                    :rules="passwordRules"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.confirmPassword"
                    label="Confirmar nova senha"
                    type="password"
                    outlined
                    dense
                    autocomplete="new-password"
                    :rules="confirmPasswordRules"
                  />
                </div>

                <div class="col-12 col-md-6">
                  <div class="text-caption text-grey-6 q-pt-md">
                    <q-icon name="info" size="14px" class="q-mr-xs" />
                    Deixe em branco se não deseja alterar a senha
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Botões de Ação -->
      <q-card class="q-mt-md actions-card">
        <q-card-section>
          <div class="row justify-center">
            <div class="col-12" style="max-width: 600px;">
              <!-- Botões principais -->
              <div class="row q-gutter-sm justify-center">
                <q-btn
                  type="submit"
                  label="Salvar alterações"
                  color="primary"
                  unelevated
                  :loading="saving"
                  icon="save"
                  class="action-btn"
                />
                
                <q-btn
                  label="Cancelar"
                  color="grey-7"
                  flat
                  :disable="saving"
                  icon="cancel"
                  class="action-btn"
                  @click="resetForm"
                />
              </div>
              
              <!-- Separador -->
              <q-separator class="q-my-lg" />
              
              <!-- Área de excluir conta -->
              <div class="row justify-center q-mt-md">
                <div class="col-12 text-center">
                  <p class="text-grey-8 q-mb-sm">Deseja encerrar sua conta?</p>
                  <q-btn
                    flat
                    color="red-7"
                    label="Excluir minha conta"
                    icon="delete_forever"
                    size="sm"
                    class="danger-btn"
                    @click="showDeleteDialog = true"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
        </q-form>
      </div>
    </div>
    
    <!-- Delete Account Confirmation -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card style="min-width: 350px" class="delete-dialog">
        <q-card-section class="bg-red-1">
          <div class="text-h6 text-red-9">
            <q-icon name="warning" class="q-mr-sm" />
            Excluir Conta
          </div>
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="text-body1 q-mb-md">
            Tem certeza que deseja excluir sua conta?
          </div>
          
          <div class="text-body2 text-red-9 q-pa-sm bg-red-1 rounded-borders">
            <q-icon name="error_outline" class="q-mr-xs" />
            Esta ação é irreversível e todos os seus dados serão perdidos.
          </div>
          
          <q-input
            v-model="deleteConfirmation"
            label="Digite 'EXCLUIR' para confirmar"
            outlined
            dense
            class="q-mt-lg"
            color="red-9"
            bg-color="red-1"
            :rules="[val => val === 'EXCLUIR' || 'Digite exatamente EXCLUIR para continuar']"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn 
            v-close-popup
            flat 
            label="Cancelar" 
            color="grey-8" 
            icon="close"
          />
          <q-btn 
            unelevated 
            label="Excluir conta" 
            color="red-9" 
            :disable="deleteConfirmation !== 'EXCLUIR'"
            :loading="deleting"
            icon="delete_forever"
            class="delete-btn"
            @click="deleteAccount"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { api } from 'src/boot/axios'

export default defineComponent({
  name: 'ProfilePage',

  setup() {
    const router = useRouter()
    const $q = useQuasar()
    const authStore = useAuthStore()
    
    const saving = ref(false)
    const deleting = ref(false)
    const showDeleteDialog = ref(false)
    const deleteConfirmation = ref('')
    const uploadingPhoto = ref(false)
    const photoTimestamp = ref(new Date().getTime())
    const photoLoaded = ref(false)
    const tempPhotoFile = ref(null) // Arquivo de foto temporário
    const tempPhotoPreview = ref(null) // URL de pré-visualização da foto
    
    const user = computed(() => authStore.user)
    
    const form = reactive({
      name: '',
      email: '',
      phone: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    const passwordRules = [
      val => !val || val.length >= 6 || 'Senha deve ter pelo menos 6 caracteres'
    ]

    const confirmPasswordRules = [
      val => !form.newPassword || val === form.newPassword || 'Senhas não conferem'
    ]

    const getPhotoUrl = (photo) => {
      console.log('getPhotoUrl chamada com:', photo)
      
      if (!photo) {
        console.log('Nenhuma foto fornecida')
        return null
      }
      
      if (photo.startsWith('http')) {
        // Adicionar timestamp mesmo para URLs completas para evitar cache
        const url = `${photo}${photo.includes('?') ? '&' : '?'}t=${photoTimestamp.value}`
        console.log('URL completa com timestamp:', url)
        return url
      }
      
      // Obter a URL base da API
      const baseURL = api.defaults.baseURL || 'http://localhost:3001'
      
      // Retornar o caminho para as imagens com timestamp para forçar recarregamento
      const url = `${baseURL}/uploads/users/${photo}?t=${photoTimestamp.value}`
      console.log('URL construída para a foto:', url)
      return url
    }

    const loadUserData = () => {
      if (user.value) {
        form.name = user.value.name || ''
        form.email = user.value.email || ''
        form.phone = user.value.phone || ''
      }
    }

    const resetForm = () => {
      loadUserData()
      form.currentPassword = ''
      form.newPassword = ''
      form.confirmPassword = ''
    }

    const handlePhotoChange = (event) => {
      const file = event.target.files[0]
      if (!file) return

      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        $q.notify({
          type: 'negative',
          message: 'Apenas arquivos de imagem são permitidos',
          position: 'bottom'
        })
        return
      }

      // Validar tamanho (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        $q.notify({
          type: 'negative',
          message: 'Arquivo muito grande. Máximo 5MB.',
          position: 'bottom'
        })
        return
      }

      // Armazenar o arquivo temporariamente
      tempPhotoFile.value = file

      // Criar URL de pré-visualização
      if (tempPhotoPreview.value) {
        URL.revokeObjectURL(tempPhotoPreview.value)
      }
      tempPhotoPreview.value = URL.createObjectURL(file)
      
      // Notificar o usuário
      $q.notify({
        type: 'info',
        message: 'Foto selecionada. Clique em "Salvar alterações" para confirmar',
        position: 'bottom',
        timeout: 3000
      })
    }

    const onSubmit = async () => {
      try {
        saving.value = true

        const updateData = {
          name: form.name,
          phone: form.phone
        }

        // Adicionar dados de senha se fornecidos
        if (form.newPassword) {
          if (!form.currentPassword) {
            $q.notify({
              type: 'negative',
              message: 'Senha atual é obrigatória para alterar a senha',
              position: 'bottom'
            })
            saving.value = false
            return
          }
          
          updateData.currentPassword = form.currentPassword
          updateData.newPassword = form.newPassword
        }

        // Primeiro, atualizar os dados básicos do perfil
        await api.put('/client/profile', updateData)
        console.log('Dados básicos do perfil atualizados')

        // Variável para controlar se houve upload de foto
        let photoUploaded = false

        // Se houver uma foto temporária, enviá-la
        if (tempPhotoFile.value) {
          try {
            uploadingPhoto.value = true
            
            const formData = new FormData()
            formData.append('photo', tempPhotoFile.value)

            const photoResponse = await api.post('/client/profile/photo', formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            })
            
            // Log da resposta do servidor que contém o nome do arquivo da foto
            console.log('Foto atualizada com sucesso:', photoResponse.data)

            // Salvar a foto atualizada no user atual (importante para manter a consistência)
            if (photoResponse.data && photoResponse.data.photo && user.value) {
              // No frontend usamos photo, mas o backend salva como photoUrl
              // Manter os dois sincronizados é crucial
              user.value.photo = photoResponse.data.photo
              user.value.photoUrl = photoResponse.data.photo
              
              // Salvar no localStorage também para garantir persistência
              try {
                const localUser = JSON.parse(localStorage.getItem('user') || '{}')
                localUser.photo = photoResponse.data.photo
                localUser.photoUrl = photoResponse.data.photo
                localStorage.setItem('user', JSON.stringify(localUser))
              } catch (e) {
                console.error('Erro ao atualizar localStorage:', e)
              }
              
              console.log('Foto atualizada no objeto user:', user.value.photo)
            }
            
            photoUploaded = true
            
            // Limpar a foto temporária após o envio
            if (tempPhotoPreview.value) {
              URL.revokeObjectURL(tempPhotoPreview.value)
              tempPhotoPreview.value = null
            }
            tempPhotoFile.value = null
            
          } catch (error) {
            console.error('Erro ao enviar foto:', error)
            $q.notify({
              type: 'negative',
              message: 'Erro ao atualizar foto do perfil',
              position: 'bottom'
            })
          } finally {
            uploadingPhoto.value = false
          }
        }
        
        // Atualizar dados do usuário após todas as alterações
        const updatedUser = await authStore.loadUser()
        console.log('Usuário atualizado após salvar:', updatedUser)
        
        // Forçar atualização do timestamp para recarregar a imagem
        updatePhotoTimestamp()
        
        // Se não tiver foto após o carregamento do usuário, mas fez upload, 
        // recarregar a página (isso é uma solução de contorno para garantir)
        if (photoUploaded && !user.value?.photo) {
          console.log('Foto não apareceu após carregamento, forçando recarga...')
          // Espere um pouco antes de tentar recarregar o usuário novamente
          setTimeout(async () => {
            await authStore.loadUser()
            updatePhotoTimestamp()
          }, 500)
        }
        
        // Limpar campos de senha
        form.currentPassword = ''
        form.newPassword = ''
        form.confirmPassword = ''
        
        $q.notify({
          type: 'positive',
          message: 'Perfil atualizado com sucesso',
          position: 'bottom'
        })
        
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error)
        $q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Erro ao atualizar perfil',
          position: 'bottom'
        })
      } finally {
        saving.value = false
      }
    }

    const deleteAccount = async () => {
      try {
        deleting.value = true
        
        await api.delete('/client/profile')
        
        $q.notify({
          type: 'positive',
          message: 'Conta excluída com sucesso',
          position: 'bottom'
        })
        
        await authStore.logout()
        router.push('/login')
        
      } catch (error) {
        console.error('Erro ao excluir conta:', error)
        $q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Erro ao excluir conta',
          position: 'bottom'
        })
      } finally {
        deleting.value = false
        showDeleteDialog.value = false
        deleteConfirmation.value = ''
      }
    }

    const handleImageError = (e) => {
      console.error('Erro ao carregar imagem de perfil')
      photoLoaded.value = false
      
      // Se ocorrer erro ao carregar a imagem, esconder elemento
      if (e.target) {
        e.target.style.display = 'none'
      }
      
      // Tentar recarregar dados do usuário
      setTimeout(() => {
        console.log('Tentando recuperar foto após erro...')
        
        // Atualizar o timestamp para forçar recarga
        updatePhotoTimestamp()
        
        // Se ainda tivermos um user.photo, tentar recarregar
        if (user.value?.photo) {
          // Forçar recarga da imagem após um breve atraso
          setTimeout(() => {
            if (e.target) {
              e.target.style.display = ''
              e.target.src = getPhotoUrl(user.value.photo)
            }
          }, 500)
        }
      }, 1000)
    }
    
    const handleImageLoad = () => {
      console.log('Imagem carregada com sucesso')
      photoLoaded.value = true
    }
    
    // Função para atualizar o timestamp da foto (usado na URL para evitar cache)
    const updatePhotoTimestamp = () => {
      photoTimestamp.value = new Date().getTime()
      console.log('Timestamp atualizado:', photoTimestamp.value)
      
      // Verificar se tem objeto de usuário, mas não tem foto
      if (user.value && !user.value.photo && !user.value.photoUrl) {
        console.log('Usuário existe mas não tem foto, verificando localStorage...')
        
        try {
          // Verificar se o localStorage tem informações de foto que podemos usar
          const localUser = JSON.parse(localStorage.getItem('user') || '{}')
          if (localUser.photo || localUser.photoUrl) {
            console.log('Foto encontrada no localStorage, aplicando ao usuário atual')
            user.value.photo = localUser.photo || localUser.photoUrl
            user.value.photoUrl = localUser.photoUrl || localUser.photo
          }
        } catch (error) {
          console.error('Erro ao verificar localStorage:', error)
        }
      }
    }

    onMounted(async () => {
      // Carregar dados do formulário
      loadUserData()
      
      // Atualizar o timestamp para garantir que não usará cache
      updatePhotoTimestamp()
      
      // Garantir que a foto seja carregada na inicialização
      if (authStore.isAuthenticated) {
        try {
          // Sempre recarregar dados do usuário para ter certeza que temos as informações mais recentes
          console.log('Carregando dados do usuário na inicialização...')
          await authStore.loadUser()
          
          // Atualizar o formulário com os dados mais recentes
          loadUserData()
          
          console.log('Status da foto do usuário após carregar:', 
            user.value?.photo ? `Foto: ${user.value.photo}` : 'Foto não disponível',
            user.value?.photoUrl ? `PhotoUrl: ${user.value.photoUrl}` : 'PhotoUrl não disponível')
          
          // Atualizar o timestamp novamente após carregar o usuário
          updatePhotoTimestamp()
        } catch (error) {
          console.error('Erro ao carregar dados do usuário:', error)
        }
      }
    })

    return {
      user,
      form,
      saving,
      deleting,
      uploadingPhoto,
      showDeleteDialog,
      deleteConfirmation,
      photoTimestamp,
      photoLoaded,
      tempPhotoPreview, // Adicionar ao retorno
      passwordRules,
      confirmPasswordRules,
      getPhotoUrl,
      resetForm,
      handlePhotoChange,
      handleImageError,
      handleImageLoad,
      updatePhotoTimestamp, // Adicionar ao retorno
      onSubmit,
      deleteAccount
    }
  }
})
</script>

<style scoped>
/* Adiciona estilos específicos para a página de perfil */
.q-avatar {
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 2px solid #fff;
  transition: transform 0.3s ease;
  position: relative;
}

.q-avatar:hover {
  transform: scale(1.05);
}

.profile-avatar {
  cursor: pointer;
}

.profile-avatar img,
.user-avatar-img {
  object-fit: cover;
  width: 100%;
  height: 100%;
}

.avatar-spinner {
  background-color: rgba(255, 255, 255, 0.7);
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.profile-avatar:hover .avatar-overlay {
  opacity: 1;
}

.q-card {
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.q-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

/* Estilos responsivos */
@media (max-width: 599px) {
  .q-card {
    border-radius: 8px;
    margin-bottom: 12px;
  }
  
  .q-page {
    padding: 12px 8px !important;
  }
}

/* Animação de transição para inputs */
.q-input {
  transition: transform 0.2s ease;
}

.q-input:focus-within {
  transform: translateY(-2px);
}

/* Estilos para botões */
.action-btn {
  min-width: 140px;
  border-radius: 8px;
}

.danger-btn {
  transition: all 0.3s ease;
  border-radius: 8px;
}

.danger-btn:hover {
  background-color: rgba(244, 67, 54, 0.1) !important;
}

/* Estilo para o card de ações */
.actions-card {
  background-color: #f9f9f9;
}

/* Estilos para o diálogo de exclusão */
.delete-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.delete-btn {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.delete-btn:not(:disabled):hover {
  background-color: #b71c1c !important;
}
</style>
