import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs-extra';

// Custom plugin to copy _redirects
const copyRedirects = () => ({
  name: 'copy-redirects',
  writeBundle: async () => {
    await fs.copy('public/_redirects', 'dist/_redirects');
  }
});

// Custom plugin to handle SPA routing
const spa = () => ({
  name: 'spa',
  configureServer(server) {
    return () => {
      server.middlewares.use((req, res, next) => {
        if (req.url?.includes('.')) return next();
        req.url = '/';
        next();
      });
    };
  }
});

export default defineConfig({
  base: '',
  plugins: [react(), copyRedirects(), spa()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    assetsDir: 'assets',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    historyApiFallback: true,
  },
});