# Use Node.js 18 Alpine as base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Install dependencies first for efficient Docker caching
COPY package.json package-lock.json ./

# Install ALL dependencies (including dev dependencies)
RUN npm install

# Copy the entire project
COPY . .

# Run the TypeScript build process
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Start the application in production mode
CMD ["npm", "run", "start:prod"]
