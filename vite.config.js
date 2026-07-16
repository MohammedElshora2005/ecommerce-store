// ecommerce-store/vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@context': '/src/context',
      '@hooks': '/src/hooks',
      '@utils': '/src/utils',
      '@api': '/src/api',
      '@styles': '/src/styles',
      '@assets': '/src/assets',
      '@lib': '/src/lib',
    },
  },

  server: {
    port: 3000,
    host: true,
    open: true,
  },

  build: {
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
          heroicons: ['@heroicons/react'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@supabase/supabase-js'],
    exclude: ['@supabase/realtime-js'], // ✅ منع مشكلة Realtime subscriptions
  },

  envPrefix: ['VITE_', 'REACT_APP_'],
});
