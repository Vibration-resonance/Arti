import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs'

// Plugins utilitaires (copie manifest, html, css)
function copyManifest() {
  return {
    name: 'copy-manifest',
    buildStart() {
      if (!existsSync('dist')) {
        mkdirSync('dist', { recursive: true })
      }
      copyFileSync('public/manifest.json', 'dist/manifest.json')
    }
  }
}
function copyHtmlFiles() {
  return {
    name: 'copy-html-files',
    writeBundle() {
      function fixHtmlPaths(filePath, outputPath) {
        if (existsSync(filePath)) {
          let content = readFileSync(filePath, 'utf-8')
          content = content.replace(/src="\.\.\/\.\.\//g, 'src="')
          content = content.replace(/href="\.\.\/\.\.\//g, 'href="')
          writeFileSync(outputPath, content)
        }
      }
      fixHtmlPaths('dist/src/popup/popup.html', 'dist/popup.html')
      fixHtmlPaths('dist/src/options/options.html', 'dist/options.html')
      if (existsSync('src/content/content.css')) {
        copyFileSync('src/content/content.css', 'dist/content.css')
      }
    }
  }
}
function fixBackgroundScript() {
  return {
    name: 'fix-background-script',
    writeBundle() {
      const backgroundPath = 'dist/background.js'
      if (existsSync(backgroundPath)) {
        let content = readFileSync(backgroundPath, 'utf-8')
        content = content.replace(/export\s*\{[^}]*\}\s*;?\s*$/, '')
        content = content.replace(/export\s+.*$/, '')
        content = content.replace(/import\.meta\.url/g, '"chrome-extension://" + chrome.runtime.id')
        content = content.replace(/(Promise\.resolve\(\)\.then\(\(\)\s*=>.*?)import\.meta\.url(.*?\))/g, '$1"chrome-extension://" + chrome.runtime.id$2')
        content = content.replace(/typeof window<"u"/g, 'typeof self!=="undefined"')
        content = content.replace(/typeof window!=="undefined"/g, 'typeof self!=="undefined"')
        content = content.replace(/typeof window>"u"/g, 'typeof self==="undefined"')
        content = content.replace(/typeof window=="undefined"/g, 'typeof self==="undefined"')
        content = content.replace(/window\.WebSocket/g, 'self.WebSocket')
        content = content.replace(/window\.Worker/g, 'self.Worker')
        content = content.replace(/window\.location/g, 'self.location')
        content = content.replace(/window\.addEventListener/g, 'self.addEventListener')
        content = content.replace(/window\.removeEventListener/g, 'self.removeEventListener')
        content = content.replace(/window\.dispatchEvent/g, 'self.dispatchEvent')
        content = content.replace(/window\.BroadcastChannel/g, 'self.BroadcastChannel')
        content = content.replace(/window\.history/g, 'self.history')
        content = content.replace(/window\.localStorage/g, 'self.localStorage')
        content = content.replace(/typeof window<"u"\s*\|\|\s*typeof document<"u"/g, 'typeof self!=="undefined"')
        content = content.replace(/globalThis\.localStorage/g, 'self.localStorage')
        content = content.replace(/globalThis\s*&&\s*oe\(\)\s*&&\s*globalThis\.localStorage/g, 'self && self.localStorage')
        content = content.replace(/(\W)window(\W)/g, '$1self$2')
        writeFileSync(backgroundPath, content)
      }
    }
  }
}

export default defineConfig({
  plugins: [vue(), copyManifest(), copyHtmlFiles(), fixBackgroundScript()],
  base: './',
  envPrefix: 'VITE_',
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        options: resolve(__dirname, 'src/options/options.html'),
        background: resolve(__dirname, 'src/background/background.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return '[name].js';
          }
          return '[name].js';
        },
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name || 'chunk';
          return name.startsWith('_') ? name.substring(1) + '.js' : '[name].js';
        },
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || 'asset';
          if (name.startsWith('_')) {
            return name.substring(1) + '.[ext]';
          }
          return '[name].[ext]';
        },
        manualChunks: (id) => {
          if (id.includes('background.ts')) {
            return 'background';
          }
          if (id.includes('src/utils/') || id.includes('src/i18n/')) {
            return null;
          }
        },
      },
    },
    outDir: 'dist',
    emptyOutDir: false,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false,
  },
})
