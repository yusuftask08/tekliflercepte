const ICONS = {
  request: (
    <path d="M6 3h12v18l-6-4-6 4V3Z" />
  ),
  compare: (
    <>
      <path d="M8 3v18M16 3v18" />
      <path d="M4 8h8M12 16h8" />
    </>
  ),
  choose: <path d="M20 6L9 17l-5-5" />,
};

export function HowItWorksIcon({ name }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {ICONS[name]}
    </svg>
  );
}
