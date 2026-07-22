import { Input } from "@tekliflercepte/ui";
import { TrustIcon } from "./trust-icon";

// Inline style (not a className) for the left offset — Tailwind's own
// px-3.5 utility on Input is baked into its template string ahead of
// anything passed in via className, and utility ordering in the generated
// stylesheet isn't guaranteed to put ours last. An inline style always wins.
export function AuthInput({ icon, ...props }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted">
        <TrustIcon name={icon} size={18} />
      </span>
      <Input {...props} style={{ paddingLeft: "2.75rem" }} />
    </div>
  );
}
