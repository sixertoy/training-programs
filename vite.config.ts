import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import removeConsole from 'vite-plugin-remove-console';
import sassDts from 'vite-plugin-sass-dts';

// https://vite.dev/config/
export default defineConfig({
  build: {
    outDir: 'build',
    sourcemap: true,
  },
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset()],
    }),
    tailwindcss(),
    removeConsole(),
    sassDts(),
    checker({
      eslint: {
        dev: { logLevel: ['error'] },
        lintCommand: 'eslint "./src"',
        useFlatConfig: true,
      },
      overlay: false,
      typescript: true,
    }),
  ],
  server: {
    allowedHosts: true,
    port: 3000,
    strictPort: true,
  },
});
