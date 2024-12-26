import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import dotenv from 'dotenv';

// Load .env file
dotenv.config();

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@services': resolve(__dirname, 'src/services')
    }
  },
  define: {
    'import.meta.env.VITE_OMNI_COMMENT_CONTRACT_ADDRESS': JSON.stringify(process.env.VITE_OMNI_COMMENT_CONTRACT_ADDRESS),
  }
});