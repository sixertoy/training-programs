import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import removeConsole from 'vite-plugin-remove-console';
import sassDts from 'vite-plugin-sass-dts';
import checker from 'vite-plugin-checker';

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  plugins: [
    react(),
    removeConsole(),
    sassDts(),
    checker({
      typescript: true,
      eslint: {
        lintCommand: 'eslint .',
      },
    }),
  ],
  server: {
    allowedHosts: true,
    port: 3000,
    strictPort: true,
  },
});
