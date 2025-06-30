# 🚨 CORREÇÃO RÁPIDA - Variáveis de Ambiente EasyPanel

## Problema Identificado
```
The "DB_PASSWORD" variable is not set. Defaulting to a blank string.
The "JWT_SECRET" variable is not set. Defaulting to a blank string.
```

## ✅ Solução Imediata

### 1. **No EasyPanel, vá até sua aplicação**

### 2. **Clique em "Environment Variables" ou "Variables"**

### 3. **Adicione estas variáveis obrigatórias:**

```
DB_PASSWORD=MinhaSenh@PostgreSQL123
JWT_SECRET=minha-chave-jwt-super-segura-aleatoria-123456789
```

### 4. **Clique em "Save" e depois "Redeploy"**

## 🔒 **IMPORTANTE - Segurança**

⚠️ **Altere essas senhas para valores únicos e seguros:**

### Para gerar JWT_SECRET seguro:
```bash
# Execute no seu terminal local:
openssl rand -base64 64
```

### Para senha do banco:
- Use pelo menos 12 caracteres
- Misture letras, números e símbolos
- Não use palavras do dicionário

## 📝 **Exemplo de variáveis seguras:**

```env
DB_PASSWORD=X9k$mP2#vR8@nQ5z
JWT_SECRET=BXE7rQ9K2mN8pD5gT1yU6vI3cS7fH4jL9xW2bA8nM5eR7kP1qG6hV3oJ9wE4tY8u
SMTP_HOST=smtp.gmail.com
SMTP_USER=seu-email@gmail.com  
SMTP_PASS=sua-senha-de-app
DOMAIN=seu-dominio.com
```

## 🎯 **Após configurar:**

1. **Save** as variáveis
2. **Redeploy** a aplicação  
3. **Aguarde** o build completar
4. **Teste** o acesso ao site

A aplicação deve funcionar sem os warnings!
