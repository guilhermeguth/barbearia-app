// deno-lint-ignore-file
import { ref } from 'vue'
import { api } from 'boot/axios'

const businessName = ref('Barbearia')
const primaryColor = ref('#1976D2')
const isLoading = ref(false)
const error = ref(null)

export function useSettings() {
  const loadSettings = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      console.log('🔧 Carregando configurações do backend...')
      
      // Buscar configurações do backend
      const response = await api.get('/public/settings')
      
      if (response.data) {
        console.log('📊 Dados recebidos do backend:', response.data)
        
        // Armazenar os valores anteriores para comparação
        const previousColor = primaryColor.value
        
        businessName.value = response.data.businessName || 'Barbearia'
        primaryColor.value = response.data.primaryColor || '#1976D2'
        
        // Salvar configurações no localStorage
        localStorage.setItem('app_business_name', businessName.value)
        localStorage.setItem('app_primary_color', primaryColor.value)
        
        console.log('✅ Configurações carregadas:', {
          businessName: businessName.value,
          primaryColor: primaryColor.value,
          mudançaDeCor: previousColor !== primaryColor.value
        })
        
        // Aplicar a cor imediatamente e novamente após um delay para garantir que funcione
        applyPrimaryColor()
        
        // Aplicar novamente após um delay para garantir que o DOM esteja pronto
        setTimeout(() => {
          applyPrimaryColor()
        }, 100)
        
        // E uma última vez depois de mais tempo para garantir
        setTimeout(() => {
          applyPrimaryColor()
        }, 500)
        
        // Atualizar meta tags
        updateMetaTags()
        
        // Forçar a atualização da CSS custom property no :root
        document.documentElement.style.setProperty('--primary-color', primaryColor.value)
        
        return { 
          success: true, 
          businessName: businessName.value, 
          primaryColor: primaryColor.value,
          colorChanged: previousColor !== primaryColor.value
        }
      }
    } catch (err) {
      console.error('❌ Erro ao carregar configurações:', err)
      error.value = err.message || 'Erro ao carregar configurações'
      
      // Tentar carregar do localStorage em caso de erro
      const savedBusinessName = localStorage.getItem('app_business_name')
      const savedPrimaryColor = localStorage.getItem('app_primary_color')
      
      console.log('🔄 Tentando carregar configurações do localStorage:', {
        savedBusinessName,
        savedPrimaryColor
      })
      
      if (savedBusinessName) {
        businessName.value = savedBusinessName
      }
      if (savedPrimaryColor) {
        primaryColor.value = savedPrimaryColor
        applyPrimaryColor()
      }
      
      return { success: false, fromLocalStorage: true }
    } finally {
      isLoading.value = false
    }
  }
  
  const applyPrimaryColor = () => {
    try {
      if (!primaryColor.value) {
        console.error('❌ Não foi possível aplicar a cor primária: valor não definido')
        return
      }
      console.log('🎨 Aplicando cor primária:', primaryColor.value)
      // Atualizar CSS custom properties
      document.documentElement.style.setProperty('--q-primary', primaryColor.value)
      document.documentElement.style.setProperty('--primary-color', primaryColor.value)
      document.documentElement.style.setProperty('--q-color-primary', primaryColor.value)
      // Remover estilos anteriores se existirem
      const existingStyle = document.getElementById('dynamic-primary-color')
      if (existingStyle) {
        existingStyle.remove()
      }
      // CSS dinâmico ultraespecífico para garantir cor primária em todos os estados do menu
      const style = document.createElement('style')
      style.id = 'dynamic-primary-color'
      style.textContent = `
        :root {
          --q-primary: ${primaryColor.value} !important;
          --q-color-primary: ${primaryColor.value} !important;
          --primary-color: ${primaryColor.value} !important;
          --q-highlight: ${primaryColor.value} !important;
        }
        body.body--dark {
          --q-primary: ${primaryColor.value} !important;
          --q-color-primary: ${primaryColor.value} !important;
          --primary-color: ${primaryColor.value} !important;
          --q-highlight: ${primaryColor.value} !important;
        }
        .bg-primary { background-color: ${primaryColor.value} !important; }
        .text-primary { color: ${primaryColor.value} !important; }
        /* Força fundo e cor branca nos elementos principais do item ativo */
        .q-item.q-item--active,
        .q-item.q-router-link--active,
        .q-item.q-router-link--exact-active {
          background: ${primaryColor.value} !important;
          color: #fff !important;
          transition: none !important;
        }
        .q-item.q-item--active .q-item__label,
        .q-item.q-router-link--active .q-item__label,
        .q-item.q-router-link--exact-active .q-item__label,
        .q-item.q-item--active .q-icon,
        .q-item.q-router-link--active .q-icon,
        .q-item.q-router-link--exact-active .q-icon,
        .q-item.q-item--active .q-item__section,
        .q-item.q-router-link--active .q-item__section,
        .q-item.q-router-link--exact-active .q-item__section {
          color: #fff !important;
        }
        /* Remove highlight verde do Quasar em modo dark e light */
        .q-item.q-item--highlighted,
        .q-item.q-item--active.q-item--highlighted,
        .q-item.q-router-link--active.q-item--highlighted,
        .q-item.q-router-link--exact-active.q-item--highlighted {
          background: ${primaryColor.value} !important;
          color: #fff !important;
        }
        /* Remove qualquer background de itens não ativos */
        .q-item:not(.q-item--active):not(.q-router-link--active):not(.q-router-link--exact-active),
        .q-item:not(.q-item--active):not(.q-router-link--active):not(.q-router-link--exact-active)[style*="background"] {
          background: none !important;
        }
      `
      document.head.appendChild(style)
      document.body.classList.add('color-applied')
      setTimeout(() => document.body.classList.remove('color-applied'), 100)
      console.log('✅ Cor primária aplicada com sucesso:', primaryColor.value)
    } catch (err) {
      console.error('❌ Erro ao aplicar cor primária:', err)
    }
  }
  
  const updateMetaTags = () => {
    try {
      // Atualizar theme-color
      const themeColorMeta = document.querySelector('meta[name="theme-color"]')
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', primaryColor.value)
      }
      
      // Atualizar title se necessário
      const title = document.querySelector('title')
      if (title && title.textContent.includes('Barbearia')) {
        title.textContent = title.textContent.replace('Barbearia', businessName.value)
      }
      
      // Atualizar application-name
      const appNameMeta = document.querySelector('meta[name="application-name"]')
      if (appNameMeta) {
        appNameMeta.setAttribute('content', businessName.value)
      }
      
      // Atualizar apple-mobile-web-app-title
      const appleTitleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]')
      if (appleTitleMeta) {
        appleTitleMeta.setAttribute('content', businessName.value)
      }
      
      console.log('📱 Meta tags atualizadas')
    } catch (err) {
      console.error('❌ Erro ao atualizar meta tags:', err)
    }
  }
  
  const refreshSettings = async () => {
    await loadSettings()
  }
  
  const loadFromLocalStorage = () => {
    const savedBusinessName = localStorage.getItem('app_business_name')
    const savedPrimaryColor = localStorage.getItem('app_primary_color')
    if (savedBusinessName) {
      businessName.value = savedBusinessName
    }
    if (savedPrimaryColor) {
      primaryColor.value = savedPrimaryColor
      applyPrimaryColor()
    }
  }

  // Removido o auto-carregamento no onMounted, agora o boot file cuida disso
  // Isso evita inicializações múltiplas e problemas de timing

  return {
    businessName,
    primaryColor,
    isLoading,
    error,
    loadSettings,
    refreshSettings,
    applyPrimaryColor,
    updateMetaTags,
    loadFromLocalStorage
  }
}
