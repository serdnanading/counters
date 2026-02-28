# Counter App — Shared Spec

## Data Model
Each counter stores:
```typescript
interface CounterState {
  label: string;       // user-editable, default "Counter 1" / "Counter 2"
  value: number;       // integer, floors at 0
  decrementAmount: number; // positive integer, default 1
}
```

## Hooks
### usePersistedState<T>(key: string, defaultValue: T): [T, (val: T) => void]
- Generic hook wrapping useState with localStorage read/write
- Reads from localStorage on mount, writes on every update
- Handles missing keys (returns default) and corrupted JSON (returns default)

### useCounter(storageKey: string, defaultLabel: string): object
- Uses usePersistedState internally with the given storageKey
- Returns: { label, value, decrementAmount, setLabel, setValue, setDecrementAmount, decrement, increment, reset }
- decrement(): subtracts decrementAmount from value, floors at 0
- increment(): adds 1 to value
- reset(): restores to { label: defaultLabel, value: 0, decrementAmount: 1 }

## Components
### Counter — receives all return values of useCounter as props
- Displays label (editable), value (large), decrementAmount
- Buttons: Increment (+1), Decrement (-N), Edit value, Reset
- Collapsible settings: set decrement amount, edit label

### Layout — renders two Counter components, mobile-first single column

## File Paths
- src/hooks/usePersistedState.ts
- src/hooks/useCounter.ts
- src/components/Counter.tsx
- src/components/Layout.tsx
- src/App.tsx
