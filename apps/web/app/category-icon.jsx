const PATHS = {
  // top-level groups
  temizlik: <path d="M4 4h16v6H4zM4 14h10v6H4z" />,
  tadilat: (
    <>
      <path d="M5 21V8l7-5 7 5v13" />
      <path d="M9 21v-5h6v5" />
    </>
  ),
  nakliyat: (
    <>
      <path d="M3 16V7h11v9M14 10h4l3 3v3h-7" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </>
  ),
  tamir: <path d="M14.7 6.3a4 4 0 1 1-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 1 1 5.4-5.4L14.7 6.3Z" />,
  "ozel-ders": (
    <>
      <path d="M12 3 2 8l10 5 10-5-10-5Z" />
      <path d="M6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5" />
    </>
  ),
  organizasyon: (
    <>
      <rect x="4" y="9" width="16" height="11" rx="1" />
      <path d="M4 13h16M12 9v11" />
      <path d="M12 9c-1.5 0-3-1-3-2.5S10.5 4 12 6c1.5-2 3-1 3 .5S13.5 9 12 9Z" />
    </>
  ),
  diger: (
    <>
      <circle cx="5" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="19" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),

  // legacy slugs kept for existing subcategory rows
  "ev-temizligi": <path d="M4 4h16v6H4zM4 14h10v6H4z" />,
  "boya-badana": (
    <>
      <path d="M4 21V9l8-6 8 6v12" />
      <path d="M9 21v-6h6v6" />
    </>
  ),
  elektrikci: (
    <path d="M12 2v4M12 18v4M4.9 4.9l2.8 2.8M16.3 16.3l2.8 2.8M2 12h4M18 12h4M4.9 19.1l2.8-2.8M16.3 7.7l2.8-2.8" />
  ),
  "klima-servisi": (
    <>
      <rect x="4" y="6" width="16" height="10" rx="2" />
      <path d="M9 20h6" />
    </>
  ),
};

const DEFAULT_PATH = <path d="M12 2l2.5 6.5L21 10l-5 4 1.5 7L12 17l-5.5 4L8 14l-5-4 6.5-1.5Z" />;

export function CategoryIcon({ slug, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      {PATHS[slug] ?? DEFAULT_PATH}
    </svg>
  );
}
