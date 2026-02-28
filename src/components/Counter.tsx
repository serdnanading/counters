// STUB — will be replaced during merge
import React from 'react';
import { UseCounterReturn } from '../hooks/useCounter';

interface CounterProps extends UseCounterReturn {
  counterNumber: 1 | 2;
}

export function Counter({ counterNumber, label, value, decrementAmount }: CounterProps) {
  const n = counterNumber;
  return (
    <div>
      <span data-testid={`counter-label-${n}`}>{label}</span>
      <span data-testid={`counter-value-${n}`}>{value}</span>
      <button data-testid={`increment-btn-${n}`}>+1</button>
      <button data-testid={`decrement-btn-${n}`}>-{decrementAmount}</button>
      <button data-testid={`reset-btn-${n}`}>Reset</button>
      <button data-testid={`settings-toggle-${n}`}>Settings</button>
      <input data-testid={`decrement-amount-input-${n}`} type="number" readOnly value={decrementAmount} />
      <input data-testid={`label-input-${n}`} type="text" readOnly value={label} />
    </div>
  );
}
