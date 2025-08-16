# Stage 1: Build
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the NestJS app
RUN npm run build

# Stage 2: Production image
FROM node:20-alpine

WORKDIR /app

# Copy only necessary files from builder
COPY package*.json ./
RUN npm install --production

COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start the app
CMD ["node", "dist/main.js"]
