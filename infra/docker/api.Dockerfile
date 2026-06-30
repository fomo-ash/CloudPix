#Base
FROM node:22-alpine AS base

WORKDIR /app

RUN apk add --no-cache libc6-compat

RUN corepack enable

RUN corepack prepare pnpm@9.0.0 --activate

#dependencies

FROM base AS deps

COPY package.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .
COPY turbo.json .

COPY apps/api/package.json apps/api/
COPY packages/config/package.json packages/config/
COPY packages/shared/package.json packages/shared/

RUN pnpm install --frozen-lockfile

#Builder

FROM deps AS builder

COPY . .

RUN pnpm --filter @cloudpix/api build

#Runner

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN corepack enable

RUN corepack prepare pnpm@9.0.0 --activate

COPY --from=builder /app .

WORKDIR /app/apps/api

EXPOSE 3000

CMD ["pnpm", "start"]