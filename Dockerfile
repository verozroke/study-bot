FROM node:20-slim AS builder

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma

RUN npx prisma generate
RUN npm run build
RUN cp -r src/assets dist/assets


FROM node:20-slim AS runner

RUN apt-get update -y && apt-get install -y openssl

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist/assets ./dist/assets
COPY prisma ./prisma

RUN mkdir -p /app/secret

COPY entrypoint.sh .

RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
