"use client";

import { useRef, useState } from "react";

const VARIANTS = {
  primary: "bg-primary text-text-on-brand shadow-md hover:opacity-90",
  secondary: "bg-transparent text-text border border-border hover:bg-surface-raised",
  ghost: "bg-transparent text-text-muted hover:bg-surface-raised",
  danger: "bg-transparent text-danger hover:bg-danger/10",
};

const SIZES = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-[13px] text-base",
};

/** Guards against double-clicks: if onClick returns a promise (any async
 *  handler), the button ignores further clicks and shows disabled state
 *  until it resolves — one place to fix "double-click submits twice"
 *  instead of every call site re-implementing its own submitting state. */
export function Button({ variant = "primary", size = "md", className = "", onClick, disabled, ...props }) {
  const [busy, setBusy] = useState(false);
  const guardRef = useRef(false);
  const variantClasses = VARIANTS[variant] ?? VARIANTS.primary;
  const sizeClasses = SIZES[size] ?? SIZES.md;

  const handleClick = async (e) => {
    if (!onClick || guardRef.current) return;
    const result = onClick(e);
    if (result && typeof result.then === "function") {
      guardRef.current = true;
      setBusy(true);
      try {
        await result;
      } finally {
        guardRef.current = false;
        setBusy(false);
      }
    }
  };

  return (
    <button
      onClick={onClick ? handleClick : undefined}
      disabled={disabled || busy}
      className={`inline-flex items-center justify-center gap-2 rounded-md font-bold transition-opacity disabled:opacity-50 disabled:pointer-events-none ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    />
  );
}
