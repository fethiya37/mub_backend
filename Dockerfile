FROM node:20-alpine AS builder
WORKDIR /app

ARG DATABASE_URL="postgresql://postgres:postgres@postgres:5432/mub_db?schema=public"
ENV DATABASE_URL=$DATABASE_URL
ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci
RUN npx prisma generate

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci --omit=dev

COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/src/main.js"]FROM node:20-alpine AS builder
WORKDIR /app

ARG DATABASE_URL="postgresql://postgres:postgres@postgres:5432/mub_db?schema=public"
ENV DATABASE_URL=$DATABASE_URL
ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci
RUN npx prisma generate

COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PUPPETEER_SKIP_DOWNLOAD=true

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci --omit=dev

COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma /app/node_modules/@prisma
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/src/main.js"]