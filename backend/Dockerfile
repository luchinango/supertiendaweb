# SuperTienda backend — desarrollo local
# Node 22 LTS + apt upgrade. Scout critical/high del FROM se silencia en .vscode (ruido upstream).
FROM node:22-bookworm-slim AS base
WORKDIR /app
# python3/make/g++: dependencias nativas (p. ej. iconv vía node-escpos)
RUN apt-get update \
  && apt-get upgrade -y --no-install-recommends \
  && apt-get install -y --no-install-recommends \
    openssl \
    ca-certificates \
    wget \
    python3 \
    make \
    g++ \
  && rm -rf /var/lib/apt/lists/*

FROM base AS development
ENV NODE_ENV=development
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
# Generar cliente Prisma (no aplica migraciones ni db push)
RUN npx prisma generate || true
EXPOSE 5000
CMD ["sh", "-c", "npx prisma generate && npm run build:tsoa && npm run dev"]

FROM base AS production-build
ENV NODE_ENV=production
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npx prisma generate && npm run build:full

FROM base AS production
ENV NODE_ENV=production
COPY --from=production-build /app/package.json /app/package-lock.json* ./
COPY --from=production-build /app/node_modules ./node_modules
COPY --from=production-build /app/dist ./dist
COPY --from=production-build /app/prisma ./prisma
COPY --from=production-build /app/keys ./keys
EXPOSE 5000
CMD ["node", "dist/src/index.js"]
