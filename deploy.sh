#!/bin/bash

# Script de deploy para EasyPanel
set -e

echo "🚀 Iniciando deploy da aplicação Barbearia..."

# Verificar se está no diretório correto
if [ ! -f "package.json" ] && [ ! -d "backend" ] && [ ! -d "frontend" ]; then
    echo "❌ Execute este script na raiz do projeto"
    exit 1
fi

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Instale o Docker primeiro."
    exit 1
fi

# Verificar se docker-compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Instale o Docker Compose primeiro."
    exit 1
fi

# Fazer build das imagens
echo "📦 Fazendo build das imagens Docker..."
docker-compose -f easypanel-compose.yml build --no-cache

# Testar se as imagens foram criadas com sucesso
echo "🔍 Verificando imagens criadas..."
docker images | grep barbearia

echo "✅ Deploy preparado com sucesso!"
echo ""
echo "📋 Próximos passos no EasyPanel:"
echo "1. Faça upload dos arquivos para seu VPS"
echo "2. Configure as variáveis de ambiente no painel"
echo "3. Execute: docker-compose -f easypanel-compose.yml up -d"
echo ""
echo "🔧 Variáveis de ambiente necessárias:"
echo "- DB_PASSWORD (senha do PostgreSQL)"
echo "- JWT_SECRET (chave secreta JWT)"
echo "- SMTP_HOST, SMTP_USER, SMTP_PASS (configurações de email)"
echo "- DOMAIN (seu domínio)"
