export function StarRating({ rating, reviewCount, size = "sm" }) {
  const rounded = Math.round(rating);
  const stars = "★★★★★".slice(0, rounded) + "☆☆☆☆☆".slice(rounded);
  const textSize = size === "lg" ? "text-base" : "text-xs";

  return (
    <div className={`flex items-center gap-1 ${textSize}`}>
      <span className="text-warning tracking-tight">{stars}</span>
      <span className="text-text-muted">
        {rating.toFixed(1)}
        {reviewCount != null ? ` (${reviewCount})` : ""}
      </span>
    </div>
  );
}
