const TONES = {
  temizlik: { bg: "bg-brand-100", fg: "text-brand-600" },
  tadilat: { bg: "bg-warning/10", fg: "text-warning" },
  nakliyat: { bg: "bg-info/10", fg: "text-info" },
  tamir: { bg: "bg-danger/10", fg: "text-danger" },
  "ozel-ders": { bg: "bg-success/10", fg: "text-success" },
  organizasyon: { bg: "bg-brand-100", fg: "text-brand-600" },
  diger: { bg: "bg-border", fg: "text-text-muted" },

  // legacy slugs kept for existing subcategory rows
  "ev-temizligi": { bg: "bg-brand-100", fg: "text-brand-600" },
  "boya-badana": { bg: "bg-warning/10", fg: "text-warning" },
  elektrikci: { bg: "bg-danger/10", fg: "text-danger" },
  "klima-servisi": { bg: "bg-info/10", fg: "text-info" },
};

const DEFAULT_TONE = { bg: "bg-brand-100", fg: "text-brand-600" };

export function categoryTone(slug) {
  return TONES[slug] ?? DEFAULT_TONE;
}
