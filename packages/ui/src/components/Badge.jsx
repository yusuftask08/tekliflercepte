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

const StarIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.5l2.9 6.2 6.6.7-5 4.6 1.4 6.6L12 17.4l-5.9 3.2 1.4-6.6-5-4.6 6.6-.7L12 2.5Z" />
  </svg>
);

const ICONS = { check: CheckIcon, star: StarIcon };

export function Badge({ tone = "brand", icon, className = "", children, ...props }) {
  const toneClasses = TONES[tone] ?? TONES.brand;
  const IconComponent = ICONS[icon];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${toneClasses} ${className}`}
      {...props}
    >
      {IconComponent ? <IconComponent /> : icon}
      {children}
    </span>
  );
}
