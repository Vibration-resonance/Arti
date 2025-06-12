// vite.config.multi.ts
import { defineConfig } from "file:///D:/arti%20ai%20ext/Extension/node_modules/vite/dist/node/index.js";
import { resolve } from "path";
import vue from "file:///D:/arti%20ai%20ext/Extension/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { copyFileSync, mkdirSync, existsSync, readFileSync, writeFileSync } from "fs";
var __vite_injected_original_dirname = "D:\\arti ai ext\\Extension";
function copyManifest() {
  return {
    name: "copy-manifest",
    buildStart() {
      if (!existsSync("dist")) {
        mkdirSync("dist", { recursive: true });
      }
      copyFileSync("public/manifest.json", "dist/manifest.json");
    }
  };
}
function copyHtmlFiles() {
  return {
    name: "copy-html-files",
    writeBundle() {
      function fixHtmlPaths(filePath, outputPath) {
        if (existsSync(filePath)) {
          let content = readFileSync(filePath, "utf-8");
          content = content.replace(/src="\.\.\/\.\.\//g, 'src="');
          content = content.replace(/href="\.\.\/\.\.\//g, 'href="');
          writeFileSync(outputPath, content);
        }
      }
      fixHtmlPaths("dist/src/popup/popup.html", "dist/popup.html");
      fixHtmlPaths("dist/src/options/options.html", "dist/options.html");
      if (existsSync("src/content/content.css")) {
        copyFileSync("src/content/content.css", "dist/content.css");
      }
    }
  };
}
function fixBackgroundScript() {
  return {
    name: "fix-background-script",
    writeBundle() {
      const backgroundPath = "dist/background.js";
      if (existsSync(backgroundPath)) {
        let content = readFileSync(backgroundPath, "utf-8");
        content = content.replace(/export\s*\{[^}]*\}\s*;?\s*$/, "");
        content = content.replace(/export\s+.*$/, "");
        content = content.replace(/import\.meta\.url/g, '"chrome-extension://" + chrome.runtime.id');
        content = content.replace(/(Promise\.resolve\(\)\.then\(\(\)\s*=>.*?)import\.meta\.url(.*?\))/g, '$1"chrome-extension://" + chrome.runtime.id$2');
        content = content.replace(/typeof window<"u"/g, 'typeof self!=="undefined"');
        content = content.replace(/typeof window!=="undefined"/g, 'typeof self!=="undefined"');
        content = content.replace(/typeof window>"u"/g, 'typeof self==="undefined"');
        content = content.replace(/typeof window=="undefined"/g, 'typeof self==="undefined"');
        content = content.replace(/window\.WebSocket/g, "self.WebSocket");
        content = content.replace(/window\.Worker/g, "self.Worker");
        content = content.replace(/window\.location/g, "self.location");
        content = content.replace(/window\.addEventListener/g, "self.addEventListener");
        content = content.replace(/window\.removeEventListener/g, "self.removeEventListener");
        content = content.replace(/window\.dispatchEvent/g, "self.dispatchEvent");
        content = content.replace(/window\.BroadcastChannel/g, "self.BroadcastChannel");
        content = content.replace(/window\.history/g, "self.history");
        content = content.replace(/window\.localStorage/g, "self.localStorage");
        content = content.replace(/typeof window<"u"\s*\|\|\s*typeof document<"u"/g, 'typeof self!=="undefined"');
        content = content.replace(/globalThis\.localStorage/g, "self.localStorage");
        content = content.replace(/globalThis\s*&&\s*oe\(\)\s*&&\s*globalThis\.localStorage/g, "self && self.localStorage");
        content = content.replace(/(\W)window(\W)/g, "$1self$2");
        writeFileSync(backgroundPath, content);
      }
    }
  };
}
var vite_config_multi_default = defineConfig({
  plugins: [vue(), copyManifest(), copyHtmlFiles(), fixBackgroundScript()],
  base: "./",
  envPrefix: "VITE_",
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__vite_injected_original_dirname, "src/popup/popup.html"),
        options: resolve(__vite_injected_original_dirname, "src/options/options.html"),
        background: resolve(__vite_injected_original_dirname, "src/background/background.ts")
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === "background") {
            return "[name].js";
          }
          return "[name].js";
        },
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name || "chunk";
          return name.startsWith("_") ? name.substring(1) + ".js" : "[name].js";
        },
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || "asset";
          if (name.startsWith("_")) {
            return name.substring(1) + ".[ext]";
          }
          return "[name].[ext]";
        },
        manualChunks: (id) => {
          if (id.includes("background.ts")) {
            return "background";
          }
          if (id.includes("src/utils/") || id.includes("src/i18n/")) {
            return null;
          }
        }
      }
    },
    outDir: "dist",
    emptyOutDir: false
  },
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "src")
    }
  },
  define: {
    __VUE_OPTIONS_API__: true,
    __VUE_PROD_DEVTOOLS__: false
  }
});
export {
  vite_config_multi_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXVsdGkudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxhcnRpIGFpIGV4dFxcXFxFeHRlbnNpb25cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXGFydGkgYWkgZXh0XFxcXEV4dGVuc2lvblxcXFx2aXRlLmNvbmZpZy5tdWx0aS50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovYXJ0aSUyMGFpJTIwZXh0L0V4dGVuc2lvbi92aXRlLmNvbmZpZy5tdWx0aS50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgeyByZXNvbHZlIH0gZnJvbSAncGF0aCdcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJ1xuaW1wb3J0IHsgY29weUZpbGVTeW5jLCBta2RpclN5bmMsIGV4aXN0c1N5bmMsIHJlYWRGaWxlU3luYywgd3JpdGVGaWxlU3luYyB9IGZyb20gJ2ZzJ1xuXG4vLyBQbHVnaW5zIHV0aWxpdGFpcmVzIChjb3BpZSBtYW5pZmVzdCwgaHRtbCwgY3NzKVxuZnVuY3Rpb24gY29weU1hbmlmZXN0KCkge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdjb3B5LW1hbmlmZXN0JyxcbiAgICBidWlsZFN0YXJ0KCkge1xuICAgICAgaWYgKCFleGlzdHNTeW5jKCdkaXN0JykpIHtcbiAgICAgICAgbWtkaXJTeW5jKCdkaXN0JywgeyByZWN1cnNpdmU6IHRydWUgfSlcbiAgICAgIH1cbiAgICAgIGNvcHlGaWxlU3luYygncHVibGljL21hbmlmZXN0Lmpzb24nLCAnZGlzdC9tYW5pZmVzdC5qc29uJylcbiAgICB9XG4gIH1cbn1cbmZ1bmN0aW9uIGNvcHlIdG1sRmlsZXMoKSB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ2NvcHktaHRtbC1maWxlcycsXG4gICAgd3JpdGVCdW5kbGUoKSB7XG4gICAgICBmdW5jdGlvbiBmaXhIdG1sUGF0aHMoZmlsZVBhdGgsIG91dHB1dFBhdGgpIHtcbiAgICAgICAgaWYgKGV4aXN0c1N5bmMoZmlsZVBhdGgpKSB7XG4gICAgICAgICAgbGV0IGNvbnRlbnQgPSByZWFkRmlsZVN5bmMoZmlsZVBhdGgsICd1dGYtOCcpXG4gICAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvc3JjPVwiXFwuXFwuXFwvXFwuXFwuXFwvL2csICdzcmM9XCInKVxuICAgICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoL2hyZWY9XCJcXC5cXC5cXC9cXC5cXC5cXC8vZywgJ2hyZWY9XCInKVxuICAgICAgICAgIHdyaXRlRmlsZVN5bmMob3V0cHV0UGF0aCwgY29udGVudClcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZml4SHRtbFBhdGhzKCdkaXN0L3NyYy9wb3B1cC9wb3B1cC5odG1sJywgJ2Rpc3QvcG9wdXAuaHRtbCcpXG4gICAgICBmaXhIdG1sUGF0aHMoJ2Rpc3Qvc3JjL29wdGlvbnMvb3B0aW9ucy5odG1sJywgJ2Rpc3Qvb3B0aW9ucy5odG1sJylcbiAgICAgIGlmIChleGlzdHNTeW5jKCdzcmMvY29udGVudC9jb250ZW50LmNzcycpKSB7XG4gICAgICAgIGNvcHlGaWxlU3luYygnc3JjL2NvbnRlbnQvY29udGVudC5jc3MnLCAnZGlzdC9jb250ZW50LmNzcycpXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5mdW5jdGlvbiBmaXhCYWNrZ3JvdW5kU2NyaXB0KCkge1xuICByZXR1cm4ge1xuICAgIG5hbWU6ICdmaXgtYmFja2dyb3VuZC1zY3JpcHQnLFxuICAgIHdyaXRlQnVuZGxlKCkge1xuICAgICAgY29uc3QgYmFja2dyb3VuZFBhdGggPSAnZGlzdC9iYWNrZ3JvdW5kLmpzJ1xuICAgICAgaWYgKGV4aXN0c1N5bmMoYmFja2dyb3VuZFBhdGgpKSB7XG4gICAgICAgIGxldCBjb250ZW50ID0gcmVhZEZpbGVTeW5jKGJhY2tncm91bmRQYXRoLCAndXRmLTgnKVxuICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC9leHBvcnRcXHMqXFx7W159XSpcXH1cXHMqOz9cXHMqJC8sICcnKVxuICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC9leHBvcnRcXHMrLiokLywgJycpXG4gICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoL2ltcG9ydFxcLm1ldGFcXC51cmwvZywgJ1wiY2hyb21lLWV4dGVuc2lvbjovL1wiICsgY2hyb21lLnJ1bnRpbWUuaWQnKVxuICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC8oUHJvbWlzZVxcLnJlc29sdmVcXChcXClcXC50aGVuXFwoXFwoXFwpXFxzKj0+Lio/KWltcG9ydFxcLm1ldGFcXC51cmwoLio/XFwpKS9nLCAnJDFcImNocm9tZS1leHRlbnNpb246Ly9cIiArIGNocm9tZS5ydW50aW1lLmlkJDInKVxuICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC90eXBlb2Ygd2luZG93PFwidVwiL2csICd0eXBlb2Ygc2VsZiE9PVwidW5kZWZpbmVkXCInKVxuICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC90eXBlb2Ygd2luZG93IT09XCJ1bmRlZmluZWRcIi9nLCAndHlwZW9mIHNlbGYhPT1cInVuZGVmaW5lZFwiJylcbiAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvdHlwZW9mIHdpbmRvdz5cInVcIi9nLCAndHlwZW9mIHNlbGY9PT1cInVuZGVmaW5lZFwiJylcbiAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvdHlwZW9mIHdpbmRvdz09XCJ1bmRlZmluZWRcIi9nLCAndHlwZW9mIHNlbGY9PT1cInVuZGVmaW5lZFwiJylcbiAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvd2luZG93XFwuV2ViU29ja2V0L2csICdzZWxmLldlYlNvY2tldCcpXG4gICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoL3dpbmRvd1xcLldvcmtlci9nLCAnc2VsZi5Xb3JrZXInKVxuICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC93aW5kb3dcXC5sb2NhdGlvbi9nLCAnc2VsZi5sb2NhdGlvbicpXG4gICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoL3dpbmRvd1xcLmFkZEV2ZW50TGlzdGVuZXIvZywgJ3NlbGYuYWRkRXZlbnRMaXN0ZW5lcicpXG4gICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoL3dpbmRvd1xcLnJlbW92ZUV2ZW50TGlzdGVuZXIvZywgJ3NlbGYucmVtb3ZlRXZlbnRMaXN0ZW5lcicpXG4gICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoL3dpbmRvd1xcLmRpc3BhdGNoRXZlbnQvZywgJ3NlbGYuZGlzcGF0Y2hFdmVudCcpXG4gICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoL3dpbmRvd1xcLkJyb2FkY2FzdENoYW5uZWwvZywgJ3NlbGYuQnJvYWRjYXN0Q2hhbm5lbCcpXG4gICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoL3dpbmRvd1xcLmhpc3RvcnkvZywgJ3NlbGYuaGlzdG9yeScpXG4gICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoL3dpbmRvd1xcLmxvY2FsU3RvcmFnZS9nLCAnc2VsZi5sb2NhbFN0b3JhZ2UnKVxuICAgICAgICBjb250ZW50ID0gY29udGVudC5yZXBsYWNlKC90eXBlb2Ygd2luZG93PFwidVwiXFxzKlxcfFxcfFxccyp0eXBlb2YgZG9jdW1lbnQ8XCJ1XCIvZywgJ3R5cGVvZiBzZWxmIT09XCJ1bmRlZmluZWRcIicpXG4gICAgICAgIGNvbnRlbnQgPSBjb250ZW50LnJlcGxhY2UoL2dsb2JhbFRoaXNcXC5sb2NhbFN0b3JhZ2UvZywgJ3NlbGYubG9jYWxTdG9yYWdlJylcbiAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvZ2xvYmFsVGhpc1xccyomJlxccypvZVxcKFxcKVxccyomJlxccypnbG9iYWxUaGlzXFwubG9jYWxTdG9yYWdlL2csICdzZWxmICYmIHNlbGYubG9jYWxTdG9yYWdlJylcbiAgICAgICAgY29udGVudCA9IGNvbnRlbnQucmVwbGFjZSgvKFxcVyl3aW5kb3coXFxXKS9nLCAnJDFzZWxmJDInKVxuICAgICAgICB3cml0ZUZpbGVTeW5jKGJhY2tncm91bmRQYXRoLCBjb250ZW50KVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoe1xuICBwbHVnaW5zOiBbdnVlKCksIGNvcHlNYW5pZmVzdCgpLCBjb3B5SHRtbEZpbGVzKCksIGZpeEJhY2tncm91bmRTY3JpcHQoKV0sXG4gIGJhc2U6ICcuLycsXG4gIGVudlByZWZpeDogJ1ZJVEVfJyxcbiAgYnVpbGQ6IHtcbiAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICBpbnB1dDoge1xuICAgICAgICBwb3B1cDogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvcG9wdXAvcG9wdXAuaHRtbCcpLFxuICAgICAgICBvcHRpb25zOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9vcHRpb25zL29wdGlvbnMuaHRtbCcpLFxuICAgICAgICBiYWNrZ3JvdW5kOiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9iYWNrZ3JvdW5kL2JhY2tncm91bmQudHMnKSxcbiAgICAgIH0sXG4gICAgICBvdXRwdXQ6IHtcbiAgICAgICAgZW50cnlGaWxlTmFtZXM6IChjaHVua0luZm8pID0+IHtcbiAgICAgICAgICBpZiAoY2h1bmtJbmZvLm5hbWUgPT09ICdiYWNrZ3JvdW5kJykge1xuICAgICAgICAgICAgcmV0dXJuICdbbmFtZV0uanMnO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gJ1tuYW1lXS5qcyc7XG4gICAgICAgIH0sXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiAoY2h1bmtJbmZvKSA9PiB7XG4gICAgICAgICAgY29uc3QgbmFtZSA9IGNodW5rSW5mby5uYW1lIHx8ICdjaHVuayc7XG4gICAgICAgICAgcmV0dXJuIG5hbWUuc3RhcnRzV2l0aCgnXycpID8gbmFtZS5zdWJzdHJpbmcoMSkgKyAnLmpzJyA6ICdbbmFtZV0uanMnO1xuICAgICAgICB9LFxuICAgICAgICBhc3NldEZpbGVOYW1lczogKGFzc2V0SW5mbykgPT4ge1xuICAgICAgICAgIGNvbnN0IG5hbWUgPSBhc3NldEluZm8ubmFtZSB8fCAnYXNzZXQnO1xuICAgICAgICAgIGlmIChuYW1lLnN0YXJ0c1dpdGgoJ18nKSkge1xuICAgICAgICAgICAgcmV0dXJuIG5hbWUuc3Vic3RyaW5nKDEpICsgJy5bZXh0XSc7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiAnW25hbWVdLltleHRdJztcbiAgICAgICAgfSxcbiAgICAgICAgbWFudWFsQ2h1bmtzOiAoaWQpID0+IHtcbiAgICAgICAgICBpZiAoaWQuaW5jbHVkZXMoJ2JhY2tncm91bmQudHMnKSkge1xuICAgICAgICAgICAgcmV0dXJuICdiYWNrZ3JvdW5kJztcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGlkLmluY2x1ZGVzKCdzcmMvdXRpbHMvJykgfHwgaWQuaW5jbHVkZXMoJ3NyYy9pMThuLycpKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgb3V0RGlyOiAnZGlzdCcsXG4gICAgZW1wdHlPdXREaXI6IGZhbHNlLFxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKSxcbiAgICB9LFxuICB9LFxuICBkZWZpbmU6IHtcbiAgICBfX1ZVRV9PUFRJT05TX0FQSV9fOiB0cnVlLFxuICAgIF9fVlVFX1BST0RfREVWVE9PTFNfXzogZmFsc2UsXG4gIH0sXG59KVxu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
