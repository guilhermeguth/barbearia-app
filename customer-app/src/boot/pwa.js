import { boot } from 'quasar/wrappers'

export default boot(() => {
  // Configurar o manifest dinâmico
  try {
    // Verificar se existe um link para manifest
    let manifestLink = document.querySelector('link[rel="manifest"]')
    
    if (!manifestLink) {
      // Criar o link para o manifest se não existir
      manifestLink = document.createElement('link')
      manifestLink.rel = 'manifest'
      document.head.appendChild(manifestLink)
    }
    
    // Configurar para usar o manifest dinâmico do backend
    const isDev = process.env.NODE_ENV === 'development'
    const baseURL = isDev 
      ? 'http://localhost:3001' 
      : process.env.API_BASE_URL || 'http://localhost:3001'
    
    manifestLink.href = `${baseURL}/public/manifest.json`
    
    console.log('🎯 Manifest PWA configurado dinamicamente:', manifestLink.href)
  } catch (error) {
    console.error('❌ Erro ao configurar manifest PWA:', error)
  }
})
