import { useState } from 'react';

export function usePersistedState<T>(key: string, defaultValue: T): [T, (val: T) => void] {
  const [state, setStateRaw] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  });

  const setState = (val: T) => {
    setStateRaw(val);
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {
      // ignore write errors
    }
  };

  return [state, setState];
}
