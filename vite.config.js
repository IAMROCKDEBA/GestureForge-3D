import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['manifest.json'],
      manifest: {
        name: 'GestureForge 3D',
        short_name: 'GestureForge',
        description: 'AR hand-tracking 3D creation studio',
        theme_color: '#020408',
        background_color: '#020408',
        display: 'standalone',
        orientation: 'any',
        start_url: '/'
      }
    })
  ],
  server: {
    host: '127.0.0.1',
    port: 5173
  },
  build: {
    target: 'es2022',
    sourcemap: true
  },
  optimizeDeps: {
    include: ['three', 'cannon-es', 'zustand', 'howler', 'gsap']
  }
});
