import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';

export default defineConfig({
  resolve: {
    alias: {
      // Resolves `import ... from 'litscan'` directly to source during dev.
      // Remove this alias (and add a proper dep) once litscan is published.
      litscan: fileURLToPath(new URL('../litscan/src/index.ts', import.meta.url)),
    },
  },
});
