import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Clean Vite config - no external app-builder dependencies
export default defineConfig({
  plugins: [react()],
  // For GitHub Pages deployment, set base to '/sales-team-training/' 
  // or your custom domain path. Change this to '/' for root domain.
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      onwarn(warning, warn) {
        if (
          warning.code === "UNRESOLVED_IMPORT" ||
          warning.code === "MISSING_EXPORT"
        ) {
          throw new Error(`Build failed: ${warning.message}`);
        }
        warn(warning);
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  }
});
