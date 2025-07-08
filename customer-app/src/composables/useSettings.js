import { ref, computed } from 'vue'
import { setCssVar } from 'quasar'
import { api } from 'boot/axios'

const settings = ref({
  businessName: 'Barbearia',
  primaryColor: '#1976D2'
})

const isLoading = ref(false)

export function useSettings() {
  
  const loadSettings = async () => {
    isLoading.value = true
    try {
      const response = await api.get('/public/settings')
      settings.value = response.data
      
      // Aplicar a cor principal no Quasar usando setCssVar
      if (settings.value.primaryColor) {
        setCssVar('primary', settings.value.primaryColor)
      }
      
      // Atualizar o título da página
      if (settings.value.businessName) {
        document.title = settings.value.businessName
      }
      
      // Atualizar meta tags
      updateMetaTags()
      
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
      // Manter valores padrão em caso de erro
    } finally {
      isLoading.value = false
    }
  }

  const updateMetaTags = () => {
    try {
      // Atualizar a meta tag theme-color
      const themeColorMeta = document.querySelector('meta[name="theme-color"]')
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', settings.value.primaryColor)
      }
      
      // Atualizar meta tag application-name
      const appNameMeta = document.querySelector('meta[name="application-name"]')
      if (appNameMeta) {
        appNameMeta.setAttribute('content', settings.value.businessName)
      }
      
      // Atualizar meta tag apple-mobile-web-app-title
      const appleTitleMeta = document.querySelector('meta[name="apple-mobile-web-app-title"]')
      if (appleTitleMeta) {
        appleTitleMeta.setAttribute('content', settings.value.businessName)
      }
      
    } catch (error) {
      console.error('Erro ao atualizar meta tags:', error)
    }
  }

  const businessName = computed(() => settings.value.businessName)
  const primaryColor = computed(() => settings.value.primaryColor)

  return {
    settings,
    isLoading,
    businessName,
    primaryColor,
    loadSettings
  }
}
