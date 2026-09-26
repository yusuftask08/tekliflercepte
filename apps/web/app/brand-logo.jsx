import Link from "next/link";

// One mark for header, footer, auth pages and the favicon (icon.jsx draws
// the same shapes) — a teklif speech bubble with a check. Colors come from
// tokens so it flips correctly in dark mode; `inverted` is for use on top of
// a solid brand-colored panel.
export function BrandMark({ size = 32, inverted = false }) {
  const bg = inverted ? "var(--color-text-on-brand)" : "var(--color-primary)";
  const fg = inverted ? "var(--color-primary)" : "var(--color-text-on-brand)";
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect width="32" height="32" rx="9" fill={bg} />
      <path
        d="M9.5 8.5h13a2.5 2.5 0 0 1 2.5 2.5v7.5a2.5 2.5 0 0 1-2.5 2.5h-6.5l-4.5 3.8V21H9.5A2.5 2.5 0 0 1 7 18.5V11a2.5 2.5 0 0 1 2.5-2.5Z"
        fill={fg}
      />
      <path d="M12.3 14.9l2.6 2.6 4.8-5" stroke={bg} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const SIZES = {
  sm: { mark: 26, text: "text-base" },
  md: { mark: 32, text: "text-lg sm:text-xl" },
  lg: { mark: 38, text: "text-xl sm:text-2xl" },
};

export function BrandLogo({ size = "md", inverted = false, href = "/", className = "" }) {
  const s = SIZES[size] ?? SIZES.md;
  return (
    <Link
      href={href}
      aria-label="Teklifler Cepte ana sayfa"
      className={`inline-flex items-center gap-2.5 font-extrabold tracking-tight ${className}`}
    >
      <BrandMark size={s.mark} inverted={inverted} />
      <span className={s.text}>
        Teklifler
        <span className={inverted ? "opacity-80" : "text-primary"}> Cepte</span>
      </span>
    </Link>
  );
}
