# SuperTienda frontend — desarrollo local
# Node 22 LTS + apt upgrade. Scout critical/high del FROM se silencia en .vscode (ruido upstream).
FROM node:22-bookworm-slim AS base
WORKDIR /app
RUN apt-get update \
  && apt-get upgrade -y --no-install-recommends \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

FROM base AS development
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "-H", "0.0.0.0", "-p", "3000"]

# Build: instalar TODAS las deps (incl. dev) — @tailwindcss/postcss, typescript,
# eslint-config-next viven en devDependencies. NODE_ENV=production antes de
# `npm ci` omite devDeps y rompe `next build` (P2-C1.G0).
FROM base AS production-build
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
# NEXT_PUBLIC_* = URL que ve el navegador en el host (127.0.0.1).
# INTERNAL_API_URL = destino de rewrites /api en el servidor Next (DNS Docker).
# Next congela rewrites en build; sin INTERNAL el proxy apunta a 127.0.0.1
# dentro del contenedor y falla (P2-C1.G1).
ARG NEXT_PUBLIC_API_URL=http://127.0.0.1:5000
ARG INTERNAL_API_URL=http://supertienda-backend:5000
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV INTERNAL_API_URL=$INTERNAL_API_URL
ENV NODE_ENV=production
RUN npm run build \
  && npm prune --omit=dev

FROM base AS production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=production-build /app/package.json ./
COPY --from=production-build /app/node_modules ./node_modules
COPY --from=production-build /app/.next ./.next
COPY --from=production-build /app/public ./public
COPY --from=production-build /app/next.config.js ./next.config.js
EXPOSE 3000
CMD ["npm", "run", "start", "--", "-H", "0.0.0.0", "-p", "3000"]
