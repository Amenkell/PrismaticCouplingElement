import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',
    sourcemap: false, // Отключаем source maps для скорости
    minify: 'esbuild', // Используем esbuild для быстрой минификации
    target: 'es2020', // Современный target для Electron
    cssCodeSplit: false, // Отключаем разделение CSS для Electron
    rollupOptions: {
      output: {
        // Оптимизация для больших зависимостей
        manualChunks: {
          echarts: ['echarts', 'echarts-for-react'],
          vendor: ['react', 'react-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Увеличиваем лимит предупреждения
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  optimizeDeps: {
    exclude: ['electron'], // Исключаем electron из оптимизации зависимостей
    include: ['echarts'], // Предварительно оптимизируем echarts
  },
})
