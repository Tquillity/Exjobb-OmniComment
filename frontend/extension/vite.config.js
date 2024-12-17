import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        content: resolve(__dirname, 'src/content.js')
      },
      output: {
        entryFileNames: chunk => {
          if (chunk.name === 'content') {
            return 'src/[name].js';
          }
          return 'assets/[name]-[hash].js';
        }
      }
    }
  },
  server: {
    port: 5173,
    strictPort: true
  }
});