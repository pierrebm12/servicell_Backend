FROM node:22-slim
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY prisma ./prisma/
RUN npx prisma generate

COPY dist ./dist
RUN pnpm prisma:push 2>&1 || true
RUN node dist/prisma/seed.js

ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "dist/src/main"]
