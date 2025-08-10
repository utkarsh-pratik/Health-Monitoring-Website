# Dockerfile

# Use a standard Node.js image based on Debian
FROM node:18

# Set environment to non-interactive to prevent prompts during build
ENV DEBIAN_FRONTEND=noninteractive

# Install Python, pip, essential build tools, and dependencies for your packages.
# - build-essential, libjpeg-dev, zlib1g-dev are for packages like Pillow.
# - poppler-utils is for pdf2image.
# - tesseract-ocr is for pytesseract.
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    git \
    build-essential \
    libjpeg-dev \
    zlib1g-dev \
    poppler-utils \
    tesseract-ocr \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
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
