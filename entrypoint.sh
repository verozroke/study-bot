#!/bin/sh

echo "Waiting for database..."
sleep 3

echo "Running migrations..."
npx prisma migrate deploy

echo "Starting bot..."
node dist/index.js
