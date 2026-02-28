import { usePersistedState } from './usePersistedState';

interface CounterState {
  label: string;
  value: number;
  decrementAmount: number;
}

export function useCounter(storageKey: string, defaultLabel: string) {
  const defaultState: CounterState = {
    label: defaultLabel,
    value: 0,
    decrementAmount: 1,
  };

  const [state, setState] = usePersistedState<CounterState>(storageKey, defaultState);

  const setLabel = (label: string) => setState({ ...state, label });
  const setValue = (value: number) => setState({ ...state, value });
  const setDecrementAmount = (decrementAmount: number) => setState({ ...state, decrementAmount });

  const increment = () => setState({ ...state, value: state.value + 1 });
  const decrement = () => setState({ ...state, value: Math.max(0, state.value - state.decrementAmount) });
  const reset = () => setState({ label: defaultLabel, value: 0, decrementAmount: 1 });

  return {
    label: state.label,
    value: state.value,
    decrementAmount: state.decrementAmount,
    setLabel,
    setValue,
    setDecrementAmount,
    decrement,
    increment,
    reset,
  };
}
