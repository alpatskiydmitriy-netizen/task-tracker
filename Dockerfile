FROM --platform=linux/amd64 node:20-bookworm-slim AS base

# --- deps: ставим зависимости отдельным слоем для кэширования ---
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# --- builder: собираем приложение ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# --- runner: минимальный образ для запуска ---
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/scripts ./scripts
COPY --from=deps /app/node_modules/drizzle-orm ./node_modules/drizzle-orm
COPY --from=deps /app/node_modules/@libsql ./node_modules/@libsql
COPY --from=deps /app/node_modules/libsql ./node_modules/libsql
COPY --from=deps /app/node_modules/js-base64 ./node_modules/js-base64
COPY --from=deps /app/node_modules/promise-limit ./node_modules/promise-limit
COPY --from=deps /app/node_modules/ws ./node_modules/ws
COPY --from=deps /app/node_modules/@neon-rs ./node_modules/@neon-rs
COPY entrypoint.sh ./entrypoint.sh

RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data
RUN chmod +x /app/entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV DATABASE_PATH=/app/data/tasks.db

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "server.js"]
