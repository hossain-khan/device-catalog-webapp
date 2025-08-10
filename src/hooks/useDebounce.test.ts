import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const initialValue = 'initial';
    const { result } = renderHook(() => useDebounce(initialValue, 500));
    
    expect(result.current).toBe(initialValue);
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );
    
    expect(result.current).toBe('initial');
    
    // Update the value
    rerender({ value: 'updated', delay: 500 });
    
    // Value should not change immediately
    expect(result.current).toBe('initial');
    
    // Fast-forward time by 499ms (still within debounce period)
    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current).toBe('initial');
    
    // Fast-forward time by 1ms more (500ms total, debounce period complete)
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('updated');
  });

  it('should reset debounce timer on rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );
    
    // Update value multiple times rapidly
    rerender({ value: 'first-update', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    rerender({ value: 'second-update', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    rerender({ value: 'final-update', delay: 500 });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    // Still should have initial value as debounce keeps resetting
    expect(result.current).toBe('initial');
    
    // Complete the debounce period
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    // Should have the final value
    expect(result.current).toBe('final-update');
  });

  it('should work with different data types', () => {
    // Test with numbers
    const { result: numberResult, rerender: numberRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 0, delay: 300 } }
    );
    
    numberRerender({ value: 42, delay: 300 });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(numberResult.current).toBe(42);
    
    // Test with objects
    const initialObj = { count: 0 };
    const updatedObj = { count: 5 };
    const { result: objResult, rerender: objRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialObj, delay: 300 } }
    );
    
    objRerender({ value: updatedObj, delay: 300 });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(objResult.current).toEqual(updatedObj);
    
    // Test with arrays
    const initialArray = [1, 2, 3];
    const updatedArray = [4, 5, 6];
    const { result: arrayResult, rerender: arrayRerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialArray, delay: 300 } }
    );
    
    arrayRerender({ value: updatedArray, delay: 300 });
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(arrayResult.current).toEqual(updatedArray);
  });

  it('should handle delay changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );
    
    // Update value and delay
    rerender({ value: 'updated', delay: 200 });
    
    // Should use the new shorter delay
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('updated');
  });

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 0 } }
    );
    
    rerender({ value: 'updated', delay: 0 });
    
    // With zero delay, should update on next tick
    act(() => {
      vi.runAllTimers();
    });
    expect(result.current).toBe('updated');
  });

  it('should clean up timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');
    
    const { rerender, unmount } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    );
    
    // Trigger a value change to create a timeout
    rerender({ value: 'updated', delay: 500 });
    
    // Unmount the hook
    unmount();
    
    // Should have called clearTimeout
    expect(clearTimeoutSpy).toHaveBeenCalled();
    
    clearTimeoutSpy.mockRestore();
  });

  it('should handle multiple rapid changes and only apply the last one', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );
    
    // Simulate rapid typing
    const values = ['a', 'ab', 'abc', 'abcd', 'abcde'];
    
    values.forEach((value) => {
      rerender({ value, delay: 300 });
      // Advance time by less than debounce delay
      act(() => {
        vi.advanceTimersByTime(50);
      });
    });
    
    // Should still have initial value
    expect(result.current).toBe('initial');
    
    // Complete the debounce period
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    // Should have the final value only
    expect(result.current).toBe('abcde');
  });

  it('should work correctly with boolean values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: false, delay: 200 } }
    );
    
    expect(result.current).toBe(false);
    
    rerender({ value: true, delay: 200 });
    
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    expect(result.current).toBe(true);
  });

  it('should handle null and undefined values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: null, delay: 200 } }
    );
    
    expect(result.current).toBe(null);
    
    rerender({ value: undefined, delay: 200 });
    
    act(() => {
      vi.advanceTimersByTime(200);
    });
    
    expect(result.current).toBe(undefined);
  });

  it('should handle complex filter objects (real-world usage)', () => {
    const initialFilters = {
      search: '',
      manufacturer: 'all',
      formFactor: 'all',
      ramRange: [0, 16384]
    };
    
    const updatedFilters = {
      search: 'pixel',
      manufacturer: 'Google',
      formFactor: 'phone',
      ramRange: [4096, 8192]
    };
    
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialFilters, delay: 300 } }
    );
    
    expect(result.current).toEqual(initialFilters);
    
    rerender({ value: updatedFilters, delay: 300 });
    
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    expect(result.current).toEqual(updatedFilters);
  });
});