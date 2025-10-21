import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'src/setupTests.js',
        'src/main.jsx',
        'src/App.jsx',
        'src/services/HTTPService.js',
        '**/*.test.{js,jsx,ts,tsx}',
        '**/*.config.{js,ts}',
        'coverage/**',
        'dist/**'
      ]
    },
  },
})
