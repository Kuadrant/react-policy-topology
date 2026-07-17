FROM node:24-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@10.29.2

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

FROM node:24-alpine

WORKDIR /app
RUN npm install -g pnpm@10.29.2

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile
COPY --from=build /app/build ./build
COPY server.js ./

EXPOSE 5000

ENV PORT=5000
ENV WEBSOCKET_HOST=localhost
ENV WEBSOCKET_PORT=4000

CMD ["node", "server.js"]
