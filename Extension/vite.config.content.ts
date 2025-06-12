import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content/content.ts'),
      },
      output: {
        format: 'iife',
        entryFileNames: '[name].js',
      },
    },
    outDir: 'dist',
    emptyOutDir: false,
  },
})
