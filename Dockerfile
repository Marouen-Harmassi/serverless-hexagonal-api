FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
COPY tsconfig*.json ./
COPY serverless.yml ./

RUN pnpm install

COPY src ./src
COPY tests ./tests

RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "dev"]
