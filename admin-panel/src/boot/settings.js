import { defineBoot } from '#q-app/wrappers'
import { useSettings } from '../composables/useSettings'

export default defineBoot(async ({ app }) => {
  console.log('🚀 Inicializando configurações do painel admin...')
  
  // Disponibilizar useSettings como propriedade global
  app.config.globalProperties.$settings = useSettings()
  
  try {
    const { loadFromLocalStorage, applyPrimaryColor, loadSettings } = useSettings()
    
    // 1. Primeiro, aplicar do localStorage para feedback visual imediato
    loadFromLocalStorage()
    
    // 2. Depois, buscar as configurações atualizadas do backend
    const result = await loadSettings()
    console.log('📊 Resultado do carregamento de configurações:', result)
    
    // 3. Garantir que a cor seja aplicada após o DOM estar completamente carregado
    // Aumentando o timeout para dar mais tempo para o DOM carregar completamente
    setTimeout(() => {
      console.log('⏱️ Aplicando cor após timeout para garantir carregamento completo')
      applyPrimaryColor()
    }, 300)
    
    console.log('✅ Configurações do admin carregadas com sucesso!')
  } catch (error) {
    console.error('❌ Erro ao carregar configurações do admin:', error)
  }
})
