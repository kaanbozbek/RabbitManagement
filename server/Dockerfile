FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies and generate package-lock.json
RUN npm install

# Copy source code
COPY . .

# Create directory for SQLite database
RUN mkdir -p /app/db && chown -R node:node /app/db

# Switch to non-root user
USER node

# Expose API port
EXPOSE 3000

# Start the server
CMD ["node", "index.js"]