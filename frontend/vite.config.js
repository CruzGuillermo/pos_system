import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: [
      { find: '@emotion/styled', replacement: path.resolve(__dirname, 'node_modules/@emotion/styled') },
      { find: '@emotion/react', replacement: path.resolve(__dirname, 'node_modules/@emotion/react') },
    ],
  },
});
