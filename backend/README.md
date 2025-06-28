# ⚙️ Backend - Barbearia App

API REST robusta desenvolvida com Node.js, TypeScript e TypeORM para o sistema de gerenciamento de barbearia.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript server-side
- **TypeScript** - Superset tipado do JavaScript
- **Express** - Framework web minimalista e flexível
- **TypeORM** - ORM para TypeScript e JavaScript
- **PostgreSQL** - Banco de dados relacional robusto
- **JWT** - Autenticação baseada em tokens
- **bcrypt** - Criptografia segura de senhas
- **cors** - Habilitação de CORS para frontend

## 📋 Funcionalidades

### ✅ Implementadas
- 🔐 **Autenticação JWT** completa (login/logout)
- 👤 **Gestão de usuários** com criptografia de senhas
- 🛡️ **Middleware de autenticação** para rotas protegidas
- 📊 **Seeds de desenvolvimento** com dados de exemplo
- 🌐 **CORS configurado** para integração com frontend
- 📝 **Logs de debug** para desenvolvimento
- 🗄️ **Migrações automáticas** do banco de dados

### 🔄 Em Desenvolvimento
- 📅 CRUD de agendamentos
- 👨‍💼 Gestão completa de barbeiros
- 🛍️ Catálogo de serviços
- 👥 Sistema de clientes
- 📈 APIs de relatórios

## 🏗️ Estrutura de Pastas

```
src/
├── controllers/        # Controladores da API
│   ├── AuthController.ts
│   ├── UserController.ts
│   ├── BarberController.ts
│   └── ...
├── entities/          # Modelos do banco (TypeORM)
│   ├── User.ts
│   ├── Barber.ts
│   ├── Service.ts
│   ├── Appointment.ts
│   └── ...
├── repositories/      # Repositórios de dados
│   ├── userRepository.ts
│   ├── barberRepository.ts
│   ├── serviceRepository.ts
│   └── appointmentRepository.ts
├── middlewares/       # Middlewares do Express
│   ├── authMiddleware.ts
│   └── error.ts
├── migrations/        # Migrações do banco
│   ├── 1749393051800-default.ts
│   └── 1749517326188-default.ts
├── seeds/            # Seeds para desenvolvimento
│   ├── createUsers.ts
│   ├── createBarbers.ts
│   ├── createServices.ts
│   ├── createAppointments.ts
│   └── index.ts
├── helpers/          # Funções auxiliares
│   └── api-errors.ts
├── @types/           # Tipagens customizadas
│   └── express.d.ts
├── data-source.ts    # Configuração do TypeORM
├── routes.ts         # Definição das rotas
└── index.ts          # Ponto de entrada
```

## 🔗 Endpoints da API

### Autenticação
```http
POST /auth/login      # Login do usuário
POST /auth/logout     # Logout do usuário
GET  /auth/me         # Dados do usuário autenticado
```

### Usuários
```http
GET    /users         # Listar usuários
GET    /users/:id     # Buscar usuário por ID
POST   /users         # Criar usuário
PUT    /users/:id     # Atualizar usuário
DELETE /users/:id     # Deletar usuário
```

### Barbeiros
```http
GET    /barbers       # Listar barbeiros
GET    /barbers/:id   # Buscar barbeiro por ID
POST   /barbers       # Criar barbeiro
PUT    /barbers/:id   # Atualizar barbeiro
DELETE /barbers/:id   # Deletar barbeiro
```

### Serviços
```http
GET    /services      # Listar serviços
GET    /services/:id  # Buscar serviço por ID
POST   /services      # Criar serviço
PUT    /services/:id  # Atualizar serviço
DELETE /services/:id  # Deletar serviço
```

### Agendamentos
```http
GET    /appointments     # Listar agendamentos
GET    /appointments/:id # Buscar agendamento por ID
POST   /appointments     # Criar agendamento
PUT    /appointments/:id # Atualizar agendamento
DELETE /appointments/:id # Deletar agendamento
```

## 🗄️ Banco de Dados

### Entidades

#### User (Usuário)
```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column({ unique: true })
  email: string

  @Column()
  password: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
```

