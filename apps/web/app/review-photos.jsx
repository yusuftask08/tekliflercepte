"use client";

import { useState } from "react";
import Image from "next/image";
import { Lightbox } from "@tekliflercepte/ui";

/** Small thumbnail row + lightbox for a review's "iş öncesi/sonrası"
 *  photos — used both on the request owner's own review (taleplerim/[id])
 *  and on a provider's public review list (usta/[id]). */
export function ReviewPhotos({ photos, apiOrigin, size = "sm" }) {
  const [openIndex, setOpenIndex] = useState(null);
  if (!photos?.length) return null;
  const px = size === "lg" ? "h-16 w-16" : "h-11 w-11";
  const urls = photos.map((url) => `${apiOrigin}${url}`);

  return (
    <>
      <div className="mt-2 flex gap-1.5">
        {urls.map((url, i) => (
          <button
            key={url}
            type="button"
            onClick={() => setOpenIndex(i)}
            aria-label="Fotoğrafı büyüt"
            className={`relative ${px} overflow-hidden rounded-md`}
          >
            <Image src={url} alt="" fill sizes="64px" className="object-cover" />
          </button>
        ))}
      </div>
      <Lightbox images={urls} index={openIndex} onClose={() => setOpenIndex(null)} onNavigate={setOpenIndex} />
    </>
  );
}
