FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3001

# Environment variables: MONGO_URI, JWT_SECRET, ADMIN_USER, ADMIN_PASS, CORS_ORIGIN
CMD ["node", "index.js"]
