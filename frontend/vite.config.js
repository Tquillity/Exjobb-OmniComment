import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

function copyManifestAndIcons() {
  return {
    name: 'copy-manifest-and-icons',
    writeBundle() {
      // Copy manifest
      if (fs.existsSync('manifest.json')) {
        fs.copyFileSync('manifest.json', 'dist/manifest.json');
      }
      
      // Create icons directory if it doesn't exist
      if (!fs.existsSync('dist/icons')) {
        fs.mkdirSync('dist/icons', { recursive: true });
      }
      
      // Copy icons if they exist
      const iconSizes = ['16', '48', '128'];
      iconSizes.forEach(size => {
        const iconPath = `icons/icon${size}.png`;
        if (fs.existsSync(iconPath)) {
          fs.copyFileSync(iconPath, `dist/icons/icon${size}.png`);
          // Also copy to the dev server public directory
          if (!fs.existsSync('public/icons')) {
            fs.mkdirSync('public/icons', { recursive: true });
          }
          fs.copyFileSync(iconPath, `public/icons/icon${size}.png`);
        }
      });

      // Create assets directory if it doesn't exist
      if (!fs.existsSync('dist/assets')) {
        fs.mkdirSync('dist/assets', { recursive: true });
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), copyManifestAndIcons()],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    // Add static file serving for icons
    fs: {
      allow: ['..']
    }
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        connect: resolve(__dirname, 'connect.html'),
        background: resolve(__dirname, 'src/extension/background.js')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background.js';
          }
          return 'assets/[name].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name].[ext]',
        inlineDynamicImports: false
      }
    },
    cssCodeSplit: false,
    cssTarget: 'chrome89'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@pages': resolve(__dirname, 'src/pages'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@services': resolve(__dirname, 'src/services'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@assets': resolve(__dirname, 'src/assets')
    }
  }
});