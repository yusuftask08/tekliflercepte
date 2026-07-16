"use client";

export function Checkbox({ checked, onChange, className = "", ...props }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      onClick={() => onChange?.(!checked)}
      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-colors ${
        checked ? "border-primary bg-primary" : "border-border bg-surface"
      } ${className}`}
      {...props}
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path
            d="M20 6L9 17l-5-5"
            stroke="var(--color-text-on-brand)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
