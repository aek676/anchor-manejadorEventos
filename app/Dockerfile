# syntax=docker/dockerfile:1
############################
#  Etapa 1 – Dependencias  #
############################
FROM node:20-slim AS deps
WORKDIR /app

# libusb runtime (las prebuilds de usb están compiladas para glibc)
RUN apt-get update \
    && apt-get install -y --no-install-recommends libusb-1.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Manifests para caché
COPY package.json package-lock.json* ./
RUN npm ci

############################
#  Etapa 2 – Build         #
############################
FROM deps AS builder
WORKDIR /app
COPY . .
RUN npm run build              # next build --output standalone (lo tienes en config)

############################
#  Etapa 3 – Runtime       #
############################
FROM node:20-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# libusb runtime otra vez (por si se eliminó al cambiar de capa)
RUN apt-get update \
    && apt-get install -y --no-install-recommends libusb-1.0-0 \
    && rm -rf /var/lib/apt/lists/*

# ─── Archivos necesarios ───────────────────────────────────────────
# 1) package.json para que npm pueda leer el script "start"
COPY --from=builder /app/package.json ./

# 2) artefacto standalone completo (manteniendo la ruta)
COPY --from=builder /app/.next/standalone ./.next/standalone

# 3) assets estáticos y public/
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public        ./public/

EXPOSE 3000
CMD ["npm", "run", "start"]
