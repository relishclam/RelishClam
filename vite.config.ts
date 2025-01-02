import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs-extra';

// Custom plugin to copy _redirects
const copyRedirects = () => ({
  name: 'copy-redirects',
  closeBundle: async () => {
    await fs.copy('public/_redirects', 'dist/_redirects');
  }
});

export default defineConfig({
  plugins: [react(), copyRedirects()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});