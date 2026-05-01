import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';

export default defineConfig({
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es', 'iife'],
      name: 'litscan',
      fileName: (format) => format === 'iife' ? 'litscan.iife.js' : 'litscan.js',
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
