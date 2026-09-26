import { ImageResponse } from "next/og";

// Full-bleed square (maskable-safe: the bubble sits well inside the center
// 80%) — same speech-bubble-with-check mark as BrandMark in app/brand-logo.jsx.
export function appIconResponse(px) {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0c7c67" }}>
        <svg width={px * 0.62} height={px * 0.62} viewBox="7 8 18 18" fill="none">
          <path
            d="M9.5 8.5h13a2.5 2.5 0 0 1 2.5 2.5v7.5a2.5 2.5 0 0 1-2.5 2.5h-6.5l-4.5 3.8V21H9.5A2.5 2.5 0 0 1 7 18.5V11a2.5 2.5 0 0 1 2.5-2.5Z"
            fill="white"
          />
          <path d="M12.3 14.9l2.6 2.6 4.8-5" stroke="#0c7c67" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    { width: px, height: px }
  );
}
