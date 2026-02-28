import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useCounter } from '../../src/hooks/useCounter';

describe('useCounter', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with value: 0, decrementAmount: 1, label matching the defaultLabel argument', () => {
    const { result } = renderHook(() => useCounter('init-key', 'My Counter'));
    expect(result.current.value).toBe(0);
    expect(result.current.decrementAmount).toBe(1);
    expect(result.current.label).toBe('My Counter');
  });

  it('setLabel updates label', () => {
    const { result } = renderHook(() => useCounter('label-key', 'Original'));
    act(() => {
      result.current.setLabel('New Label');
    });
    expect(result.current.label).toBe('New Label');
  });

  it('setValue updates value', () => {
    const { result } = renderHook(() => useCounter('value-key', 'Counter'));
    act(() => {
      result.current.setValue(10);
    });
    expect(result.current.value).toBe(10);
  });

  it('setDecrementAmount updates decrementAmount', () => {
    const { result } = renderHook(() => useCounter('dec-amt-key', 'Counter'));
    act(() => {
      result.current.setDecrementAmount(5);
    });
    expect(result.current.decrementAmount).toBe(5);
  });

  it('increment adds 1 to value', () => {
    const { result } = renderHook(() => useCounter('inc-key', 'Counter'));
    act(() => {
      result.current.increment();
    });
    expect(result.current.value).toBe(1);
    act(() => {
      result.current.increment();
    });
    expect(result.current.value).toBe(2);
  });

  it('decrement subtracts decrementAmount from value', () => {
    const { result } = renderHook(() => useCounter('dec-key', 'Counter'));
    act(() => {
      result.current.setValue(10);
      result.current.setDecrementAmount(3);
    });
    act(() => {
      result.current.decrement();
    });
    expect(result.current.value).toBe(7);
  });

  it('decrement floors at 0: value 3, decrementAmount 5 → value becomes 0, not -2', () => {
    const { result } = renderHook(() => useCounter('floor-key', 'Counter'));
    act(() => {
      result.current.setValue(3);
      result.current.setDecrementAmount(5);
    });
    act(() => {
      result.current.decrement();
    });
    expect(result.current.value).toBe(0);
  });

  it('reset restores to { label: defaultLabel, value: 0, decrementAmount: 1 }', () => {
    const { result } = renderHook(() => useCounter('reset-key', 'Default Label'));
    act(() => {
      result.current.setLabel('Changed');
      result.current.setValue(99);
      result.current.setDecrementAmount(7);
    });
    act(() => {
      result.current.reset();
    });
    expect(result.current.label).toBe('Default Label');
    expect(result.current.value).toBe(0);
    expect(result.current.decrementAmount).toBe(1);
  });

  it('persists value across unmount and remount with the same storageKey', () => {
    const { result, unmount } = renderHook(() => useCounter('test-counter', 'Counter'));
    act(() => {
      result.current.setValue(42);
    });
    unmount();

    const { result: result2 } = renderHook(() => useCounter('test-counter', 'Counter'));
    expect(result2.current.value).toBe(42);
  });
});
