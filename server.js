import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.get('/config.js', (req, res) => {
  const config = `
    window.__CONFIG__ = {
      WEBSOCKET_HOST: "${process.env.WEBSOCKET_HOST || 'localhost'}",
      WEBSOCKET_PORT: "${process.env.WEBSOCKET_PORT || '4000'}"
    };
  `;
  res.setHeader('Content-Type', 'application/javascript');
  res.send(config);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

process.on('SIGINT', shutdown);

// graceful shutdown on SIGINT
function shutdown() {
  console.log('graceful shutdown express');
  server.close(function () {
    console.log('closed express');
  });
}
