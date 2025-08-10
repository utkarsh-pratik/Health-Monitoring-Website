# Dockerfile

# Use a base image with Node.js and Python
FROM node:18-slim

# Install Python, pip, and git
RUN apt-get update && apt-get install -y python3 python3-pip git

# Set the working directory
WORKDIR /app

# Copy root package.json and install backend dependencies
COPY package*.json ./
RUN npm install

# Copy the entire api directory
COPY api/ ./api/

# Install Python dependencies from requirements.txt
# Ensure requirements.txt is inside the api/ directory or adjust the path
COPY requirements.txt ./
RUN pip3 install -r requirements.txt

# Expose the port the app runs on
EXPOSE 5000

# Command to run the application
CMD ["npm", "start"]
