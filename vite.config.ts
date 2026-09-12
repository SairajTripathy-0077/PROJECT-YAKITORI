import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

const expressPlugin = (): Plugin => ({
  name: 'express-plugin',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url && req.url.startsWith('/api')) {
        try {
          const { default: app, connectToDatabase } = await import('./src/server/app.ts');
          await connectToDatabase().catch((err) => console.error('[Database Error]:', err));
          app(req, res, next);
          return;
        } catch (err) {
          console.error('[Vite Express Plugin Error]:', err);
        }
      }
      next();
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), expressPlugin()],
  server: {
    port: 5173,
    hmr: {
      overlay: true,
    },
  },
});
