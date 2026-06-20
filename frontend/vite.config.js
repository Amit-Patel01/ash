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
      sourcemap: false, // Security: Disable source maps in production
      minify: 'esbuild',
      target: 'es2020',
      cssMinify: true,
      chunkSizeWarningLimit: 1000,
    },
    server: {
      // Bind to all network interfaces so port-forwarding / remote access works
      host: true,
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
