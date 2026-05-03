import { defineConfig } from 'vite'
import { resolve } from 'path'
import { readFileSync } from 'fs'

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'))

// Rollup orders side-effect-only modules by file path, which places
// components/ before core.js alphabetically. This plugin moves the
// core.js region to the top of the bundle so window.Brut is available
// when component IIFEs execute.
function brutCoreFirst() {
  return {
    name: 'brut-core-first',
    generateBundle(_, bundle) {
      for (const chunk of Object.values(bundle)) {
        if (chunk.type !== 'chunk') continue
        const coreRe = /(\t?\/\/#region src\/js\/core\.js\n[\s\S]*?\n\t?\/\/#endregion\n)/
        const match = chunk.code.match(coreRe)
        if (!match) continue
        const core = match[1]
        const without = chunk.code.replace(core, '')
        const first = without.search(/\t?\/\/#region/)
        if (first === -1) continue
        chunk.code = without.slice(0, first) + core + without.slice(first)
      }
    },
  }
}

export default defineConfig({
  define: {
    __BRUT_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [brutCoreFirst()],
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
