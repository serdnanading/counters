import { usePersistedState } from './usePersistedState';

export function useCounter(storageKey: string, defaultLabel: string) {
  const [label, setLabel] = usePersistedState<string>(`${storageKey}-label`, defaultLabel);
  const [value, setValue] = usePersistedState<number>(`${storageKey}-value`, 0);
  const [decrementAmount, setDecrementAmount] = usePersistedState<number>(`${storageKey}-decrementAmount`, 1);

  const increment = () => setValue(value + 1);
  const decrement = () => setValue(Math.max(0, value - decrementAmount));
  const reset = () => {
    setLabel(defaultLabel);
    setValue(0);
    setDecrementAmount(1);
  };

  return {
    label,
    value,
    decrementAmount,
    setLabel,
    setValue,
    setDecrementAmount,
    decrement,
    increment,
    reset,
  };
}
