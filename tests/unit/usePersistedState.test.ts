import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { usePersistedState } from '../../src/hooks/usePersistedState';

describe('usePersistedState', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns default value when localStorage has no entry for the key', () => {
    const { result } = renderHook(() => usePersistedState('missing-key', 42));
    expect(result.current[0]).toBe(42);
  });

  it('reads existing value from localStorage on mount', () => {
    localStorage.setItem('my-key', JSON.stringify(99));
    const { result } = renderHook(() => usePersistedState('my-key', 0));
    expect(result.current[0]).toBe(99);
  });

  it('writes updated value to localStorage when setter is called', () => {
    const { result } = renderHook(() => usePersistedState('write-key', 'initial'));
    act(() => {
      result.current[1]('updated');
    });
    expect(JSON.parse(localStorage.getItem('write-key')!)).toBe('updated');
  });

  it('returns default if localStorage contains invalid/corrupted JSON for the key', () => {
    localStorage.setItem('bad-key', 'not-valid-json{{{');
    const { result } = renderHook(() => usePersistedState('bad-key', 'default'));
    expect(result.current[0]).toBe('default');
  });

  it('two hooks with different keys do not interfere with each other', () => {
    localStorage.setItem('key-a', JSON.stringify('valueA'));
    localStorage.setItem('key-b', JSON.stringify('valueB'));
    const { result: resultA } = renderHook(() => usePersistedState('key-a', ''));
    const { result: resultB } = renderHook(() => usePersistedState('key-b', ''));
    expect(resultA.current[0]).toBe('valueA');
    expect(resultB.current[0]).toBe('valueB');

    act(() => {
      resultA.current[1]('newA');
    });
    // key-b should remain unchanged
    expect(JSON.parse(localStorage.getItem('key-b')!)).toBe('valueB');
  });
});
