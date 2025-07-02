import { ref } from 'vue'

// Dados do usuário (simulados - em um projeto real viria de API/store)
const userInfo = ref({
  name: 'João Silva',
  role: 'Administrador',
  email: 'joao@barbearia.com',
  avatar: null, // URL da imagem do usuário
  permissions: ['admin', 'read', 'write']
})

export function useAuth() {
  
  const isLoggedIn = ref(true) // Simulando usuário logado
  
  function updateUserInfo(newInfo) {
    userInfo.value = { ...userInfo.value, ...newInfo }
  }
  
  function logout() {
    // Implementar logout real
    console.log('Fazendo logout...')
    isLoggedIn.value = false
    // Limpar token, redirecionar, etc.
    // router.push('/login')
  }
  
  function editProfile() {
    // Implementar edição de perfil
    console.log('Abrindo edição de perfil...')
    // Pode abrir um modal ou navegar para uma página
  }
  
  function changePassword() {
    // Implementar troca de senha
    console.log('Abrindo troca de senha...')
    // Pode abrir um modal ou navegar para uma página
  }
  
  return {
    userInfo,
    isLoggedIn,
    updateUserInfo,
    logout,
    editProfile,
    changePassword
  }
}
