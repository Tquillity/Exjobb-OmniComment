import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import fs from 'fs';

// Ensure required files are copied to dist
const copyExtensionFiles = () => ({
  name: 'copy-extension-files',
  writeBundle() {
    // Create dist/src directory if it doesn't exist
    if (!fs.existsSync('dist/src')) {
      fs.mkdirSync('dist/src', { recursive: true });
    }
    
    // Copy static files
    const files = [
      ['src/content-inject.css', 'src/content-inject.css'],
      ['src/content.js', 'src/content.js'],
      ['src/background.js', 'src/background.js'],
      ['src/utils/metamaskDetector.js', 'src/utils/metamaskDetector.js']
    ];

    files.forEach(([src, dest]) => {
      // Ensure the destination directory exists
      const destDir = `dist/${dest.split('/').slice(0, -1).join('/')}`;
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, `dist/${dest}`);
      }
    });

    // Copy manifest.json to dist
    if (fs.existsSync('manifest.json')) {
      fs.copyFileSync('manifest.json', 'dist/manifest.json');
    }

    // Create icons directory and copy icons if they exist
    const iconSizes = ['16', '48', '128'];
    const iconsDir = 'dist/icons';
    if (!fs.existsSync(iconsDir)) {
      fs.mkdirSync(iconsDir, { recursive: true });
    }
    
    iconSizes.forEach(size => {
      const iconPath = `icons/icon${size}.png`;
      if (fs.existsSync(iconPath)) {
        fs.copyFileSync(iconPath, `${iconsDir}/icon${size}.png`);
      }
    });
  }
});


export default defineConfig({
  plugins: [react(), copyExtensionFiles()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'src/background.js'),
        content: resolve(__dirname, 'src/content.js')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background' || chunkInfo.name === 'content') {
            return 'src/[name].js';
          }
          return 'assets/[name].js';
        },
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
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