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
    </div>

    <!-- Profile Form -->
    <q-form @submit="onSubmit" class="q-gutter-md">
      <!-- Avatar Section -->
      <div class="row justify-center q-mb-lg">
        <div class="column items-center">
          <q-avatar size="120px" class="q-mb-md">
            <img 
              v-if="user.photo" 
              :src="getPhotoUrl(user.photo)" 
              alt="Avatar"
            >
            <q-icon 
              v-else 
              name="person" 
              size="60px" 
              color="grey-6"
            />
          </q-avatar>
          
          <q-btn
            flat
            dense
            icon="camera_alt"
            label="Alterar foto"
            color="primary"
            size="sm"
            @click="$refs.fileInput.click()"
          />
          
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            style="display: none"
            @change="handlePhotoChange"
          />
        </div>
      </div>

      <!-- Personal Information -->
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 text-weight-medium q-mb-md">
            Informações Pessoais
          </div>
          
          <div class="q-gutter-md">
            <q-input
              v-model="form.name"
              label="Nome completo *"
              outlined
              :rules="[val => !!val || 'Nome é obrigatório']"
            />

            <q-input
              v-model="form.email"
              label="E-mail *"
              type="email"
              outlined
              readonly
              hint="E-mail não pode ser alterado"
              :rules="[val => !!val || 'E-mail é obrigatório']"
            />

            <q-input
              v-model="form.phone"
              label="Telefone"
              mask="(##) #####-####"
              outlined
              hint="Formato: (11) 99999-9999"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Change Password -->
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 text-weight-medium q-mb-md">
            Alterar Senha
          </div>
          
          <div class="q-gutter-md">
            <q-input
              v-model="form.currentPassword"
              label="Senha atual"
              type="password"
              outlined
              autocomplete="current-password"
            />

            <q-input
              v-model="form.newPassword"
              label="Nova senha"
              type="password"
              outlined
              autocomplete="new-password"
              :rules="passwordRules"
            />

            <q-input
              v-model="form.confirmPassword"
              label="Confirmar nova senha"
              type="password"
              outlined
              autocomplete="new-password"
              :rules="confirmPasswordRules"
            />
          </div>
          
          <div class="text-caption text-grey-6 q-mt-sm">
            Deixe em branco se não deseja alterar a senha
          </div>
        </q-card-section>
      </q-card>

      <!-- Preferences -->
      <q-card flat bordered>
        <q-card-section>
          <div class="text-h6 text-weight-medium q-mb-md">
            Preferências
          </div>
          
          <div class="q-gutter-md">
            <q-toggle
              v-model="form.emailNotifications"
              label="Receber notificações por e-mail"
              color="primary"
            />
            
            <q-toggle
              v-model="form.smsNotifications"
              label="Receber notificações por SMS"
              color="primary"
            />
          </div>
        </q-card-section>
      </q-card>

      <!-- Action Buttons -->
      <div class="row q-gutter-sm q-mt-lg">
        <q-btn
          type="submit"
          label="Salvar alterações"
          color="primary"
          unelevated
          :loading="saving"
          class="col"
        />
        
        <q-btn
          label="Cancelar"
          color="grey-7"
          flat
          @click="resetForm"
          :disable="saving"
        />
      </div>
    </q-form>

    <!-- Delete Account -->
    <q-separator class="q-my-xl" />
    
    <q-card flat bordered class="bg-red-1">
      <q-card-section>
        <div class="text-h6 text-weight-medium text-red-8 q-mb-sm">
          Zona de Perigo
        </div>
        
        <div class="text-body2 text-grey-7 q-mb-md">
          Esta ação é irreversível. Todos os seus dados serão permanentemente removidos.
        </div>
        
        <q-btn
          label="Excluir conta"
          color="red"
          outline
          icon="delete_forever"
          @click="showDeleteDialog = true"
        />
      </q-card-section>
    </q-card>

    <!-- Delete Account Confirmation -->
    <q-dialog v-model="showDeleteDialog" persistent>
      <q-card style="min-width: 350px">
        <q-card-section>
          <div class="text-h6">Excluir Conta</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="text-body1 q-mb-md">
            Tem certeza que deseja excluir sua conta?
          </div>
          
          <div class="text-body2 text-red-8">
            Esta ação é irreversível e todos os seus dados serão perdidos.
          </div>
          
          <q-input
            v-model="deleteConfirmation"
            label="Digite 'EXCLUIR' para confirmar"
            outlined
            class="q-mt-md"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn 
            flat 
            label="Cancelar" 
            color="grey-7" 
            v-close-popup 
          />
          <q-btn 
            unelevated 
            label="Excluir conta" 
            color="red" 
            :disable="deleteConfirmation !== 'EXCLUIR'"
            @click="deleteAccount"
            :loading="deleting"
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
    
    const user = computed(() => authStore.user)
    
    const form = reactive({
      name: '',
      email: '',
      phone: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      emailNotifications: true,
      smsNotifications: false
    })

    const passwordRules = [
      val => !val || val.length >= 6 || 'Senha deve ter pelo menos 6 caracteres'
    ]

    const confirmPasswordRules = [
      val => !form.newPassword || val === form.newPassword || 'Senhas não conferem'
    ]

    const getPhotoUrl = (photo) => {
      if (photo?.startsWith('http')) return photo
      return `${api.defaults.baseURL}/uploads/users/${photo}`
    }

    const loadUserData = () => {
      if (user.value) {
        form.name = user.value.name || ''
        form.email = user.value.email || ''
        form.phone = user.value.phone || ''
        form.emailNotifications = user.value.emailNotifications ?? true
        form.smsNotifications = user.value.smsNotifications ?? false
      }
    }

    const resetForm = () => {
      loadUserData()
      form.currentPassword = ''
      form.newPassword = ''
      form.confirmPassword = ''
    }

    const handlePhotoChange = async (event) => {
      const file = event.target.files[0]
      if (!file) return

      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        $q.notify({
          type: 'negative',
          message: 'Apenas arquivos de imagem são permitidos',
          position: 'top'
        })
        return
      }

      // Validar tamanho (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        $q.notify({
          type: 'negative',
          message: 'Arquivo muito grande. Máximo 5MB.',
          position: 'top'
        })
        return
      }

      try {
        const formData = new FormData()
        formData.append('photo', file)

        await api.post('/client/profile/photo', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })

        await authStore.loadUser()
        
        $q.notify({
          type: 'positive',
          message: 'Foto atualizada com sucesso',
          position: 'top'
        })
      } catch (error) {
        console.error('Erro ao atualizar foto:', error)
        $q.notify({
          type: 'negative',
          message: 'Erro ao atualizar foto',
          position: 'top'
        })
      }
    }

    const onSubmit = async () => {
      try {
        saving.value = true

        const updateData = {
          name: form.name,
          phone: form.phone,
          emailNotifications: form.emailNotifications,
          smsNotifications: form.smsNotifications
        }

        // Adicionar dados de senha se fornecidos
        if (form.newPassword) {
          if (!form.currentPassword) {
            $q.notify({
              type: 'negative',
              message: 'Senha atual é obrigatória para alterar a senha',
              position: 'top'
            })
            return
          }
          
          updateData.currentPassword = form.currentPassword
          updateData.newPassword = form.newPassword
        }

        await api.put('/client/profile', updateData)
        
        // Atualizar dados do usuário
        await authStore.loadUser()
        
        // Limpar campos de senha
        form.currentPassword = ''
        form.newPassword = ''
        form.confirmPassword = ''
        
        $q.notify({
          type: 'positive',
          message: 'Perfil atualizado com sucesso',
          position: 'top'
        })
        
      } catch (error) {
        console.error('Erro ao atualizar perfil:', error)
        $q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Erro ao atualizar perfil',
          position: 'top'
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
          position: 'top'
        })
        
        await authStore.logout()
        router.push('/login')
        
      } catch (error) {
        console.error('Erro ao excluir conta:', error)
        $q.notify({
          type: 'negative',
          message: error.response?.data?.message || 'Erro ao excluir conta',
          position: 'top'
        })
      } finally {
        deleting.value = false
        showDeleteDialog.value = false
        deleteConfirmation.value = ''
      }
    }

    onMounted(() => {
      loadUserData()
    })

    return {
      user,
      form,
      saving,
      deleting,
      showDeleteDialog,
      deleteConfirmation,
      passwordRules,
      confirmPasswordRules,
      getPhotoUrl,
      resetForm,
      handlePhotoChange,
      onSubmit,
      deleteAccount
    }
  }
})
</script>

<style lang="scss" scoped>
.q-page {
  background-color: #f5f5f5;
}
</style>
