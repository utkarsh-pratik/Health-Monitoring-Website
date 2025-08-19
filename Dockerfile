# Use a standard Node.js base image
FROM node:18-slim

# Set the working directory
WORKDIR /app

# Copy all Node.js package files
COPY package.json ./
COPY package-lock.json ./
COPY client/package.json ./client/
COPY client/package-lock.json ./client/

# Install all Node.js dependencies
RUN npm install
RUN npm install --prefix client

# Copy the rest of the application code
COPY . .

# Build the React client
RUN npm run build --prefix client

# Expose the application port
EXPOSE 5000

# Command to start the server
CMD ["npm", "start"]

