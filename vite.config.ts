import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente com base no modo (development/production)
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Isso garante que o 'process.env' não quebre em alguns pacotes antigos
      'process.env': env
    },
    build: {
      // Otimização para o deploy no Vercel
      outDir: 'dist',
      sourcemap: false
    }
  };
});