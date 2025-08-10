import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Critical: Early polyfill for React.act to prevent CI failures
// This must run BEFORE any React Testing Library modules are imported

// Create a robust act implementation that works in all environments
const createAct = () => {
  // Try to get the real React.act first
  try {
    const React = require('react');
    if (React && typeof React.act === 'function') {
      return React.act;
    }
  } catch (e) {
    // React not available or act not exported
  }

  // Fallback implementation that mimics React.act behavior
  return (callback: (() => void) | (() => Promise<void>)) => {
    try {
      const result = callback();
      if (result && typeof result.then === 'function') {
        // Return the promise if callback is async
        return result;
      }
      // Return resolved promise for sync callbacks
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  };
};

const robustAct = createAct();

// CRITICAL: Patch React module to ensure act is available
// This prevents the "React.act is not a function" error in CI
try {
  const React = require('react');
  if (!React.act) {
    // Patch React to include act
    Object.defineProperty(React, 'act', {
      value: robustAct,
      writable: true,
      configurable: true,
    });
  }
} catch (e) {
  // If we can't patch React, set up global fallbacks
}

// Global polyfills for various test environments
if (typeof globalThis.React === 'undefined') {
  globalThis.React = { act: robustAct };
} else if (!globalThis.React.act) {
  globalThis.React.act = robustAct;
}

// Polyfill for ReactDOMTestUtils which is used in production builds
Object.defineProperty(globalThis, 'ReactDOMTestUtils', {
  value: { act: robustAct },
  writable: true,
  configurable: true,
});

// Make act available globally
(globalThis as any).act = robustAct;

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