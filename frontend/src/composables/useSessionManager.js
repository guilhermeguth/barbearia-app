// Composable para gerenciar expiração de sessão
import { ref, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from 'src/stores/auth'
import { Dialog, Notify } from 'quasar'

export function useSessionManager() {
  const authStore = useAuthStore()
  const warningTimer = ref(null)
  const expirationTimer = ref(null)
  
  // 8 horas = 28800000ms
  // Avisar 15 minutos antes = 27000000ms (7h45min)
  const SESSION_DURATION = 8 * 60 * 60 * 1000 // 8 horas
  const WARNING_BEFORE = 15 * 60 * 1000 // 15 minutos antes
  
  function startSessionTimers() {
    // Limpar timers existentes
    clearSessionTimers()
    
    if (!authStore.isAuthenticated) return
    
    // Timer para aviso (7h45min após login)
    warningTimer.value = setTimeout(() => {
      showExpirationWarning()
    }, SESSION_DURATION - WARNING_BEFORE)
    
    // Timer para expiração forçada (8h após login)
    expirationTimer.value = setTimeout(() => {
      forceLogout()
    }, SESSION_DURATION)
    
    console.log('Session timers iniciados - Aviso em 7h45min, Expiração em 8h')
  }
  
  function clearSessionTimers() {
    if (warningTimer.value) {
      clearTimeout(warningTimer.value)
      warningTimer.value = null
    }
    if (expirationTimer.value) {
      clearTimeout(expirationTimer.value)
      expirationTimer.value = null
    }
  }
  
  function showExpirationWarning() {
    Dialog.create({
      title: '⏰ Sua sessão está prestes a expirar',
      message: 'Sua sessão expirará em 15 minutos. Deseja continuar logado?',
      ok: {
        label: 'Continuar Logado',
        color: 'primary'
      },
      cancel: {
        label: 'Fazer Logout',
        color: 'negative'
      }
    }).onOk(() => {
      // Renovar sessão fazendo uma requisição qualquer
      renewSession()
    }).onCancel(() => {
      // Logout voluntário
      authStore.logout()
    })
  }
  
  async function renewSession() {
    try {
      // Fazer uma requisição para renovar o token
      // (ou implementar refresh token)
      await authStore.fetchUser()
      
      // Reiniciar os timers
      startSessionTimers()
      
      Notify.create({
        type: 'positive',
        message: 'Sessão renovada com sucesso!',
        position: 'bottom-right',
        timeout: 3000
      })
      
    } catch (error) {
      console.error('Erro ao renovar sessão:', error)
      forceLogout()
    }
  }
  
  function forceLogout() {
    Dialog.create({
      title: '⚠️ Sessão Expirada',
      message: 'Sua sessão expirou por motivos de segurança. Você será redirecionado para a tela de login.',
      ok: {
        label: 'Fazer Login Novamente',
        color: 'primary'
      }
    }).onOk(() => {
      authStore.logout()
    })
  }
  
  // Inicializar quando o composable for usado
  onMounted(() => {
    if (authStore.isAuthenticated) {
      startSessionTimers()
    }
  })
  
  // Limpar ao desmontar
  onUnmounted(() => {
    clearSessionTimers()
  })
  
  return {
    startSessionTimers,
    clearSessionTimers,
    renewSession
  }
}
