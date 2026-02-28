// STUB — will be replaced during merge
import React from 'react';
import { Counter } from './Counter';
import { useCounter } from '../hooks/useCounter';

export function Layout() {
  const counter1 = useCounter('counter-1', 'Counter 1');
  const counter2 = useCounter('counter-2', 'Counter 2');
  return (
    <div>
      <h1>My Counters</h1>
      <Counter counterNumber={1} {...counter1} />
      <Counter counterNumber={2} {...counter2} />
    </div>
  );
}
