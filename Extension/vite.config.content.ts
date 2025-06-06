import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
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
