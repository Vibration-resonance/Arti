import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs'

// Plugin personnalisé pour copier le manifest
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

// Plugin pour copier les fichiers HTML et CSS à la racine
function copyHtmlFiles() {
  return {
    name: 'copy-html-files',
    writeBundle() {
      // Fonction pour corriger les chemins dans les fichiers HTML
      function fixHtmlPaths(filePath: string, outputPath: string) {
        if (existsSync(filePath)) {
          let content = readFileSync(filePath, 'utf-8')
          // Remplacer les chemins relatifs ../../ par des chemins relatifs simples
          content = content.replace(/src="\.\.\/\.\.\//g, 'src="')
          content = content.replace(/href="\.\.\/\.\.\//g, 'href="')
          writeFileSync(outputPath, content)
        }
      }
      
      // Copier et corriger les fichiers HTML
      fixHtmlPaths('dist/src/popup/popup.html', 'dist/popup.html')
      fixHtmlPaths('dist/src/options/options.html', 'dist/options.html')
      
      // Copier content.css vers la racine de dist
      if (existsSync('src/content/content.css')) {
        copyFileSync('src/content/content.css', 'dist/content.css')
      }
    }
  }
}

// Plugin pour corriger le background script
function fixBackgroundScript() {
  return {
    name: 'fix-background-script',
    writeBundle() {
      const backgroundPath = 'dist/background.js'
      if (existsSync(backgroundPath)) {
        let content = readFileSync(backgroundPath, 'utf-8')
        
        // Supprimer les exports ES6 qui causent des problèmes dans les service workers
        content = content.replace(/export\s*\{[^}]*\}\s*;?\s*$/, '')
        content = content.replace(/export\s+.*$/, '')
        
        // Fix for import.meta.url references
        content = content.replace(/import\.meta\.url/g, '"chrome-extension://" + chrome.runtime.id')
        
        // Handle specific pattern from compiled code
        content = content.replace(
          /(Promise\.resolve\(\)\.then\(\(\)\s*=>.*?)import\.meta\.url(.*?\))/g, 
          '$1"chrome-extension://" + chrome.runtime.id$2'
        )
        
        // Replace Node.js require('ws') with self.WebSocket (fix for browser environment)
        content = content.replace(
          /typeof window>"u"\?Ie=require\("ws"\):Ie=window\.WebSocket/g,
          'Ie=self.WebSocket'
        )
        
        // Fix window references in service worker environment
        content = content.replace(/typeof window<"u"/g, 'typeof self!=="undefined"')
        content = content.replace(/typeof window!=="undefined"/g, 'typeof self!=="undefined"')
        content = content.replace(/typeof window>"u"/g, 'typeof self==="undefined"')
        content = content.replace(/typeof window=="undefined"/g, 'typeof self==="undefined"')

        // Replace direct window references with self (which works in both browser and service worker)
        content = content.replace(/window\.WebSocket/g, 'self.WebSocket')
        content = content.replace(/window\.Worker/g, 'self.Worker')
        content = content.replace(/window\.location/g, 'self.location')
        content = content.replace(/window\.addEventListener/g, 'self.addEventListener')
        content = content.replace(/window\.removeEventListener/g, 'self.removeEventListener')
        content = content.replace(/window\.dispatchEvent/g, 'self.dispatchEvent')
        content = content.replace(/window\.BroadcastChannel/g, 'self.BroadcastChannel')
        content = content.replace(/window\.history/g, 'self.history')
        content = content.replace(/window\.localStorage/g, 'self.localStorage')
        
        // Fix Supabase auth-related issues
        content = content.replace(/typeof window<"u"\s*\|\|\s*typeof document<"u"/g, 'typeof self!=="undefined"')
        content = content.replace(/globalThis\.localStorage/g, 'self.localStorage')
        content = content.replace(/globalThis\s*&&\s*oe\(\)\s*&&\s*globalThis\.localStorage/g, 'self && self.localStorage')
        
        // Fix any remaining window references
        content = content.replace(/(\W)window(\W)/g, '$1self$2')
        
        // Function to replace require statements with alternatives
        const fixRequire = (content) => {
          // Try to find any remaining require statements
          const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
          let match;
          let fixed = content;

          while ((match = requireRegex.exec(content)) !== null) {
            const moduleName = match[1];
            console.log(`Found require for module: ${moduleName}`);
            
            if (moduleName === 'ws') {
              // WebSocket polyfill
              fixed = fixed.replace(
                new RegExp(`require\\(['"]{1}${moduleName}['"]{1}\\)`, 'g'), 
                'self.WebSocket'
              );
            } else {
              // For other modules, try to provide a fallback
              fixed = fixed.replace(
                new RegExp(`require\\(['"]{1}${moduleName}['"]{1}\\)`, 'g'), 
                '({})'
              );
            }
          }
          return fixed;
        };
        
        // Apply require fixes
        content = fixRequire(content);
        
        writeFileSync(backgroundPath, content)
      }
    }
  }
}

// Plugin pour corriger le content script
function fixContentScript() {
  return {
    name: 'fix-content-script',
    writeBundle() {
      const contentPath = 'dist/content.js'
      if (existsSync(contentPath)) {
        let content = readFileSync(contentPath, 'utf-8')
        // Supprimer les exports ES6 qui causent des problèmes
        content = content.replace(/export\s*\{[^}]*\}\s*;?\s*$/gm, '')
        content = content.replace(/export\s+.*$/gm, '')
        // Supprimer uniquement les imports/exports ES6 en début de ligne (plus sûr pour code minifié)
        content = content.replace(/^\s*import .*$/gm, '')
        content = content.replace(/^\s*export .*$/gm, '')
        // Fix for import.meta.url references
        content = content.replace(/import\.meta\.url/g, '"chrome-extension://" + chrome.runtime.id')
        // Handle specific pattern from compiled code
        content = content.replace(
          /(Promise\.resolve\(\)\.then\(\(\)\s*=>.*?)import\.meta\.url(.*?\))/g, 
          '$1"chrome-extension://" + chrome.runtime.id$2'
        )
        // Fix window references in content script environment
        content = content.replace(/typeof window<"u"/g, 'true')
        content = content.replace(/typeof window!=="undefined"/g, 'true')
        content = content.replace(/typeof window>"u"/g, 'false')
        content = content.replace(/typeof window=="undefined"/g, 'false')
        writeFileSync(contentPath, content, { encoding: 'utf-8' })
      }
    }
  }
}

export default defineConfig({
  plugins: [vue(), copyManifest(), copyHtmlFiles(), fixContentScript(), fixBackgroundScript()],
  base: './',
  envPrefix: 'VITE_',
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
    emptyOutDir: true,
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
