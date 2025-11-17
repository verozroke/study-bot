
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma

RUN npx prisma generate

RUN npm run build
RUN cp -r src/assets dist/assets


FROM node:20-alpine AS runner

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

COPY --from=builder /app/dist/assets ./dist/assets


RUN mkdir -p /app/secret

# Открываем порт если нужно
EXPOSE 3000

# Запуск production версии
CMD ["node", "dist/index.js"]
