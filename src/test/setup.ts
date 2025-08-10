import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { act } from 'react';

// React 19 compatibility fix for Testing Library
// Ensures React.act is properly accessible in all environments
if (typeof globalThis.React === 'undefined') {
  globalThis.React = { act };
} else if (!globalThis.React.act) {
  globalThis.React.act = act;
}

// Additional polyfill for React DOM test utils compatibility
Object.defineProperty(globalThis, 'ReactDOMTestUtils', {
  value: { act },
  writable: true,
  configurable: true,
});

// Mock ResizeObserver which is used by some components
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver which is used by some components
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock window.matchMedia for responsive components
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock scrollTo for components that use it
Object.defineProperty(window, 'scrollTo', {
  writable: true,
  value: vi.fn(),
});