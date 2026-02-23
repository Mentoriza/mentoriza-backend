# ---------- BUILD STAGE ----------
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# ---------- PRODUCTION STAGE ----------
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

# Adiciona estas linhas temporariamente para debug
RUN ls -la dist || echo "dist folder not found"
RUN cat dist/main.js 2>/dev/null || echo "main.js not found or empty"

CMD ["node", "dist/main.js"]