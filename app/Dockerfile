# Dockerfile para aplicación Next.js con dependencias nativas
FROM node:18-slim AS base

# Instalar dependencias solo cuando sea necesario
FROM base AS deps
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    libusb-1.0-0-dev \
    libudev-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Instalar dependencias basadas en el gestor de paquetes preferido
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Configurar Python para node-gyp
ENV PYTHON=/usr/bin/python3

RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci; \
    elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm i --frozen-lockfile; \
    else echo "Lockfile not found." && exit 1; \
    fi

# Reconstruir el código fuente solo cuando sea necesario
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno para el build
ENV NEXT_TELEMETRY_DISABLED 1

# Construir la aplicación
RUN \
    if [ -f yarn.lock ]; then yarn run build; \
    elif [ -f package-lock.json ]; then npm run build; \
    elif [ -f pnpm-lock.yaml ]; then yarn global add pnpm && pnpm run build; \
    else echo "Lockfile not found." && exit 1; \
    fi

# Imagen de producción, copiar todos los archivos y ejecutar next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Aprovechar las salidas de trazado automático para reducir el tamaño de la imagen
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["npm", "run", "start"]