FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig*.json ./
COPY src ./src/

RUN npm install && npx prisma generate && npm run build

CMD ["node", "dist/main"]
