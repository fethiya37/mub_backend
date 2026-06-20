FROM node:20-alpine AS builder
WORKDIR /app

ARG DATABASE_URL="postgresql://postgres:postgres@postgres:5432/mub_db?schema=public"
ENV DATABASE_URL=$DATABASE_URL
ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY package*.json ./
COPY prisma ./prisma

RUN npm config set fetch-timeout 600000 && npm ci --no-audit --no-fund
RUN npx prisma generate

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY package*.json ./
COPY prisma ./prisma

RUN npm config set fetch-timeout 600000 && npm ci --omit=dev --no-audit --no-fund

COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/src/main.js"]