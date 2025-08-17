# Dockerfile

# Stage 1: Build the client
FROM node:18-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Stage 2: Build the server
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY api/ ./api/

# Copy built client from the previous stage
COPY --from=client-builder /app/client/dist ./client/dist

# Expose the application port
EXPOSE 5000

# Command to start the server
CMD ["npm", "start"]
