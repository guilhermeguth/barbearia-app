import { Notify } from 'quasar'

/**
 * Composable para notificações padronizadas
 * Centraliza a configuração das notificações da aplicação
 */
export function useNotify() {
  
  // Configuração padrão das notificações
  const defaultConfig = {
    position: 'bottom',
    timeout: 4000,
    actions: [
      {
        icon: 'close',
        color: 'white',
        round: true,
        handler: () => {}
      }
    ]
  }

  /**
   * Notificação de sucesso (verde)
   */
  const notifySuccess = (message, options = {}) => {
    Notify.create({
      type: 'positive',
      message,
      icon: 'check_circle',
      color: 'positive',
      ...defaultConfig,
      ...options
    })
  }

  /**
   * Notificação de erro (vermelho)
   */
  const notifyError = (message, options = {}) => {
    Notify.create({
      type: 'negative',
      message,
      icon: 'error',
      color: 'negative',
      timeout: 6000, // Erros ficam mais tempo
      ...defaultConfig,
      ...options
    })
  }

  /**
   * Notificação de aviso (laranja)
   */
  const notifyWarning = (message, options = {}) => {
    Notify.create({
      type: 'warning',
      message,
      icon: 'warning',
      color: 'warning',
      ...defaultConfig,
      ...options
    })
  }

  /**
   * Notificação informativa (azul)
   */
  const notifyInfo = (message, options = {}) => {
    Notify.create({
      type: 'info',
      message,
      icon: 'info',
      color: 'info',
      ...defaultConfig,
      ...options
    })
  }

  /**
   * Notificação de loading (para processos longos)
   */
  const notifyLoading = (message, options = {}) => {
    return Notify.create({
      type: 'ongoing',
      message,
      spinner: true,
      timeout: 0, // Não remove automaticamente
      position: 'bottom',
      ...options
    })
  }

  /**
   * Notificação customizada
   */
  const notify = (config) => {
    Notify.create({
      ...defaultConfig,
      ...config
    })
  }

  return {
    // Métodos específicos
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo,
    notifyLoading,
    
    // Método genérico
    notify,
    
    // Aliases para compatibilidade
    success: notifySuccess,
    error: notifyError,
    warning: notifyWarning,
    info: notifyInfo
  }
}
