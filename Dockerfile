FROM node:20-slim

# Install PostgreSQL + deps
RUN apt-get update && apt-get install -y postgresql postgresql-contrib openssl

# Create postgres user directories
RUN mkdir -p /var/lib/postgresql/data && \
    chown -R postgres:postgres /var/lib/postgresql

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma

RUN npx prisma generate
RUN npm run build
RUN cp -r src/assets dist/assets

# Google Sheet credentials
RUN mkdir -p /app/secret
COPY credentials/google-sheets/biedubot-312c6f1e5bea.json /app/secret/

# Copy entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/telegrambot"

EXPOSE 3000
EXPOSE 5432

CMD ["/entrypoint.sh"]
