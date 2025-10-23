FROM oven/bun:1.3.1-alpine AS base
RUN bun install -g turbo@2.5.5

FROM base AS turbo
WORKDIR /app
COPY ./turbo.json ./turbo.json

FROM turbo AS pruner
WORKDIR /app
COPY ./apps ./apps
COPY ./packages ./packages
COPY ./scripts ./scripts
COPY ./package.json ./bun.lock ./
RUN turbo prune --scope=api --docker

FROM turbo AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
COPY --from=pruner /app/out/full/ .
RUN bun install --ignore-scripts

FROM turbo AS build
WORKDIR /app
COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/scripts ./scripts
COPY --from=installer /app/ .
RUN bun run build --filter=api

FROM oven/bun:1.3.1-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 runner-group
RUN adduser --system --uid 1001 runner-user
RUN chown -R runner-user:runner-group /app

COPY --from=pruner --chown=runner-user:runner-group /app/out/json/ .
COPY --from=installer --chown=runner-user:runner-group /app/node_modules ./node_modules
COPY --from=build --chown=runner-user:runner-group /app/packages/utils ./packages/utils
COPY --from=build --chown=runner-user:runner-group /app/apps/api ./apps/api

USER runner-user
CMD ["bun", "run", "./apps/api/dist/index.js"]