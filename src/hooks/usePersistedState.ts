// STUB — will be replaced during merge
import { useState } from 'react';

export function usePersistedState<T>(key: string, defaultValue: T): [T, (val: T) => void] {
  const [state] = useState<T>(defaultValue);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setter = (_val: T): void => {};
  return [state, setter];
}
