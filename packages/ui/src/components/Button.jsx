const VARIANTS = {
  primary: "bg-primary text-text-on-brand shadow-md hover:opacity-90",
  secondary: "bg-transparent text-text border border-border hover:bg-surface-raised",
  ghost: "bg-transparent text-text-muted hover:bg-surface-raised",
};

const SIZES = {
  md: "px-4 py-2.5 text-sm",
  lg: "px-5 py-[13px] text-base",
};

export function Button({ variant = "primary", size = "md", className = "", ...props }) {
  const variantClasses = VARIANTS[variant] ?? VARIANTS.primary;
  const sizeClasses = SIZES[size] ?? SIZES.md;
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-md font-bold transition-opacity disabled:opacity-50 disabled:pointer-events-none ${variantClasses} ${sizeClasses} ${className}`}
      {...props}
    />
  );
}
