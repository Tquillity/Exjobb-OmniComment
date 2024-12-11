import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

function copyManifest() {
  return {
    name: 'copy-manifest',
    writeBundle() {
      fs.copyFileSync('manifest.json', 'dist/manifest.json');
      
      // Ensure icons directory exists
      if (!fs.existsSync('dist/icons')) {
        fs.mkdirSync('dist/icons', { recursive: true });
      }
      
      // Copy icons
      const iconSizes = ['16', '48', '128'];
      iconSizes.forEach(size => {
        fs.copyFileSync(
          `../public/icons/icon${size}.png`,
          `dist/icons/icon${size}.png`
        );
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), copyManifest()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@services': resolve(__dirname, 'src/services')
    }
  }
});