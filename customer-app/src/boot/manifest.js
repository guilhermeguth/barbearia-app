import { boot } from 'quasar/wrappers'

export default boot(() => {
  console.log('🎯 Configurando manifest dinâmico')
  
  // Remover todos os links de manifest existentes
  const existingManifestLinks = document.querySelectorAll('link[rel="manifest"]')
  existingManifestLinks.forEach(link => {
    console.log('🗑️ Removendo manifest link:', link.href)
    link.remove()
  })
  
  // Criar novo link para o manifest dinâmico do backend
  const manifestLink = document.createElement('link')
  manifestLink.rel = 'manifest'
  
  // Configurar URL do backend
  const isDev = process.env.NODE_ENV === 'development'
  const baseURL = isDev 
    ? 'http://localhost:3001' 
    : process.env.API_BASE_URL || 'http://localhost:3001'
  
  // Apontar para o manifest dinâmico do backend
  manifestLink.href = `${baseURL}/manifest.json`
  
  // Adicionar o link no head
  document.head.appendChild(manifestLink)
  
  console.log('✅ Manifest dinâmico configurado:', manifestLink.href)
})
