// Configuração de navegação para o menu lateral
export const navigationLinks = [
  {
    title: 'Dashboard',
    icon: 'dashboard',
    to: '/', // Rota interna
    section: 'main'
  },
  {
    title: 'Agendamentos',
    icon: 'event',
    to: '/agendamentos',
    section: 'main'
  },
  {
    title: 'Barbeiros',
    icon: 'person',
    to: '/barbeiros',
    section: 'main'
  },
  {
    title: 'Serviços',
    icon: 'content_cut',
    to: '/servicos',
    section: 'main'
  },
  {
    title: 'Clientes',
    icon: 'people',
    to: '/clientes',
    section: 'main'
  },
  {
    title: 'Relatórios',
    icon: 'analytics',
    to: '/relatorios',
    section: 'main'
  }
]

// Links externos (opcionais)
export const externalLinks = [
  {
    title: 'Suporte',
    icon: 'help',
    link: 'https://suporte.barbearia.com',
    section: 'external'
  },
  {
    title: 'Documentação',
    icon: 'description',
    link: 'https://docs.barbearia.com',
    section: 'external'
  }
]

// Função para filtrar links baseado no tipo de usuário (opcional)
export function getNavigationForUser(userRole = 'admin') {
  // Aqui você pode filtrar os links baseado no papel do usuário
  const allowedLinks = {
    admin: navigationLinks,
    barber: navigationLinks.filter(link => 
      ['/', '/agendamentos', '/clientes'].includes(link.to)
    ),
    client: navigationLinks.filter(link => 
      ['/', '/agendamentos'].includes(link.to)
    )
  }
  
  return allowedLinks[userRole] || []
}
