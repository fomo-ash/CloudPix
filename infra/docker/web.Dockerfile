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
COPY apps/worker/package.json apps/worker/
COPY apps/web/package.json apps/web/

COPY packages/config/package.json packages/config/
COPY packages/shared/package.json packages/shared/
COPY packages/aws/package.json packages/aws/
COPY packages/env/package.json packages/env/
COPY packages/database/package.json packages/database/

RUN pnpm install --frozen-lockfile

#Builder

FROM deps AS builder

COPY . .

RUN pnpm --filter @cloudpix/shared build && pnpm --filter @cloudpix/web build

#Runner

FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN corepack enable

RUN corepack prepare pnpm@9.0.0 --activate

COPY --from=builder /app .

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["pnpm", "start"]
