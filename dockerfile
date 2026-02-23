# ---------- BUILD STAGE ----------
FROM node:22-alpine AS builder

WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm install

# Copia Prisma e o código
COPY prisma ./prisma
COPY . .

# Gera Prisma Client
RUN npx prisma generate

# Build do NestJS
RUN npm run build

# ---------- PRODUCTION STAGE ----------
FROM node:22-alpine

WORKDIR /app

# Instala apenas dependências de produção
COPY package*.json ./
RUN npm install --omit=dev

# Copia build e Prisma Client
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Comando de inicialização: aplica migrations e inicia o app
CMD ["sh", "-c", "npx prisma migrate deploy --schema=/app/prisma/schema.prisma && npm run start:prod"]