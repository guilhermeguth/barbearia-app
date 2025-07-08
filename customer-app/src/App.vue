<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useSettings } from 'src/composables/useSettings'

const { loadSettings } = useSettings()

let deferredPrompt = null

onMounted(async () => {
  // Carregar configurações da barbearia
  await loadSettings()
  
  // Aguarda o evento de prompt de instalação
  addEventListener('beforeinstallprompt', (e) => {
    console.log('beforeinstallprompt event captured')
    e.preventDefault()
    deferredPrompt = e
    
    // Opcional: mostrar um botão personalizado de instalação
    showInstallBanner()
  })

  // Verifica se já está instalado
  if (matchMedia('(display-mode: standalone)').matches) {
    console.log('PWA já está instalado')
  }

  // Para debug - força o evento em desenvolvimento
  if (process.env.DEV) {
    setTimeout(() => {
      if (!deferredPrompt) {
        console.log('⚠️  beforeinstallprompt não foi disparado')
        console.log('Possíveis motivos:')
        console.log('- Não está em HTTPS')
        console.log('- PWA já está instalado')
        console.log('- Manifest ou Service Worker com problemas')
        console.log('- Critérios de instalabilidade não atendidos')
      }
    }, 3000)
  }
})

function showInstallBanner() {
  // Aqui você pode mostrar um banner customizado
  console.log('🚀 App pode ser instalado!')
  
  // Exemplo simples - substituir por um componente bonito
  const banner = document.createElement('div')
  banner.style.cssText = `
    position: fixed;
    bottom: 20px;
    left: 20px;
    right: 20px;
    background: #1976d2;
    color: white;
    padding: 15px;
    border-radius: 8px;
    z-index: 9999;
    text-align: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  `
  banner.innerHTML = `
    <div>📱 Instalar Barbearia App</div>
    <button id="install-btn" style="
      background: white;
      color: #1976d2;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      margin-top: 8px;
      cursor: pointer;
    ">Instalar</button>
    <button id="close-btn" style="
      background: transparent;
      color: white;
      border: 1px solid white;
      padding: 8px 16px;
      border-radius: 4px;
      margin-top: 8px;
      margin-left: 8px;
      cursor: pointer;
    ">Não</button>
  `
  
  document.body.appendChild(banner)
  
  // Event listeners para os botões
  banner.querySelector('#install-btn').addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log(`Install prompt outcome: ${outcome}`)
      deferredPrompt = null
    }
    banner.remove()
  })
  
  banner.querySelector('#close-btn').addEventListener('click', () => {
    banner.remove()
  })
}
</script>
