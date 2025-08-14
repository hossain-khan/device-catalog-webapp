import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useIsMobile } from './use-mobile';

describe('useIsMobile', () => {
  let changeHandler: (() => void) | null = null;

  const matchMediaMock = vi.fn().mockImplementation(query => ({
    matches: window.innerWidth < 768,
    media: query,
    onchange: null,
    addEventListener: (event: string, handler: () => void) => {
      if (event === 'change') {
        changeHandler = handler;
      }
    },
    removeEventListener: () => {
      changeHandler = null;
    },
    dispatchEvent: vi.fn(),
  }));

  beforeEach(() => {
    vi.stubGlobal('matchMedia', matchMediaMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    changeHandler = null;
  });

  it('should return true if window width is less than mobile breakpoint', () => {
    vi.stubGlobal('innerWidth', 500);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('should return false if window width is greater than mobile breakpoint', () => {
    vi.stubGlobal('innerWidth', 1024);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('should update when window is resized', () => {
    vi.stubGlobal('innerWidth', 1024);
    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    expect(changeHandler).toBeInstanceOf(Function);

    act(() => {
      vi.stubGlobal('innerWidth', 500);
      if (changeHandler) {
        changeHandler();
      }
    });

    expect(result.current).toBe(true);
  });
});
