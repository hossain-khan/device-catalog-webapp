import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKV } from '@/hooks/useKV';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

// Define the storage mock on the global window object
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('useKV', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('should return default value when localStorage is empty', () => {
    const defaultValue = 'default-value';
    const { result } = renderHook(() => useKV('test-key', defaultValue));
    
    expect(result.current[0]).toBe(defaultValue);
    expect(localStorageMock.getItem).toHaveBeenCalledWith('test-key');
  });

  it('should return stored value from localStorage', () => {
    const storedValue = 'stored-value';
    localStorageMock.getItem.mockReturnValue(JSON.stringify(storedValue));
    
    const { result } = renderHook(() => useKV('test-key', 'default-value'));
    
    expect(result.current[0]).toBe(storedValue);
  });

  it('should handle complex objects', () => {
    const complexObject = { 
      name: 'Test', 
      count: 42, 
      items: ['a', 'b', 'c'],
      nested: { value: true }
    };
    localStorageMock.getItem.mockReturnValue(JSON.stringify(complexObject));
    
    const { result } = renderHook(() => useKV('test-key', {}));
    
    expect(result.current[0]).toEqual(complexObject);
  });

  it('should update localStorage when setValue is called', () => {
    const { result } = renderHook(() => useKV('test-key', 'default'));
    
    act(() => {
      result.current[1]('new-value');
    });
    
    expect(result.current[0]).toBe('new-value');
    expect(localStorageMock.setItem).toHaveBeenCalledWith('test-key', JSON.stringify('new-value'));
  });

  it('should handle localStorage parse errors gracefully', () => {
    localStorageMock.getItem.mockReturnValue('invalid-json{');
    
    const defaultValue = 'fallback';
    const { result } = renderHook(() => useKV('test-key', defaultValue));
    
    expect(result.current[0]).toBe(defaultValue);
  });

  it('should handle localStorage setItem errors gracefully', () => {
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('Storage quota exceeded');
    });
    
    const { result } = renderHook(() => useKV('test-key', 'default'));
    
    // Should not throw error
    act(() => {
      result.current[1]('new-value');
    });
    
    // Value should still be updated in state
    expect(result.current[0]).toBe('new-value');
  });

  it('should respond to storage events from other tabs', () => {
    const { result } = renderHook(() => useKV('test-key', 'default'));
    
    // Simulate storage event from another tab
    const storageEvent = new StorageEvent('storage', {
      key: 'test-key',
      newValue: JSON.stringify('value-from-other-tab')
    });
    
    act(() => {
      window.dispatchEvent(storageEvent);
    });
    
    expect(result.current[0]).toBe('value-from-other-tab');
  });

  it('should ignore storage events for different keys', () => {
    const { result } = renderHook(() => useKV('test-key', 'default'));
    const initialValue = result.current[0];
    
    // Simulate storage event for different key
    const storageEvent = new StorageEvent('storage', {
      key: 'different-key',
      newValue: JSON.stringify('other-value')
    });
    
    act(() => {
      window.dispatchEvent(storageEvent);
    });
    
    // Value should remain unchanged
    expect(result.current[0]).toBe(initialValue);
  });

  it('should handle storage events with null newValue', () => {
    const { result } = renderHook(() => useKV('test-key', 'default'));
    const initialValue = result.current[0];
    
    // Simulate storage event with null newValue (item deleted)
    const storageEvent = new StorageEvent('storage', {
      key: 'test-key',
      newValue: null
    });
    
    act(() => {
      window.dispatchEvent(storageEvent);
    });
    
    // Value should remain unchanged
    expect(result.current[0]).toBe(initialValue);
  });

  it('should handle storage events with invalid JSON gracefully', () => {
    const { result } = renderHook(() => useKV('test-key', 'default'));
    const initialValue = result.current[0];
    
    // Simulate storage event with invalid JSON
    const storageEvent = new StorageEvent('storage', {
      key: 'test-key',
      newValue: 'invalid-json{'
    });
    
    act(() => {
      window.dispatchEvent(storageEvent);
    });
    
    // Value should remain unchanged due to parse error
    expect(result.current[0]).toBe(initialValue);
  });

  it('should work with different data types', () => {
    // Test with number
    const { result: numberResult } = renderHook(() => useKV('number-key', 0));
    act(() => {
      numberResult.current[1](42);
    });
    expect(numberResult.current[0]).toBe(42);
    
    // Test with boolean
    const { result: booleanResult } = renderHook(() => useKV('boolean-key', false));
    act(() => {
      booleanResult.current[1](true);
    });
    expect(booleanResult.current[0]).toBe(true);
    
    // Test with array
    const { result: arrayResult } = renderHook(() => useKV('array-key', []));
    const testArray = [1, 2, 3];
    act(() => {
      arrayResult.current[1](testArray);
    });
    expect(arrayResult.current[0]).toEqual(testArray);
  });

  it('should maintain referential equality for setValue function', () => {
    const { result, rerender } = renderHook(() => useKV('test-key', 'default'));
    
    const firstSetValue = result.current[1];
    
    // Trigger a re-render
    rerender();
    
    const secondSetValue = result.current[1];
    
    // setValue function should be the same reference due to useCallback
    expect(firstSetValue).toBe(secondSetValue);
  });

  it('should clean up storage event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    
    const { unmount } = renderHook(() => useKV('test-key', 'default'));
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));
    
    removeEventListenerSpy.mockRestore();
  });
});