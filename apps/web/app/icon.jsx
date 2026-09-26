import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
        <rect width="32" height="32" rx="9" fill="#0c7c67" />
        <path
          d="M9.5 8.5h13a2.5 2.5 0 0 1 2.5 2.5v7.5a2.5 2.5 0 0 1-2.5 2.5h-6.5l-4.5 3.8V21H9.5A2.5 2.5 0 0 1 7 18.5V11a2.5 2.5 0 0 1 2.5-2.5Z"
          fill="white"
        />
        <path d="M12.3 14.9l2.6 2.6 4.8-5" stroke="#0c7c67" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    { ...size }
  );
}
