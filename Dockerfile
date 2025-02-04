# Use Node.js 22
FROM node:22-alpine

WORKDIR /app

COPY package.json ./

COPY package-lock.json ./

RUN npm install --frozen-lockfile

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:prod"]