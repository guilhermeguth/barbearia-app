# 🚀 Deploy no EasyPanel - Sistema de Barbearia

Este guia mostra como fazer deploy da aplicação de barbearia em uma VPS usando EasyPanel.

## 📋 Pré-requisitos

- VPS com Ubuntu/Debian
- EasyPanel instalado na VPS
- Docker e Docker Compose
- Domínio configurado (opcional)

## 🔧 Configuração Inicial

### 1. Preparar arquivos de ambiente

Copie o arquivo de exemplo e configure suas variáveis:

```bash
cp .env.production.example .env.production
```

Edite o arquivo `.env.production` com suas configurações:

```env
# Banco de dados
DB_PASSWORD=sua_senha_postgresql_segura

# JWT
JWT_SECRET=seu_jwt_secret_muito_seguro_aqui

# Email (opcional)
SMTP_HOST=smtp.gmail.com
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app

# Domínio
DOMAIN=seu-dominio.com
```

### 2. Build e teste local (opcional)

```bash
# Testar localmente
docker-compose up --build

# Ou usar o script de deploy
./deploy.sh
```

## 🌐 Deploy no EasyPanel

### Método 1: Via Interface do EasyPanel

1. **Acesse o EasyPanel** em sua VPS
2. **Crie uma nova aplicação**
3. **Configure o repositório Git** ou faça upload dos arquivos
4. **Configure as variáveis de ambiente** no painel
5. **Deploy** usando o arquivo `easypanel-compose.yml`

### Método 2: Via SSH

1. **Conecte-se à VPS:**
```bash
ssh seu-usuario@ip-da-vps
```

2. **Faça upload dos arquivos:**
```bash
# Opção 1: Git clone
git clone https://github.com/seu-usuario/barbearia-app.git
cd barbearia-app

# Opção 2: SCP
scp -r ./barbearia-app seu-usuario@ip-da-vps:/home/seu-usuario/
```

3. **Configure variáveis de ambiente:**
```bash
cp .env.production.example .env.production
nano .env.production  # Configure suas variáveis
```

4. **Execute o deploy:**
```bash
docker-compose -f easypanel-compose.yml up -d
```

## 🔒 Configurações de Segurança

### 1. Firewall
```bash
# Permitir apenas portas necessárias
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

### 2. SSL/HTTPS (via EasyPanel)
- Configure certificado SSL no painel do EasyPanel
- O EasyPanel gerencia automaticamente Let's Encrypt

### 3. Backup do Banco
```bash
# Script de backup automático
docker exec -t postgres_container pg_dump -U postgres barbearia_db > backup_$(date +%Y%m%d).sql
```

## 📊 Monitoramento

### Logs da aplicação
```bash
# Ver logs do backend
docker-compose -f easypanel-compose.yml logs api

# Ver logs do frontend
docker-compose -f easypanel-compose.yml logs web

# Ver logs do banco
docker-compose -f easypanel-compose.yml logs db
```

### Status dos serviços
```bash
docker-compose -f easypanel-compose.yml ps
```

## 🔧 Manutenção

### Atualizar aplicação
```bash
# Pull das alterações
git pull origin main

# Rebuild e restart
docker-compose -f easypanel-compose.yml down
docker-compose -f easypanel-compose.yml up --build -d
```

### Backup e Restore

#### Backup:
```bash
# Backup do banco
docker exec postgres_container pg_dump -U postgres barbearia_db > backup.sql

# Backup de uploads/arquivos
docker cp container_name:/app/uploads ./uploads_backup
```

#### Restore:
```bash
# Restore do banco
docker exec -i postgres_container psql -U postgres barbearia_db < backup.sql
```

## 🌟 Funcionalidades da Aplicação

- ✅ **Gestão de Barbeiros** - Cadastro, edição e horários de trabalho
- ✅ **Gestão de Clientes** - Cadastro e vinculação de usuários
- ✅ **Gestão de Serviços** - Preços e durações
- ✅ **Sistema de Agendamentos** - Agenda completa
- ✅ **Autenticação JWT** - Sistema seguro de login
- ✅ **Recuperação de Senha** - Via email SMTP
- ✅ **Configurações SMTP** - Painel administrativo
- ✅ **Interface Responsiva** - Quasar Framework
- ✅ **API RESTful** - Node.js + TypeScript + TypeORM

## 🆘 Troubleshooting

### Erro de conexão com banco
```bash
# Verificar se o PostgreSQL está rodando
docker-compose -f easypanel-compose.yml logs db

# Verificar variáveis de ambiente
docker-compose -f easypanel-compose.yml config
```

### Erro 500 no backend
```bash
# Ver logs detalhados
docker-compose -f easypanel-compose.yml logs api

# Verificar configurações JWT
echo $JWT_SECRET
```

### Frontend não carrega
```bash
# Verificar proxy do nginx
docker-compose -f easypanel-compose.yml logs web

# Testar conexão com backend
curl http://localhost:3000/health
```

## 📞 Suporte

Para suporte, verifique os logs e consulte a documentação do EasyPanel.

---

**Desenvolvido com ❤️ para barbeiros profissionais**
