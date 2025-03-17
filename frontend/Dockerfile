# Use Node.js as the base image
FROM node:18

# Set working directory inside the container
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy application code
COPY . .

# Build TypeScript -> JavaScript
RUN npm run build

# Expose the frontend port
EXPOSE 3000

# Command to run the frontend development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
