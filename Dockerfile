# Use a Node.js base image that includes Python and build tools
FROM node:18-slim

# Set the working directory
WORKDIR /app

# Install Python, pip, and Git
RUN apt-get update && apt-get install -y python3 python3-pip git

# Copy all Python-related files first
COPY requirements.txt ./
COPY api/label_encoder.joblib ./api/
COPY api/rf_model.joblib ./api/
COPY api/ml/ ./api/ml/

# Install Python dependencies
# FIX: Add the --break-system-packages flag to override the environment protection
RUN pip3 install -r requirements.txt --break-system-packages

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

