import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages: https://cy-98.github.io/stock-learning/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/stock-learning/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    port: 5173,
    host: true,
  },
});
