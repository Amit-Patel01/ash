/* global process */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import obfuscator from 'vite-plugin-javascript-obfuscator'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget = env.VITE_API_URL || 'http://localhost:5000'
  const enableObfuscation = mode === 'production' && env.VITE_ENABLE_OBFUSCATION === 'true'

  return {
    plugins: [
      react(),
      enableObfuscation && obfuscator({
        compact: true,
        controlFlowFlattening: false,
        deadCodeInjection: false,
        debugProtection: false,
        disableConsoleOutput: true,
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        numbersToExpressions: false,
        renameGlobals: false,
        selfDefending: false,
        simplify: true,
        splitStrings: false,
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 0.6,
        transformObjectKeys: false,
        unicodeEscapeSequence: false
      })
    ].filter(Boolean),
    esbuild: mode === 'production'
      ? {
        drop: ['console', 'debugger'],
        legalComments: 'none',
      }
      : undefined,
    build: {
      sourcemap: false,
      minify: 'esbuild',
      target: 'es2020',
      cssMinify: true,
      chunkSizeWarningLimit: 1000,
      // Inline small assets (<4KB) as base64 to save HTTP requests
      assetsInlineLimit: 4096,
      rollupOptions: {
        output: {
          // Split vendor libs into separate long-cached chunks
          manualChunks(id) {
            // React core — smallest, most critical chunk
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'vendor-react'
            }
            // Router
            if (id.includes('node_modules/react-router')) {
              return 'vendor-router'
            }
            // Firebase — very large, split separately
            if (id.includes('node_modules/firebase') || id.includes('node_modules/@firebase')) {
              return 'vendor-firebase'
            }
            // Framer Motion
            if (id.includes('node_modules/framer-motion')) {
              return 'vendor-motion'
            }
            // Lucide icons
            if (id.includes('node_modules/lucide-react')) {
              return 'vendor-icons'
            }
            // QR code library
            if (id.includes('node_modules/qrcode')) {
              return 'vendor-qrcode'
            }
            // All other node_modules together
            if (id.includes('node_modules/')) {
              return 'vendor-misc'
            }
          },
          // Deterministic filenames for better CDN caching
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
    },
    server: {
      // Bind to all network interfaces so port-forwarding / remote access works
      host: true,
      allowedHosts: true,
      // Default dev port (can be overridden with --port or VITE_PORT env)
      port: Number(env.VITE_PORT) || 5173,
      strictPort: false,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})
