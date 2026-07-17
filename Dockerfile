FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install --only=production
COPY --from=build /app/build ./build
COPY server.js ./

EXPOSE 5000

ENV PORT=5000
ENV WEBSOCKET_HOST=localhost
ENV WEBSOCKET_PORT=4000

CMD ["node", "server.js"]
