import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Mobile-first build optimizations
    target: 'es2015', // Better browser compatibility for older mobile devices
    minify: 'esbuild', // Fast minification with esbuild
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching and loading
        manualChunks: {
          // Separate vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'framer-motion': ['framer-motion'],
          'icons': ['lucide-react'],
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 500, // Warn for chunks larger than 500kb
    cssCodeSplit: true, // Split CSS into separate files
    sourcemap: false, // Disable sourcemaps for smaller bundle
  },
  // Development server optimizations
  server: {
    hmr: {
      overlay: true,
    },
  },
});