#### Barber (Barbeiro)
```typescript
@Entity()
export class Barber {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column()
  email: string

  @Column()
  phone: string

  @Column()
  specialty: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
```

#### Service (Serviço)
```typescript
@Entity()
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column('text')
  description: string

  @Column('decimal', { precision: 10, scale: 2 })
  price: number

  @Column()
  duration: number // em minutos

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
```

## ⚙️ Configuração

### Variáveis de Ambiente
Crie um arquivo `.env` na raiz do backend:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=sua_senha
DB_DATABASE=barbearia_db

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro_aqui
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:9000
```

### TypeORM DataSource
```typescript
export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  entities: [User, Barber, Service, Appointment],
  migrations: ["src/migrations/*.ts"],
  subscribers: ["src/subscribers/*.ts"]
})
```

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev           # Inicia servidor com nodemon

# Produção
npm run build         # Compila TypeScript
npm start            # Inicia servidor compilado

# Banco de Dados
npm run typeorm       # CLI do TypeORM
npm run migration:generate -- NomeDaMigracao
npm run migration:run
npm run migration:revert

# Seeds
npm run seed         # Popula banco com dados de exemplo

# Utilitários
npm run lint         # ESLint
npm run lint:fix     # Corrige problemas do ESLint
```

## 🔐 Sistema de Autenticação

### Middleware de Autenticação
```typescript
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      res.status(401).json({ message: 'Token não fornecido' })
      return
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' })
  }
}
```

### AuthController
```typescript
export class AuthController {
  static async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body
    
    // Buscar usuário
    const user = await userRepository.findOne({ where: { email } })
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      res.status(401).json({ message: 'Credenciais inválidas' })
      return
    }

    // Gerar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    res.json({
      user: { id: user.id, name: user.name, email: user.email },
      token
    })
  }
}
```

## 📊 Seeds de Desenvolvimento

### Usuários
```typescript
export const createUsers = async (): Promise<void> => {
  const users = [
    {
      name: 'Administrador',
      email: 'admin@barbearia.com',
      password: await bcrypt.hash('admin123', 10)
    },
    // ... mais usuários
  ]

  await userRepository.save(users)
}
```

### Dados de Exemplo
- **5 usuários** com diferentes perfis
- **8 barbeiros** com especialidades variadas
- **12 serviços** com preços e durações realistas
- **20 agendamentos** distribuídos ao longo do mês

## 🔧 Desenvolvimento

### Estrutura de Controllers
```typescript
export class ExampleController {
  static async index(req: Request, res: Response): Promise<void> {
    try {
      const items = await repository.find()
      res.json(items)
    } catch (error) {
      res.status(500).json({ message: 'Erro interno do servidor' })
    }
  }

  static async show(req: Request, res: Response): Promise<void> {
    // Implementação...
  }

  static async store(req: Request, res: Response): Promise<void> {
    // Implementação...
  }

  static async update(req: Request, res: Response): Promise<void> {
    // Implementação...
  }

  static async destroy(req: Request, res: Response): Promise<void> {
    // Implementação...
  }
}
```

### Tratamento de Erros
```typescript
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Erro:', error)

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      message: error.message
    })
    return
  }

  res.status(500).json({
    message: 'Erro interno do servidor'
  })
}
```

## 🐛 Debug e Logs

### Logs de Desenvolvimento
```typescript
// AuthController.ts
console.log('🔐 Tentativa de login:', email)
console.log('✅ Login bem-sucedido para:', user.name)
console.log('🚪 Logout realizado para usuário:', req.user.id)
```

### Monitoring
- Logs estruturados para desenvolvimento
- Tratamento de erros centralizado
- Middleware de logging para requests

## 🚀 Deploy

### Variáveis de Produção
```env
NODE_ENV=production
PORT=3000
DB_SSL=true
JWT_SECRET=jwt_secret_super_seguro_para_producao
```

### Docker (Opcional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "start"]
```

---

💡 **Dica**: Para desenvolvimento, execute `npm run seed` após as migrações para popular o banco com dados de exemplo.
