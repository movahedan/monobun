FROM oven/bun:1.2.22-alpine AS base
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
RUN turbo prune --scope=storefront --docker

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
RUN bun run build --filter=storefront

FROM turbo AS runner
WORKDIR /app
RUN mkdir -p .turbo/cache && chmod -R 777 .turbo
RUN addgroup --system --gid 1001 runner-group && adduser --system --uid 1001 runner-user

ARG MODE=755
ARG OWNER_MODE=765
COPY --from=pruner --chown=runner-user:runner-group /app/out/json/ .
COPY --from=installer --chown=runner-user:runner-group /app/node_modules ./node_modules
COPY --from=build --chown=runner-user:runner-group --chmod=${MODE} /app/packages/ui ./packages/ui
COPY --from=build --chown=runner-user:runner-group --chmod=${MODE} /app/packages/utils ./packages/utils
COPY --from=build --chown=runner-user:runner-group --chmod=${OWNER_MODE} /app/apps/storefront/.next ./apps/storefront/.next
COPY --from=build --chown=runner-user:runner-group --chmod=${MODE} /app/apps/storefront/public ./apps/storefront/public
COPY --from=build --chown=runner-user:runner-group --chmod=${MODE} /app/apps/storefront/next.config.ts ./apps/storefront/next.config.ts

USER runner-user
CMD ["bun", "run", "start", "--filter=storefront"]