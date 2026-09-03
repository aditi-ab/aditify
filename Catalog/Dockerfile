FROM node:24-alpine AS build
WORKDIR /src

COPY package.json yarn.lock ./
COPY Ui/package.json Ui/package.json
COPY Identity/package.json Identity/package.json
COPY Catalog/package.json Catalog/package.json
RUN corepack enable && yarn install --frozen-lockfile

COPY Ui Ui
COPY Catalog Catalog
RUN yarn build:catalog

FROM nginxinc/nginx-unprivileged:1.29-alpine AS final
ARG APP_VERSION=0.1.0
LABEL org.opencontainers.image.version=${APP_VERSION}
COPY Catalog/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /src/Catalog/dist /usr/share/nginx/html
EXPOSE 8080
