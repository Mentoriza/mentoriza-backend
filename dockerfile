FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

RUN ls -la /app/node_modules/.prisma/client || echo "Directory .prisma/client not found!"
RUN ls -la /app/prisma/migrations || echo "Directory migrations not copied!"

CMD ["sh", "-c", "npx prisma migrate deploy --schema=/app/prisma/schema.prisma && npm run start:prod"]