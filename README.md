# 💈 Barbearia App

Sistema completo de gerenciamento para barbearias modernas, desenvolvido com tecnologias atuais e interface responsiva.

## 🚀 Tecnologias

### Frontend
- **Vue 3** - Framework JavaScript progressivo
- **Quasar Framework** - Framework Vue.js para desenvolvimento multiplataforma
- **Pinia** - Gerenciamento de estado para Vue
- **Vue Router** - Roteamento oficial do Vue
- **Axios** - Cliente HTTP para requisições à API

### Backend
- **Node.js** - Runtime JavaScript
- **TypeScript** - Superset tipado do JavaScript
- **Express** - Framework web minimalista
- **TypeORM** - ORM para TypeScript e JavaScript
- **JWT** - Autenticação baseada em tokens
- **bcrypt** - Criptografia de senhas

## 📋 Funcionalidades

### ✅ Implementadas
- 🔐 **Autenticação completa** (login/logout com JWT)
- 📊 **Dashboard responsivo** com métricas em tempo real
- 🎨 **Interface moderna** com Quasar Framework
- 🛡️ **Rotas protegidas** com middleware de autenticação
- 📱 **Design responsivo** para desktop e mobile
- 💬 **Feedback visual** com notificações elegantes
- 🔄 **Integração frontend/backend** completa

### 🔄 Em Desenvolvimento
- 📅 Gerenciamento de agendamentos
- 👨‍💼 Cadastro e gestão de barbeiros
- 🛍️ Catálogo de serviços
- 👥 Gestão de clientes
- 📈 Relatórios e analytics

## 🏗️ Estrutura do Projeto

```
barbearia-app/
├── frontend/           # Aplicação Vue.js + Quasar
│   ├── src/
│   │   ├── components/ # Componentes reutilizáveis
│   │   ├── layouts/    # Layouts da aplicação
│   │   ├── pages/      # Páginas/Views
│   │   ├── router/     # Configuração de rotas
│   │   ├── stores/     # Gerenciamento de estado (Pinia)
│   │   └── boot/       # Plugins e configurações
│   └── package.json
├── backend/            # API REST em Node.js + TypeScript
│   ├── src/
│   │   ├── controllers/# Controladores da API
│   │   ├── entities/   # Modelos do banco de dados
│   │   ├── middlewares/# Middlewares do Express
│   │   ├── repositories/# Repositórios de dados
│   │   └── routes.ts   # Definição das rotas
│   └── package.json
└── README.md          # Este arquivo
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Banco de dados (PostgreSQL recomendado)

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/barbearia-app.git
cd barbearia-app
```

### 2. Configure o Backend
```bash
cd backend
npm install
```

Configure as variáveis de ambiente criando um arquivo `.env`:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
DB_DATABASE=barbearia_db
JWT_SECRET=seu_jwt_secret_super_seguro
```

Execute as migrações e inicie o servidor:
```bash
npm run typeorm migration:run
npm run dev
```

### 3. Configure o Frontend
```bash
cd ../frontend
npm install
npm run dev
```

### 4. Acesse a aplicação
- **Frontend**: http://localhost:9000
- **Backend API**: http://localhost:3000

## � Credenciais de Teste

Para testar a aplicação, use as credenciais criadas pelos seeds:

```
Email: admin@barbearia.com
Senha: admin123
```

## 🛠️ Scripts Disponíveis

### Backend
```bash
npm run dev          # Modo desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia versão de produção
npm run typeorm      # CLI do TypeORM
```

### Frontend
```bash
npm run dev          # Modo desenvolvimento
npm run build        # Build para produção
npm run lint         # Executa linter
npm run lint:fix     # Corrige problemas do linter
```

## 🤝 Como Contribuir

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

### 📝 Padrão de Commits

Utilizamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação de código
- `refactor:` Refatoração de código
- `test:` Testes
- `chore:` Tarefas de manutenção

## � Licença

Este projeto está sob a licença MIT.

---

⭐ Se este projeto te ajudou, considere dar uma estrela no repositório!

```bash
npm run dev
```

---

## 🗃️ Banco de Dados

### Criar as tabelas (migrations):

```bash
npm run migration:run
```

### Gerar nova migration (se mudar entidades):

```bash
npm run migration:generate --nome-da-migration
```

---

## 🌱 Rodando seeds (dados fake)

As seeds populam o banco com dados falsos úteis para desenvolvimento:

```bash
npm run seed
```

---

## 📜 Scripts disponíveis

```json
"scripts": {
  "dev": "nodemon --exec ts-node ./src/index.ts",
  "migration:generate": "typeorm-ts-node-commonjs -d ./src/data-source.ts migration:generate ./src/migrations/default",
  "migration:run": "typeorm-ts-node-commonjs -d ./src/data-source.ts migration:run",
  "build": "rm -rf ./dist && tsc",
  "start": "node ./dist/index.js",
  "seed": "ts-node src/seeds/index.ts"
}
```

---

## 🧪 Testes

> Ainda não implementado.

---

## 🧔 Autor

Feito com 💈 por [@guilhermeguth](https://github.com/guilhermeguth)

---

## 📃 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
