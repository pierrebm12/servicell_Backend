FROM node:22-slim
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN corepack enable && pnpm install --frozen-lockfile

COPY prisma ./prisma/
RUN npx prisma generate

COPY dist ./dist

ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "dist/main"]
