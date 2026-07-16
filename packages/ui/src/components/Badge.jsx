const TONES = {
  brand: "bg-brand-100 text-brand-700",
  soft: "bg-brand-50 text-brand-700",
  success: "bg-brand-50 text-success",
  info: "bg-info/10 text-info",
  warning: "bg-warning/10 text-warning",
  neutral: "bg-border text-text-muted",
};

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="3" />
  </svg>
);

export function Badge({ tone = "brand", icon, className = "", children, ...props }) {
  const toneClasses = TONES[tone] ?? TONES.brand;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses} ${className}`}
      {...props}
    >
      {icon === "check" ? <CheckIcon /> : icon}
      {children}
    </span>
  );
}
