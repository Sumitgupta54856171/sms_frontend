import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server:{
    host:'0.0.0.0',
    allowedHosts: [
      'ubuntu.newt-oratrice.ts.net' // Yahan apna Tailscale domain daal dein
    ],
    proxy: {
      '/api': {
        target: 'http://100.68.219.67:8080', // Backend ka direct IP
        changeOrigin: true,
        secure: false, // Backend HTTP par hai isliye false
      },
      '/uploads': {
        target: 'http://100.68.219.67:8080',
        changeOrigin: true,
        secure: false,
      },
    },
    port:5173,
    strictPort:true,
    cors: true,
   
   
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) return 'vendor';
          if (id.includes('node_modules/react')) return 'vendor';
          if (id.includes('node_modules/@reduxjs/toolkit') || id.includes('node_modules/react-redux')) return 'redux';
          if (id.includes('node_modules/@tanstack/react-query')) return 'query';
          if (id.includes('node_modules/lucide-react')) return 'ui';
        },
      },
    },
    target: 'es2020',
    cssMinify: 'lightningcss',
    minify: 'esbuild',
    sourcemap: false,
  },
})
