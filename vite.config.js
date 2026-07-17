import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// serves /config.js in dev, mirroring server.js in production
const devConfigJs = () => ({
  name: 'dev-config-js',
  configureServer(server) {
    server.middlewares.use('/config.js', (req, res) => {
      res.setHeader('Content-Type', 'application/javascript');
      res.end(`window.__CONFIG__ = {
        WEBSOCKET_HOST: "${process.env.WEBSOCKET_HOST || 'localhost'}",
        WEBSOCKET_PORT: "${process.env.WEBSOCKET_PORT || '4000'}"
      };`);
    });
  },
});

export default defineConfig({
  plugins: [react(), devConfigJs()],
  server: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: true,
  },
  build: {
    outDir: 'build',
  },
});
