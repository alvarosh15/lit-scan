import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';

export default defineConfig({
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      formats: ['es', 'iife'],
      name: 'litScan',
      fileName: (format) => format === 'iife' ? 'lit-scan.iife.js' : 'lit-scan.js',
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
});
