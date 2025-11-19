import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Production optimizations
    target: 'es2015', // Better browser compatibility
    minify: 'esbuild', // Fast minification
    cssMinify: true, // Minify CSS
    reportCompressedSize: true, // Show compressed size in build output
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching and loading
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            if (id.includes('emailjs')) {
              return 'emailjs';
            }
            return 'vendor'; // All other dependencies
          }
        },
        // Optimize file names for caching
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 600, // Warn for chunks larger than 600kb
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
