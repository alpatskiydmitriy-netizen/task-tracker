FROM node:20-bookworm-slim AS base

# --- deps: ставим зависимости отдельным слоем для кэширования ---
FROM base AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci

# --- builder: собираем приложение ---
FROM base AS builder
WORKDIR /app
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- runner: минимальный образ для запуска ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Собираем build-инструменты и сразу нативный модуль better-sqlite3 —
# так бинарник гарантированно совместим именно с этой машиной запуска,
# независимо от того, где и на какой архитектуре собирался образ.
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
RUN npm install -g node-gyp

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/scripts ./scripts
COPY --from=deps /app/node_modules/drizzle-orm ./node_modules/drizzle-orm

# Полный пакет better-sqlite3 (с исходниками) вместо урезанной трассированной версии
RUN rm -rf ./node_modules/better-sqlite3
COPY --from=deps /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=deps /app/node_modules/node-addon-api ./node_modules/node-addon-api
RUN cd node_modules/better-sqlite3 && npm run build-release

COPY entrypoint.sh ./entrypoint.sh

RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data /app/node_modules/better-sqlite3
RUN chmod +x /app/entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATABASE_PATH=/app/data/tasks.db

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "server.js"]
