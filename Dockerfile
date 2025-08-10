# Dockerfile

# Use a more complete base image that includes common build tools
FROM node:18

# Set environment to non-interactive to prevent prompts during build
ENV DEBIAN_FRONTEND=noninteractive

# Install Python, pip, and the required system dependencies for your ML packages
# - poppler-utils is for the pdf2image package
# - tesseract-ocr is for the pytesseract package
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    git \
    poppler-utils \
    tesseract-ocr \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json and install Node.js dependencies
COPY package*.json ./
RUN npm install

# Copy the requirements.txt file and install Python dependencies
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy the rest of your application code
COPY api/ ./api/

# Expose the port your backend server runs on
EXPOSE 5000

# The command to start your application
CMD ["npm", "start"]
