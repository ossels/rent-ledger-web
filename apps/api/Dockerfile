# Build from the repo root:  docker build -f apps/api/Dockerfile .
# Dev deps stay in the image on purpose — the one-shot migrate service runs
# `npx prisma migrate deploy` from this same image (mirrors the invoicy setup).
FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/api/package.json apps/api/package.json
RUN npm ci --workspace apps/api

COPY apps/api apps/api
WORKDIR /app/apps/api
RUN npx prisma generate && npm run build

ENV NODE_ENV=production
EXPOSE 4000
CMD ["node", "dist/main.js"]
