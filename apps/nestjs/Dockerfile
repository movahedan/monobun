FROM oven/bun:1.3.14-alpine AS base
RUN bun install -g turbo@2.5.5

FROM base AS turbo
WORKDIR /app
COPY ./turbo.json ./turbo.json

FROM turbo AS pruner
WORKDIR /app
COPY ./apps ./apps
COPY ./packages ./packages
COPY ./tools ./tools
COPY ./package.json ./bun.lock ./
RUN turbo prune --scope=@apps/nestjs --docker

FROM turbo AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN --mount=type=cache,target=/root/.bun/install/cache,id=monobun-bun-cache-nestjs \
	bun install --ignore-scripts

FROM turbo AS build
WORKDIR /app
COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/tools ./tools
COPY --from=installer /app/ .
RUN bun run build --filter=@apps/nestjs

FROM oven/bun:1.3.14-alpine AS runner
WORKDIR /app
RUN addgroup --system --gid 1001 runner-group \
	&& adduser --system --uid 1001 runner-user \
	&& chown runner-user:runner-group /app

COPY --from=pruner /app/out/json/ .
COPY --from=installer /app/node_modules ./node_modules
COPY --from=build /app/packages/utils ./packages/utils
COPY --from=build /app/apps/nestjs ./apps/nestjs

RUN chmod -R a-w /app \
	&& chown -R runner-user:runner-group /app

USER runner-user
ENV HOST=0.0.0.0
CMD ["bun", "run", "./apps/nestjs/dist/index.js"]
