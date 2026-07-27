# ---- builder ----
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# ---- runtime ----
FROM node:20-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# Prisma Client is generated against the schema during the build stage;
# reuse that already-generated client instead of running `prisma generate`
# again here (the `prisma` CLI is a devDependency, not installed above).
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# tsconfig's rootDir ("./") mirrors src/ under dist/src at build time, so the
# compiled app.js resolves its static-upload root as dist/tmp/uploads
# (path.resolve(__dirname, '..', 'tmp', 'uploads') from dist/src/app.js).
RUN mkdir -p tmp/uploads dist/tmp/uploads && chown -R node:node /app

USER node

EXPOSE 3000

CMD ["node", "dist/src/server.js"]
