import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Configurações específicas para suprimir warnings conhecidos
      babel: {
        plugins: [],
      },
    })
  ],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    // Suprimir warnings específicos do react-beautiful-dnd
    __DEV__: JSON.stringify(false),
  },
  esbuild: {
    // Remover console.warn em produção para suprimir warnings
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
  server: {
    // Configurações do servidor de desenvolvimento
    hmr: {
      overlay: {
        warnings: false, // Não mostrar warnings no overlay
      }
    }
  }
});
