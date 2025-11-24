import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    // 'base: ./' is critical for HBuilder X / Android WebViews to load assets with relative paths
    base: './', 
    define: {
      // Polyfill process.env for the Gemini Service
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
    }
  };
});