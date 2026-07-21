const STAR_PATH = "M12 2.5l2.9 6.2 6.6.7-5 4.6 1.4 6.6L12 17.4l-5.9 3.2 1.4-6.6-5-4.6 6.6-.7L12 2.5Z";

function Star({ filled, size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      <path d={STAR_PATH} />
    </svg>
  );
}

/** Interactive 1-5 star picker — same star shape as the read-only
 *  StarRating, so a review form's input matches how ratings are displayed
 *  everywhere else instead of using its own text-character stars. */
export function StarPicker({ value, onChange, size = 28 }) {
  return (
    <div className="flex items-center gap-1 text-warning">
      {Array.from({ length: 5 }, (_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i + 1)}
          aria-label={`${i + 1} yıldız`}
        >
          <Star filled={i < value} size={size} />
        </button>
      ))}
    </div>
  );
}

export function StarRating({ rating, reviewCount, size = "sm" }) {
  const rounded = Math.round(rating);
  const px = size === "lg" ? 18 : 13;
  const textSize = size === "lg" ? "text-base" : "text-xs";

  return (
    <div className={`flex items-center gap-1 ${textSize}`}>
      <span className="flex items-center gap-0.5 text-warning">
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} filled={i < rounded} size={px} />
        ))}
      </span>
      <span className="text-text-muted">
        {rating.toFixed(1)}
        {reviewCount != null ? ` (${reviewCount})` : ""}
      </span>
    </div>
  );
}
