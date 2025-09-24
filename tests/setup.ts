// Test setup file for vitest
import { beforeAll, afterAll } from 'vitest';

// Mock window object for Node.js environment
beforeAll(() => {
  // Mock window object for tests that run in Node.js
  if (typeof window === 'undefined') {
    global.window = {
      location: {
        hostname: 'localhost',
        port: '8080',
        protocol: 'http:',
        href: 'http://localhost:8080'
      },
      addEventListener: () => {},
      removeEventListener: () => {},
      fetch: global.fetch || (() => Promise.resolve(new Response())),
      localStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {}
      },
      sessionStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
        clear: () => {}
      }
    } as any;
  }

  // Mock fetch if not available
  if (typeof global.fetch === 'undefined') {
    global.fetch = () => Promise.resolve(new Response());
  }
});

afterAll(() => {
  // Cleanup
  if (global.window) {
    delete global.window;
  }
});