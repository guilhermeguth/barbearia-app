# ✂️ Barbearia App

Aplicativo para gerenciamento de barbearia: cadastre serviços, barbeiros, clientes e gerencie agendamentos de forma simples e eficiente.

---

## 🚀 Tecnologias utilizadas

- **Node.js** – Plataforma JavaScript
- **TypeScript** – Tipagem estática para JavaScript
- **Express** – Framework web leve
- **TypeORM** – ORM para banco de dados
- **PostgreSQL** – Banco de dados relacional
- **JWT** – Autenticação baseada em tokens
- **BCrypt** – Hash de senhas
- **Faker.js** – Geração de dados falsos para desenvolvimento
- **Dotenv** – Gerenciamento de variáveis de ambiente
- **Nodemon** – Reload automático no desenvolvimento
- **ts-node** – Execução de arquivos `.ts` diretamente

---

## 📁 Estrutura do projeto

```
barbearia-app/
├── backend/
│   ├── src/
│   │   ├── entity/         # Entidades do TypeORM
│   │   ├── repositories/   # Repositórios customizados
│   │   ├── seeds/          # Seeds para desenvolvimento
│   │   ├── routes/         # Rotas da API
│   │   ├── controllers/    # Lógicas de controle
│   │   ├── middlewares/    # Middlewares (auth, error, etc.)
│   │   ├── data-source.ts  # Configuração TypeORM
│   │   └── index.ts        # Ponto de entrada da aplicação
```

---

## ⚙️ Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [PostgreSQL](https://www.postgresql.org/) 12+
- [NPM](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)

---

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/guilhermeguth/barbearia-app.git

# Acesse a pasta do projeto
cd barbearia-app/backend

# Instale as dependências
npm install
```

---

## 🔐 Variáveis de ambiente

Crie um arquivo `.env` na raiz do `backend/` com o seguinte conteúdo:

```env
DATABASE_URL=postgres://usuario:senha@localhost:5432/barbearia
JWT_SECRET=um_segredo_seguro_aqui
```

---

## 🔃 Rodando o projeto

### Iniciar servidor em modo desenvolvimento:

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
