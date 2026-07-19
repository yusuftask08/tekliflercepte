/** Shared selected/unselected toggle button — business type pickers, role
 *  pickers, category chips, and quiz-style question options all used to
 *  hand-write the same border+bg selected-state logic (and none of them
 *  set aria-pressed). Shape (rounded-md vs rounded-full) and padding stay
 *  caller-controlled via className since those genuinely differ by context. */
export function SelectableCard({ selected, onClick, className = "", children, ...props }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`border text-left transition disabled:opacity-50 ${
        selected ? "border-primary bg-brand-50 font-semibold" : "border-border"
      } ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
