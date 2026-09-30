import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { checker } from 'vite-plugin-checker';
import removeConsole from 'vite-plugin-remove-console';
import sassDts from 'vite-plugin-sass-dts';

// https://vite.dev/config/
export const config = defineConfig({
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  plugins: [
    react(),
    tailwindcss(),
    removeConsole(),
    sassDts(),
    checker({
      eslint: {
        dev: { logLevel: ['error'] },
        lintCommand: 'eslint .',
        useFlatConfig: true,
      },
      typescript: true,
    }),
  ],
  server: {
    allowedHosts: true,
    port: 3000,
    strictPort: true,
  },
});

// eslint-disable-next-line import/no-default-export
export default config;
