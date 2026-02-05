#!/bin/bash
set -e

echo "📌 Starting embedded PostgreSQL..."

# Ensure permissions
chown -R postgres:postgres /var/lib/postgresql

# Run initdb if needed
if [ ! -d "/var/lib/postgresql/data/base" ]; then
  echo "🗄️  Initializing database cluster..."
  su postgres -c "/usr/lib/postgresql/15/bin/initdb -D /var/lib/postgresql/data"
fi

echo "🚀 Starting PostgreSQL..."
su postgres -c "/usr/lib/postgresql/15/bin/pg_ctl -D /var/lib/postgresql/data -o \"-p 5432\" start"

sleep 3

echo "📚 Ensuring database exists..."
su postgres -c "psql -tc \"SELECT 1 FROM pg_database WHERE datname='telegrambot'\" | grep -q 1 || psql -c \"CREATE DATABASE telegrambot\""

echo "📦 Running Prisma migrations..."
npx prisma migrate deploy

echo "🤖 Starting Node bot..."
node dist/index.js
