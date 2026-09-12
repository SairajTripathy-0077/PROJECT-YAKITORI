import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const expressPlugin = (): Plugin => ({
  name: 'express-plugin',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url && req.url.startsWith('/api')) {
        try {
          const appPath = pathToFileURL(path.resolve(process.cwd(), 'src/server/app.ts')).href;
          const serverModule: any = await import(/* @vite-ignore */ appPath);
          if (serverModule.connectToDatabase) {
            await serverModule.connectToDatabase().catch((err: unknown) => console.error('[Database Error]:', err));
          }
          serverModule.default(req, res, next);
          return;
        } catch (err) {
          console.error('[Vite Express Plugin Error]:', err);
        }
      }
      next();
    });
  },
});

export default defineConfig({
  plugins: [react(), expressPlugin()],
  optimizeDeps: {
    include: ['recharts'],
  },
  server: {
    port: 5173,
    hmr: {
      overlay: true,
    },
  },
});

