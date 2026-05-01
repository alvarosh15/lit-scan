import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';

export default defineConfig({
  resolve: {
    alias: {
      // Resolves `import ... from 'lit-scan'` directly to source during dev.
      // Remove this alias (and add a proper dep) once lit-scan is published.
      'lit-scan': fileURLToPath(new URL('../litscan/src/index.ts', import.meta.url)),
    },
  },
});
