FROM oven/bun:1.3.14-debian AS build

WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

COPY . .

RUN bun run generate

FROM nginx:1.27.5-alpine

ARG APP_VERSION=0.0.0
ARG BUILD_SHA=unknown
ARG SOURCE_URL=https://github.com/Delph/bass
ARG BUILD_DATE

LABEL org.opencontainers.image.title="BASS" \
      org.opencontainers.image.description="Browser Armour Set Search for Monster Hunter" \
      org.opencontainers.image.version=$APP_VERSION \
      org.opencontainers.image.revision=$BUILD_SHA \
      org.opencontainers.image.source=$SOURCE_URL \
      org.opencontainers.image.created=$BUILD_DATE

COPY deployment/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/.output/public /usr/share/nginx/html

EXPOSE 80
