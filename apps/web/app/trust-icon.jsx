const ICONS = {
  free: (
    <>
      <path d="M12 3v18M8 7.5c0-1.5 1.5-2.5 4-2.5s4 1 4 2.5-1.5 2-4 2.5-4 1-4 2.5 1.5 2.5 4 2.5 4-1 4-2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  shield: <path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3ZM9 12l2 2 4-4" />,
  spark: (
    <>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
    </>
  ),
  phone: (
    <>
      <rect x="7" y="2" width="10" height="20" rx="2" />
      <path d="M9.5 17.5l1.8 1.8L15 15.5" />
    </>
  ),
  checklist: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M8 8h5M8 12h8M8 16h5" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </>
  ),
};

export function TrustIcon({ name, size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name]}
    </svg>
  );
}
