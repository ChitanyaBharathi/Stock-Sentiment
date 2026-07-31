import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

Object.defineProperty(window, 'scrollTo', {
  value: () => {},
  writable: true,
});

// Mock window.location for relative fetch in jsdom/node test environment
if (typeof window !== 'undefined') {
  try {
    delete window.location;
    window.location = new URL('http://localhost:5173');
  } catch {}
}
