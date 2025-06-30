# 🚀 Deploy Simplificado - EasyPanel com Docker Compose

## 📋 Passo a Passo Rápido

### 1️⃣ **Prepare os arquivos de ambiente**

```bash
# Na pasta raiz do projeto
cp .env.production.example .env.production
```

Edite o `.env.production` com suas configurações:

```env
# Banco de dados
DB_PASSWORD=MinhaSenh@PostgreSQL123

# JWT (gere uma chave aleatória)
JWT_SECRET=minha-chave-jwt-super-segura-aleatoria-123456789

# Email (opcional - pode configurar depois)
SMTP_HOST=smtp.gmail.com
SMTP_USER=seu-email@gmail.com
SMTP_PASS=sua-senha-de-app-google

# Domínio (se tiver)
DOMAIN=meusite.com
```

### 2️⃣ **No EasyPanel**

1. **Acesse seu painel EasyPanel**
2. **Clique em "Create Application"**
3. **Configure:**
   - **Nome**: `barbearia-app`
   - **Tipo**: `Docker Compose`
   - **Source**: Upload/Git do seu projeto
   - **Compose File**: `easypanel-compose.yml`

4. **Adicione as variáveis de ambiente:**
   ```
   DB_PASSWORD=MinhaSenh@PostgreSQL123
   JWT_SECRET=minha-chave-jwt-super-segura-aleatoria-123456789
   SMTP_HOST=smtp.gmail.com
   SMTP_USER=seu-email@gmail.com
   SMTP_PASS=sua-senha-de-app-google
   DOMAIN=meusite.com
   ```

5. **Clique em Deploy**

### 3️⃣ **URLs de Acesso**

Após o deploy:
- **Frontend**: `https://seu-dominio.com` (ou IP da VPS)
- **API**: `https://seu-dominio.com/api/health` (para testar)

**Nota**: O backend roda internamente na porta 3001 para evitar conflito com o EasyPanel (porta 3000).

### 4️⃣ **Login Inicial**

O sistema criará automaticamente um usuário admin:
- **Email**: `admin@admin.com`
- **Senha**: `admin123`

⚠️ **IMPORTANTE**: Mude essa senha imediatamente após o primeiro login!

## 🔧 **Configurações Opcionais**

### SSL/Domínio
- Configure seu domínio no DNS apontando para o IP da VPS
- O EasyPanel gerencia SSL automaticamente

### Email SMTP
- Use uma senha de app do Gmail (não a senha normal)
- Configure em: Configurações > Email no painel do sistema

## 🆘 **Se algo der errado**

Ver logs no EasyPanel:
1. Vá na aplicação
2. Clique em "Logs"
3. Verifique os serviços: `db`, `api`, `web`

## ✅ **Checklist Final**

- [ ] Arquivo `.env.production` configurado
- [ ] Aplicação criada no EasyPanel
- [ ] Variáveis de ambiente adicionadas
- [ ] Deploy realizado com sucesso
- [ ] Site acessível
- [ ] Login funcionando
- [ ] Senha admin alterada

**Pronto! Sua barbearia está online! 🎉**
