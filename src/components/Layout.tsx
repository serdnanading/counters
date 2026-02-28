import { useCounter } from '../hooks/useCounter';
import { Counter } from './Counter';

export function Layout() {
  const counter1 = useCounter('counter-1', 'Counter 1');
  const counter2 = useCounter('counter-2', 'Counter 2');

  return (
    <div className="layout">
      <header className="header">
        <h1>My Counters</h1>
      </header>
      <main className="main">
        <Counter counterNumber={1} {...counter1} />
        <Counter counterNumber={2} {...counter2} />
      </main>
    </div>
  );
}
