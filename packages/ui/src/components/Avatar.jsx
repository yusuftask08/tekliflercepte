import Image from "next/image";

const SIZES = {
  sm: { className: "h-9 w-9 text-xs", px: 36 },
  md: { className: "h-12 w-12 text-sm", px: 48 },
  lg: { className: "h-[72px] w-[72px] text-xl border-4 border-bg", px: 72 },
};

function initialsOf(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function Avatar({ name, src, size = "md", className = "" }) {
  const { className: sizeClasses, px } = SIZES[size] ?? SIZES.md;
  if (src) {
    return (
      <Image
        src={src}
        alt={name ?? ""}
        width={px}
        height={px}
        className={`flex-shrink-0 rounded-full object-cover ${sizeClasses} ${className}`}
      />
    );
  }
  return (
    <div
      className={`flex flex-shrink-0 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700 ${sizeClasses} ${className}`}
    >
      {initialsOf(name)}
    </div>
  );
}
