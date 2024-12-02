import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import fs from 'fs';

// Ensure content-inject.css exists and is copied to dist
const ensureContentInjectCss = () => ({
  name: 'ensure-content-inject-css',
  writeBundle() {
    // Create dist/src directory if it doesn't exist
    if (!fs.existsSync('dist/src')) {
      fs.mkdirSync('dist/src', { recursive: true });
    }
    // Copy content-inject.css to dist
    fs.copyFileSync('src/content-inject.css', 'dist/src/content-inject.css');
  }
});

export default defineConfig({
  plugins: [react(), ensureContentInjectCss()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        content: resolve(__dirname, 'src/content.js'),
        background: resolve(__dirname, 'src/background.js')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'content' || chunkInfo.name === 'background') {
            return `src/${chunkInfo.name}.js`;
          }
          return '[name].[hash].js';
        }
      }
    }
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  }
});