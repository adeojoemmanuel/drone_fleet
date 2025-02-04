# Use Node.js 22
FROM node:22-alpine AS builder

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --include=dev

COPY . .
RUN npm run build

FROM node:22-alpine

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/migrations ./migrations
# COPY --from=builder /usr/src/app/src/config/typeorm.config.ts ./dist/config/data-source.js

EXPOSE 3000

CMD ["npm", "run", "start:prod"]
