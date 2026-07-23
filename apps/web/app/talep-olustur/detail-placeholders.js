/** Per-category example text for the "İşin detaylarını anlat" textarea.
 *  Before this, every category showed the same cleaning-flat example
 *  ("3+1 daire, genel temizlik...") regardless of what was actually picked —
 *  unhelpful for a locksmith or piano-lesson request. Wording style modeled
 *  on Armut's own real request flow (short, concrete, closed-ended). */

const SUBCATEGORY_PLACEHOLDERS = {
  "Ev Temizliği": "Örn: 3+1 daire, haftalık genel temizlik, cam dahil",
  "Boş Ev Temizliği": "Örn: 120 m² boş daire, taşınma öncesi ince temizlik",
  "Halı Yıkama": "Örn: 3 halı (yaklaşık 4x6 m), yerinde yıkama, evcil hayvan lekesi var",
  "İlaçlama": "Örn: 2+1 daire, hamamböceği şikayeti, evde çocuk/evcil hayvan var",
  "Ev İlaçlama": "Örn: 2+1 daire, hamamböceği şikayeti, evde çocuk/evcil hayvan var",
  "Böcek İlaçlama": "Örn: 2+1 daire, hamamböceği şikayeti, evde çocuk/evcil hayvan var",
  "Boya Badana": "Örn: 3 oda salon, tavan dahil, malzeme fiyata dahil olsun",
  "Banyo Tadilat": "Örn: banyo tadilatı, 6 m², seramik değişimi, tesisat yenileme",
  "Banyo Yenileme": "Örn: banyo tadilatı, 6 m², seramik değişimi, tesisat yenileme",
  "Evden Eve Nakliyat": "Örn: 2+1'den 3+1'e taşınma, 3. kat asansörsüz, eşyalar paketlenecek",
  "Parça Eşya Taşıma": "Örn: tek koltuk taşınacak, 2. kattan zemine, aynı gün",
  "Elektrikçi": "Örn: salon aydınlatması çalışmıyor, sigorta sık atıyor",
  "Kombi Servisi": "Örn: kombi ısıtmıyor, en son ne zaman bakım yapıldığını yaz",
  "Çilingir": "Örn: anahtar kırıldı, kapı içeriden kilitli kaldı, acil",
  "İngilizce Özel Ders": "Örn: A2 seviye, haftada 2 gün, konuşma pratiği ağırlıklı",
  "Piyano Dersi": "Örn: 8 yaşında, yeni başlıyor, evde piyano mevcut",
  "Yüzme Dersi": "Örn: yetişkin, hiç yüzme bilmiyor, havuzda özel ders",
  "Düğün Organizasyon": "Örn: 150 kişilik davet, mekan önerisi de istiyorum, bütçe 100-150 bin TL",
  "Catering": "Örn: 80 kişilik açık büfe, glutensiz seçenek gerekli",
  "DJ": "Örn: düğün için 4 saat, açılış dansı şarkısı belirli",
};

const GROUP_PLACEHOLDERS = {
  Temizlik: "Örn: kaç m²/oda olduğunu ve ne zaman yapılması gerektiğini kısaca yaz",
  Tadilat: "Örn: kaç m²/oda olduğunu ve ne tür bir tadilat istediğini kısaca yaz",
  Nakliyat: "Örn: nereden nereye taşınacağını ve eşya miktarını kısaca yaz",
  Tamir: "Örn: sorunu ve ne zamandır olduğunu kısaca yaz",
  "Özel Ders": "Örn: seviyeni ve ders sıklığını kısaca yaz",
  Organizasyon: "Örn: kaç kişilik olduğunu, tarihi ve bütçeni kısaca yaz",
};

const DEFAULT_PLACEHOLDER = "Örn: neye ihtiyacın olduğunu, ne zaman ve nerede yapılacağını kısaca yaz";

export function getDetailsPlaceholder(group, category) {
  return (
    SUBCATEGORY_PLACEHOLDERS[category?.name] ??
    GROUP_PLACEHOLDERS[group?.name] ??
    DEFAULT_PLACEHOLDER
  );
}
