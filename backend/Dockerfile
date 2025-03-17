# Use Node.js 18 as base
FROM node:18

# Create app directory
WORKDIR /app

# Copy package.json, package-lock.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your backend code
COPY . .

# Build TypeScript -> JavaScript
RUN npm run build

# Generate Prisma client inside the Docker container
RUN npx prisma generate

# Expose the backend port
EXPOSE 4000

# Run the compiled code
CMD ["npm", "start"]
