FROM node:24-alpine AS build
WORKDIR /app
RUN npm install -g pnpm@10.29.2

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY runner/package.json runner/
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

FROM node:24-alpine

WORKDIR /app
RUN npm install -g pnpm@10.29.2

# install only the runner's production deps (express + dotenv, pinned exact).
# devDependencies are stripped first: the workspace: link in them cannot
# resolve outside the workspace
COPY runner/package.json ./package.json.full
RUN node -e "const fs = require('fs'); const p = JSON.parse(fs.readFileSync('package.json.full')); fs.writeFileSync('package.json', JSON.stringify({ name: p.name, version: p.version, type: p.type, dependencies: p.dependencies }, null, 2));" \
  && rm package.json.full \
  && pnpm install --prod --ignore-workspace

COPY --from=build /app/runner/build ./build
COPY runner/server.js ./

EXPOSE 5000

ENV PORT=5000
ENV WEBSOCKET_HOST=localhost
ENV WEBSOCKET_PORT=4000

CMD ["node", "server.js"]
