const SIZES = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-[72px] w-[72px] text-xl border-4 border-bg",
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
  const sizeClasses = SIZES[size] ?? SIZES.md;
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={name ?? ""}
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
