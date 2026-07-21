"use client";

import { useState } from "react";
import Image from "next/image";
import { Lightbox } from "@tekliflercepte/ui";

export function PortfolioGallery({ photoUrls }) {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <div className="mb-8">
      <div className="mb-2.5 font-bold">Geçmiş İşlerden</div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {photoUrls.map((url, i) => (
          <button
            key={url}
            type="button"
            onClick={() => setOpenIndex(i)}
            aria-label="Fotoğrafı büyüt"
            className="relative aspect-square w-full overflow-hidden rounded-md"
          >
            <Image
              src={url}
              alt=""
              fill
              sizes="(min-width: 640px) 25vw, 33vw"
              className="object-cover transition hover:scale-105"
            />
          </button>
        ))}
      </div>

      <Lightbox
        images={photoUrls}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
      />
    </div>
  );
}
