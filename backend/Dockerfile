FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig*.json nest-cli.json ./
COPY src ./src

RUN npm run build

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

ARG APP_NAME
ENV APP_NAME=${APP_NAME}

RUN apk add --no-cache dumb-init
ENTRYPOINT ["dumb-init", "--"]

CMD ["sh", "-c", "node dist/apps/${APP_NAME}/main.js"]
