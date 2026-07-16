"use client";

const ITEMS = [
  {
    href: "/",
    label: "Ana Sayfa",
    icon: (color) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-9Z"
          stroke={color}
          strokeWidth="2"
        />
      </svg>
    ),
  },
  {
    href: "/taleplerim",
    label: "Taleplerim",
    icon: (color) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M6 3h12v18l-6-4-6 4V3Z" stroke={color} strokeWidth="2" />
      </svg>
    ),
  },
  {
    href: "/mesajlar",
    label: "Mesajlar",
    icon: (color) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M4 5h16v11H8l-4 4V5Z" stroke={color} strokeWidth="2" />
      </svg>
    ),
  },
  {
    href: "/profil",
    label: "Profil",
    icon: (color) => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2" />
        <path d="M4 21c0-4 4-6 8-6s8 2 8 6" stroke={color} strokeWidth="2" />
      </svg>
    ),
  },
];

export function BottomNav({ active = "/", LinkComponent = "a" }) {
  const Link = LinkComponent;
  return (
    <nav className="flex justify-around border-t border-border bg-surface pb-7 pt-2.5">
      {ITEMS.map((item) => {
        const isActive = item.href === active;
        const color = isActive ? "var(--color-primary)" : "var(--color-text-muted)";
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 text-center ${
              isActive ? "text-primary" : "text-text-muted"
            }`}
          >
            {item.icon(color)}
            <span className={`text-[10px] ${isActive ? "font-semibold" : ""}`}>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
