# Use official Node.js base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files first for better cache
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the project
COPY . .

# Generate Prisma client
RUN npx prisma generate

# (Optional) Build TypeScript project (uncomment if needed)
# RUN npm run build

# Expose no port — bot works via polling or webhook

# Default command to run bot
CMD ["npm", "run", "dev"]
