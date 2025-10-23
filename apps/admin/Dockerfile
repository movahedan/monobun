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
RUN turbo prune --scope=admin --docker

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
RUN bun run build --filter=admin

FROM nginx:alpine AS runner
ENV NGINX_ENVSUBST_TEMPLATE_DIR=/etc/nginx/templates
ENV NGINX_ENVSUBST_OUTPUT_DIR=/etc/nginx/conf.d
COPY --from=build --chown=nginx:nginx --chmod=644 /app/apps/admin/nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build --chown=nginx:nginx /app/apps/admin/dist/ /usr/share/nginx/html
RUN chown -R nginx:nginx /var/cache/nginx /var/log/nginx /etc/nginx/conf.d /run && \
    chmod -R 755 /var/cache/nginx /var/log/nginx /etc/nginx/conf.d /run && \
    chmod -R 755 /etc/nginx/templates && \
    find /usr/share/nginx/html -type d -exec chmod 755 {} \; && \
    find /usr/share/nginx/html -type f -exec chmod 444 {} \;

USER nginx
CMD ["nginx", "-g", "daemon off;"]