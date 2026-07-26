const SIZES = {
  sm: "h-3.5 w-3.5 border-2",
  md: "h-4 w-4 border-2",
  lg: "h-6 w-6 border-[3px]",
};

const TONES = {
  primary: "border-border border-t-primary",
  muted: "border-text-muted/40 border-t-text-muted",
  onBrand: "border-white/40 border-t-white",
};

export function Spinner({ size = "md", tone = "primary", className = "" }) {
  return (
    <span
      className={`inline-block flex-shrink-0 animate-spin rounded-full ${SIZES[size]} ${TONES[tone]} ${className}`}
    />
  );
}
