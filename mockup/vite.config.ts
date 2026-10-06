import path from 'node:path'
import { readFileSync } from 'node:fs'

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import type { Plugin } from 'vite'

// The distribution uses a classic script so it also runs from file://.
// Development keeps Vite's module entry and hot reload.
function portableHtml(): Plugin {
  return {
    name: 'remotehub-portable-html',
    apply: 'build',
    generateBundle() {
      const template = readFileSync(new URL('./index.html', import.meta.url), 'utf8')
      const html = template
        .replace(/\s*<link rel="icon"[^>]*\/>/, '')
        .replace('</head>', '  <link rel="stylesheet" href="./index.css" />\n  </head>')
        .replace('<script type="module" src="/src/main.tsx"></script>', '<script defer src="./index.js"></script>')
      this.emitFile({ type: 'asset', fileName: 'index.html', source: html })
    },
  }
}

export default defineConfig(({ command }) => ({
  base: './',
  plugins: [react(), tailwindcss(), portableHtml()],
  define: command === 'build'
    ? { 'process.env.NODE_ENV': JSON.stringify('production') }
    : {},
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    copyPublicDir: false,
    cssCodeSplit: false,
    lib: {
      entry: path.resolve(import.meta.dirname, 'src/main.tsx'),
      name: 'RemoteHub',
      formats: ['iife'],
      fileName: () => 'index.js',
      cssFileName: 'index',
    },
  },
}))
