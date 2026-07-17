"use client";

import { useEffect, useState } from "react";
import { CategoryIcon } from "./category-icon";

const SLUGS = ["temizlik", "tadilat", "nakliyat", "tamir", "ozel-ders", "organizasyon"];

export default function Loading() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setIndex((i) => (i + 1) % SLUGS.length), 550);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg">
      <div
        key={index}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600"
        style={{ animation: "loading-pop 0.55s ease-in-out" }}
      >
        <CategoryIcon slug={SLUGS[index]} size={30} />
      </div>
      <div className="text-sm font-medium text-text-muted">Yükleniyor...</div>
    </div>
  );
}
