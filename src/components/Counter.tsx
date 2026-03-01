import { useState } from 'react';

interface CounterProps {
  counterNumber: 1 | 2;
  label: string;
  value: number;
  decrementAmount: number;
  setLabel: (label: string) => void;
  setValue: (value: number) => void;
  setDecrementAmount: (amount: number) => void;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export function Counter({
  counterNumber,
  label,
  value,
  decrementAmount,
  setLabel,
  setValue,
  setDecrementAmount,
  increment,
  decrement,
  reset,
}: CounterProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const n = counterNumber;

  const decrementLabel = decrementAmount === 0 ? '0' : `-${decrementAmount}`;

  return (
    <div className="counter">
      <div className="counter-header">
        <span className="counter-label" data-testid={`counter-label-${n}`}>
          {label}
        </span>
      </div>

      <div className="counter-value" data-testid={`counter-value-${n}`}>
        {value}
      </div>

      <div className="counter-actions">
        <button
          className="btn btn-increment"
          data-testid={`increment-btn-${n}`}
          onClick={increment}
        >
          +1
        </button>
        <button
          className="btn btn-decrement"
          data-testid={`decrement-btn-${n}`}
          onClick={decrement}
        >
          {decrementLabel}
        </button>
        <button
          className="btn btn-reset"
          data-testid={`reset-btn-${n}`}
          onClick={reset}
        >
          Reset
        </button>
      </div>

      <button
        className="btn btn-settings-toggle"
        data-testid={`settings-toggle-${n}`}
        onClick={() => setSettingsOpen((open) => !open)}
      >
        {settingsOpen ? 'Hide Settings' : 'Settings'}
      </button>

      {settingsOpen && (
        <div className="counter-settings">
          <label className="settings-row">
            <span>Label</span>
            <input
              type="text"
              className="settings-input"
              data-testid={`label-input-${n}`}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </label>
          <label className="settings-row">
            <span>Value</span>
            <input
              type="number"
              className="settings-input"
              data-testid={`value-input-${n}`}
              value={value}
              onChange={(e) => {
                const parsed = parseInt(e.target.value, 10);
                if (!isNaN(parsed) && parsed >= 0) setValue(parsed);
              }}
            />
          </label>
          <label className="settings-row">
            <span>Decrement by</span>
            <input
              type="number"
              className="settings-input"
              data-testid={`decrement-amount-input-${n}`}
              value={decrementAmount}
              onChange={(e) => {
                const parsed = parseInt(e.target.value, 10);
                if (!isNaN(parsed)) setDecrementAmount(parsed);
              }}
            />
          </label>
        </div>
      )}
    </div>
  );
}
