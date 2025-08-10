# Dockerfile

# Use Node.js version 20 to meet package requirements
FROM node:20

# Set environment to non-interactive to prevent prompts during build
ENV DEBIAN_FRONTEND=noninteractive

# Install Python, pip, and all necessary system dependencies.
# ADDED: gfortran and libopenblas-dev for scientific packages like scikit-learn/numpy.
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-dev \
    git \
    build-essential \
    libffi-dev \
    pkg-config \
    libjpeg-dev \
    zlib1g-dev \
    poppler-utils \
    tesseract-ocr \
    gfortran \
    libopenblas-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package files and install Node.js dependencies
COPY package*.json ./
RUN npm install

# Copy Python requirements file
COPY requirements.txt ./
# Install Python dependencies, using --break-system-packages to fix the environment error
RUN pip3 install --no-cache-dir --break-system-packages -r requirements.txt

# Copy the rest of your backend application code
COPY api/ ./api/

# Expose the application port
EXPOSE 5000

# Command to start the server
CMD ["npm", "start"]
