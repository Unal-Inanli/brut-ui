import { defineConfig } from 'vite'
import { resolve } from 'path'
import brut from './src/config/vite-plugin.js'

export default defineConfig({
  plugins: [brut()],
  build: {
    lib: {
      entry: resolve(import.meta.dirname, 'src/main.js'),
      name: 'Brut',
      formats: ['iife', 'es'],
      fileName: (format) => format === 'iife' ? 'brut.js' : 'brut.esm.js',
      cssFileName: 'brut',
    },
    outDir: 'dist',
    emptyOutDir: true,
    minify: false,
  },
})
