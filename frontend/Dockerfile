# Frontend Dockerfile
FROM node:18-alpine as build

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Estágio de produção com nginx
FROM nginx:alpine

# Copiar arquivos buildados
COPY --from=build /app/dist/spa /usr/share/nginx/html

# Copiar configuração customizada do nginx se necessário
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta
EXPOSE 80

# Comando padrão do nginx
CMD ["nginx", "-g", "daemon off;"]
