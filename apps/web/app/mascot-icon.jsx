export function MascotIcon({ size = 56, waving = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* body */}
      <ellipse cx="32" cy="36" rx="22" ry="20" fill="var(--color-primary)" />
      {/* belly highlight */}
      <ellipse cx="32" cy="40" rx="14" ry="11" fill="var(--color-primary-strong)" opacity="0.35" />
      {/* eyes */}
      <circle cx="24" cy="32" r="5.5" fill="white" />
      <circle cx="40" cy="32" r="5.5" fill="white" />
      <circle cx="25.5" cy="32.5" r="2.6" fill="#1a1a1a" />
      <circle cx="41.5" cy="32.5" r="2.6" fill="#1a1a1a" />
      {/* smile */}
      <path
        d="M24 42c2.5 3 13.5 3 16 0"
        stroke="#1a1a1a"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* cheeks */}
      <circle cx="19" cy="38" r="2.6" fill="var(--color-primary-strong)" opacity="0.5" />
      <circle cx="45" cy="38" r="2.6" fill="var(--color-primary-strong)" opacity="0.5" />
      {/* left arm */}
      <ellipse cx="11" cy="38" rx="4.5" ry="6" fill="var(--color-primary)" />
      {/* right arm — waving */}
      <ellipse
        cx="53"
        cy="38"
        rx="4.5"
        ry="6"
        fill="var(--color-primary)"
        style={
          waving
            ? { transformOrigin: "53px 32px", animation: "mascot-wave 1s ease-in-out infinite" }
            : undefined
        }
      />
      {/* hard hat */}
      <path d="M14 24a18 18 0 0 1 36 0Z" fill="var(--color-warning)" />
      <rect x="12" y="22" width="40" height="4" rx="2" fill="var(--color-warning)" />
    </svg>
  );
}
