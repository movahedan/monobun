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
COPY ./scripts ./scripts
RUN turbo prune --scope=@repo/ui --docker

FROM turbo AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/bun.lock ./bun.lock
RUN bun install --ignore-scripts

FROM turbo AS build
WORKDIR /app
COPY --from=pruner /app/out/full/ .
COPY --from=installer /app/ .
COPY --from=pruner /app/scripts ./scripts
RUN bun run build:storybook --filter=@repo/ui

FROM nginx:alpine AS runner
ENV NGINX_ENVSUBST_TEMPLATE_DIR=/etc/nginx/templates
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx/conf.d
COPY --from=build --chown=nginx:nginx --chmod=644 /app/packages/ui/nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build --chown=nginx:nginx --chmod=755 /app/packages/ui/dist-storybook/ /usr/share/nginx/html/
RUN chown -R nginx:nginx /var/cache/nginx /var/log/nginx /etc/nginx/conf.d /run && \
    chmod -R 755 /var/cache/nginx /var/log/nginx /etc/nginx/conf.d /run && \
    chmod -R 755 /etc/nginx/templates && \
    find /usr/share/nginx/html -type d -exec chmod 755 {} \; && \
    find /usr/share/nginx/html -type f -exec chmod 444 {} \;

USER nginx
CMD ["nginx", "-g", "daemon off;"]