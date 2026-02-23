# ---------- BUILD STAGE ----------
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
COPY . .
RUN npx prisma generate    
RUN npm run build

# ---------- PRODUCTION STAGE ----------
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev


COPY --from=builder /app/dist ./dist


COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma


RUN ls -la /app/node_modules/.prisma/client || echo "Pasta .prisma/client não encontrada no prod stage"


CMD ["npm", "run", "start:prod"]
