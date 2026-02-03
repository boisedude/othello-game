// Setup file that runs before tests to mock Vite-specific features

// Mock import.meta.env for Vite compatibility
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_API_BASE_URL: 'https://test.example.com/api',
        MODE: 'test',
        DEV: false,
        PROD: false,
        SSR: false,
      },
    },
  },
  writable: true,
  configurable: true,
})
