import { useState } from 'react';

const MAX_VALUE = 1_000_000;

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
            {/* Issue 4: cap label length to prevent localStorage abuse */}
            <input
              type="text"
              maxLength={100}
              className="settings-input"
              data-testid={`label-input-${n}`}
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </label>
          <label className="settings-row">
            <span>Value</span>
            {/* Issue 5: cap value at MAX_VALUE */}
            <input
              type="number"
              min={0}
              max={MAX_VALUE}
              className="settings-input"
              data-testid={`value-input-${n}`}
              value={value}
              onChange={(e) => {
                const parsed = parseInt(e.target.value, 10);
                if (!isNaN(parsed) && parsed >= 0 && parsed <= MAX_VALUE) setValue(parsed);
              }}
            />
          </label>
          <label className="settings-row">
            <span>Decrement by</span>
            {/* Issue 3: reject negative values — they invert the decrement direction */}
            <input
              type="number"
              min={0}
              className="settings-input"
              data-testid={`decrement-amount-input-${n}`}
              value={decrementAmount}
              onChange={(e) => {
                const parsed = parseInt(e.target.value, 10);
                if (!isNaN(parsed) && parsed >= 0) setDecrementAmount(parsed);
              }}
            />
          </label>
        </div>
      )}
    </div>
  );
}
