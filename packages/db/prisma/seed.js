import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "../index.js";

function slugify(name) {
  const map = { ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u", İ: "i" };
  return name
    .toLowerCase()
    .replace(/[çğıöşüİ]/g, (ch) => map[ch] ?? ch)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Real category taxonomy pulled from armut.com's own category hubs
// (armut.com/g/temizlik-1, /g/tadilat-2, /g/nakliyat-3, /g/tamir-4,
// /g/ozel-ders-5, /g/organizasyon-9, /g/diger) — trimmed to a representative
// subset per group rather than their full, thousand-plus-entry long tail.
// Qualifying questions shown in the request wizard once a group's subcategory
// is picked — helps providers quote accurately without a free-text-only form.
const QUESTIONS = {
  Temizlik: [
    { id: "alan_m2", label: "Alan büyüklüğü (m²)", type: "number" },
    { id: "oda_sayisi", label: "Kaç oda?", type: "number" },
    { id: "siklik", label: "Temizlik sıklığı", type: "select", options: ["Tek seferlik", "Haftalık", "Aylık"] },
  ],
  Tadilat: [
    { id: "alan_m2", label: "Alan büyüklüğü (m²)", type: "number" },
    { id: "kapsam", label: "İşin kapsamı", type: "select", options: ["Küçük tadilat", "Kapsamlı yenileme"] },
    { id: "malzeme", label: "Malzeme dahil mi?", type: "select", options: ["Evet, ustadan", "Hayır, kendim alacağım"] },
  ],
  Nakliyat: [
    { id: "ev_buyuklugu", label: "Eşya miktarı", type: "select", options: ["Stüdyo / 1+1", "2+1 - 3+1", "4+1 ve üzeri"] },
    { id: "asansor", label: "Asansör var mı?", type: "select", options: ["Evet", "Hayır"] },
    { id: "varis_adresi", label: "Varış adresi (şehir/ilçe)", type: "text" },
  ],
  Tamir: [
    { id: "marka_model", label: "Marka / Model (varsa)", type: "text" },
    { id: "aciliyet", label: "Aciliyet durumu", type: "select", options: ["Bugün / yarın", "Bu hafta içinde", "Esnek"] },
  ],
  "Özel Ders": [
    { id: "seviye", label: "Seviye", type: "select", options: ["Başlangıç", "Orta", "İleri"] },
    { id: "ders_sekli", label: "Ders şekli", type: "select", options: ["Yüz yüze", "Online"] },
    { id: "haftalik_ders", label: "Haftada kaç ders?", type: "number" },
  ],
  Organizasyon: [
    { id: "kisi_sayisi", label: "Kişi sayısı", type: "number" },
  ],
};

// Overrides for specific subcategories whose group default doesn't fit them
// — e.g. Temizlik's "kaç oda?" makes no sense for Apartman Temizliği (a
// building's common areas) or Kuru Temizleme (a garment count, not a home).
// Only the subcategories that actually need something different are listed
// here; everything else falls back to its group's questions in the wizard.
const SUBCATEGORY_QUESTIONS = {
  // Temizlik
  "Ofis Temizliği": [
    { id: "alan_m2", label: "Alan büyüklüğü (m²)", type: "number" },
    { id: "calisan_sayisi", label: "Çalışan sayısı", type: "number" },
    { id: "siklik", label: "Temizlik sıklığı", type: "select", options: ["Tek seferlik", "Haftalık", "Aylık"] },
  ],
  "Boş Ev Temizliği": [
    { id: "alan_m2", label: "Alan büyüklüğü (m²)", type: "number" },
    { id: "oda_sayisi", label: "Kaç oda?", type: "number" },
  ],
  "Halı Yıkama": [
    { id: "hali_adedi", label: "Kaç halı?", type: "number" },
    {
      id: "hali_boyutu",
      label: "Halı boyutu",
      type: "select",
      options: ["Küçük (2m²'ye kadar)", "Orta (2-6m²)", "Büyük (6m²'den fazla)"],
    },
  ],
  "Koltuk Yıkama": [{ id: "koltuk_adedi", label: "Kaç koltuk/kanepe?", type: "number" }],
  "Cam Temizliği": [{ id: "pencere_sayisi", label: "Kaç pencere?", type: "number" }],
  "İnşaat Sonrası Temizlik": [
    { id: "alan_m2", label: "Alan büyüklüğü (m²)", type: "number" },
    { id: "oda_sayisi", label: "Kaç oda?", type: "number" },
  ],
  "Apartman Temizliği": [
    { id: "daire_sayisi", label: "Kaç daire?", type: "number" },
    { id: "siklik", label: "Temizlik sıklığı", type: "select", options: ["Tek seferlik", "Haftalık", "Aylık"] },
  ],
  "İlaçlama": [
    { id: "hasere_turu", label: "Haşere türü", type: "select", options: ["Hamamböceği", "Karınca", "Güve", "Fare", "Diğer"] },
    { id: "alan_m2", label: "Alan büyüklüğü (m²)", type: "number" },
  ],
  "Ev İlaçlama": [
    { id: "hasere_turu", label: "Haşere türü", type: "select", options: ["Hamamböceği", "Karınca", "Güve", "Fare", "Diğer"] },
    { id: "alan_m2", label: "Alan büyüklüğü (m²)", type: "number" },
  ],
  "Böcek İlaçlama": [
    { id: "hasere_turu", label: "Haşere türü", type: "select", options: ["Hamamböceği", "Karınca", "Güve", "Fare", "Diğer"] },
    { id: "alan_m2", label: "Alan büyüklüğü (m²)", type: "number" },
  ],
  "Merdiven Temizliği": [
    { id: "kat_sayisi", label: "Kaç kat?", type: "number" },
    { id: "siklik", label: "Temizlik sıklığı", type: "select", options: ["Tek seferlik", "Haftalık", "Aylık"] },
  ],
  "Taşınma Öncesi Temizlik": [
    { id: "alan_m2", label: "Alan büyüklüğü (m²)", type: "number" },
    { id: "oda_sayisi", label: "Kaç oda?", type: "number" },
  ],
  "Yatak Yıkama": [
    { id: "yatak_adedi", label: "Kaç yatak?", type: "number" },
    { id: "yatak_boyutu", label: "Yatak boyutu", type: "select", options: ["Tek Kişilik", "Çift Kişilik"] },
  ],
  "Kuru Temizleme": [
    { id: "parca_sayisi", label: "Kaç parça?", type: "number" },
    {
      id: "giysi_tipi",
      label: "Giysi tipi",
      type: "select",
      options: ["Günlük Kıyafet", "Takım Elbise/Ceket", "Perde", "Battaniye/Yorgan", "Diğer"],
    },
  ],

  // Tamir
  Elektrikçi: [
    { id: "is_turu", label: "İş türü", type: "select", options: ["Priz/Anahtar", "Aydınlatma", "Sigorta/Pano", "Tesisat", "Diğer"] },
    { id: "aciliyet", label: "Aciliyet durumu", type: "select", options: ["Bugün / yarın", "Bu hafta içinde", "Esnek"] },
  ],
  "Su Tesisatçısı": [
    {
      id: "sorun_turu",
      label: "Sorun türü",
      type: "select",
      options: ["Tıkanıklık", "Su Kaçağı", "Musluk/Batarya", "Tesisat Değişimi", "Diğer"],
    },
    { id: "aciliyet", label: "Aciliyet durumu", type: "select", options: ["Bugün / yarın", "Bu hafta içinde", "Esnek"] },
  ],
  Çilingir: [
    { id: "sorun_turu", label: "Sorun türü", type: "select", options: ["Kapıda Kaldım", "Anahtar Kayıp", "Kilit Değişimi", "Diğer"] },
    { id: "aciliyet", label: "Aciliyet durumu", type: "select", options: ["Hemen", "Bugün içinde", "Esnek"] },
  ],
  "Güvenlik Kamera Montajı": [
    { id: "parca_sayisi", label: "Kaç kamera?", type: "number" },
    { id: "aciliyet", label: "Aciliyet durumu", type: "select", options: ["Bugün / yarın", "Bu hafta içinde", "Esnek"] },
  ],
  "IKEA Montaj": [{ id: "parca_sayisi", label: "Kaç parça mobilya?", type: "number" }],
  "Dolap Montajı": [{ id: "parca_sayisi", label: "Kaç parça dolap?", type: "number" }],
  "Gider Açma": [
    { id: "sorun_yeri", label: "Sorun nerede?", type: "select", options: ["Lavabo", "Klozet", "Duş/Gider", "Diğer"] },
    { id: "aciliyet", label: "Aciliyet durumu", type: "select", options: ["Hemen", "Bugün içinde", "Esnek"] },
  ],

  // Nakliyat
  Hamal: [
    { id: "esya_miktari", label: "Eşya miktarı", type: "select", options: ["Birkaç parça", "Tek oda", "Tüm ev"] },
    { id: "kat", label: "Kaçıncı kat?", type: "number" },
  ],
  "Eşya Depolama": [
    { id: "esya_miktari", label: "Eşya miktarı", type: "select", options: ["Az (birkaç kutu)", "Orta (1 oda)", "Çok (tüm ev)"] },
    { id: "sure", label: "Depolama süresi", type: "select", options: ["1 ay", "3 ay", "6 ay ve üzeri"] },
  ],
  Kurye: [
    { id: "gonderi_turu", label: "Gönderi türü", type: "select", options: ["Evrak", "Küçük Paket", "Yemek", "Diğer"] },
    { id: "aciliyet", label: "Aciliyet durumu", type: "select", options: ["Hemen", "Bugün içinde", "Planlı"] },
  ],
  "Moto Kurye": [
    { id: "gonderi_turu", label: "Gönderi türü", type: "select", options: ["Evrak", "Küçük Paket", "Yemek", "Diğer"] },
    { id: "aciliyet", label: "Aciliyet durumu", type: "select", options: ["Hemen", "Bugün içinde", "Planlı"] },
  ],
  "Havaalanı Transfer": [
    { id: "yolcu_sayisi", label: "Yolcu sayısı", type: "number" },
    { id: "tarih_saat", label: "Tarih ve saat", type: "text" },
  ],
  "Vip Transfer": [
    { id: "yolcu_sayisi", label: "Yolcu sayısı", type: "number" },
    { id: "tarih_saat", label: "Tarih ve saat", type: "text" },
  ],
  "Şoförlü Araç Kiralama": [
    { id: "yolcu_sayisi", label: "Yolcu sayısı", type: "number" },
    { id: "tarih_saat", label: "Tarih ve saat", type: "text" },
  ],
  "Oto Çekici": [
    { id: "arac_durumu", label: "Araç durumu", type: "select", options: ["Çalışmıyor", "Kaza", "Lastik Patlak", "Diğer"] },
    { id: "konum", label: "Aracın bulunduğu konum", type: "text" },
  ],

  // Özel Ders
  "Yüzme Dersi": [
    { id: "seviye", label: "Seviye", type: "select", options: ["Başlangıç", "Orta", "İleri"] },
    { id: "yas_grubu", label: "Yaş grubu", type: "select", options: ["Çocuk", "Yetişkin"] },
    { id: "haftalik_ders", label: "Haftada kaç ders?", type: "number" },
  ],
  "Direksiyon Dersi": [
    { id: "seviye", label: "Seviye", type: "select", options: ["Hiç Kullanmadım", "Sınava Hazırlık", "Tazeleme"] },
  ],
  Diyetisyen: [
    { id: "hedef", label: "Hedef", type: "select", options: ["Kilo Verme", "Kilo Alma", "Sağlıklı Beslenme", "Spor Beslenmesi"] },
    { id: "ders_sekli", label: "Görüşme şekli", type: "select", options: ["Yüz yüze", "Online"] },
  ],

  // Organizasyon
  Çiçekçi: [
    { id: "urun_turu", label: "Ürün türü", type: "select", options: ["Buket", "Aranjman", "Düğün Çiçekleri", "Çelenk"] },
    { id: "teslim_tarihi", label: "Teslim tarihi", type: "text" },
  ],
  DJ: [
    { id: "etkinlik_turu", label: "Etkinlik türü", type: "select", options: ["Düğün", "Doğum Günü", "Kurumsal", "Diğer"] },
    { id: "sure_saat", label: "Kaç saat?", type: "number" },
  ],
  "Gelin Arabası Kiralama": [
    { id: "arac_tipi", label: "Araç tipi", type: "select", options: ["Klasik Araba", "Lüks Araç", "Diğer"] },
    { id: "tarih", label: "Tarih", type: "text" },
  ],

  // Diğer — this group has no shared default at all, so every subcategory
  // below would otherwise show zero qualifying questions.
  Kuaför: [{ id: "hizmet_yeri", label: "Hizmet yeri", type: "select", options: ["Salonda", "Evimde"] }],
  Makyaj: [{ id: "hizmet_yeri", label: "Hizmet yeri", type: "select", options: ["Salonda", "Evimde"] }],
  Epilasyon: [{ id: "hizmet_yeri", label: "Hizmet yeri", type: "select", options: ["Salonda", "Evimde"] }],
  Fotoğrafçı: [
    { id: "etkinlik_turu", label: "Çekim türü", type: "select", options: ["Düğün", "Doğum Günü", "Kurumsal", "Ürün", "Diğer"] },
    { id: "sure_saat", label: "Kaç saat?", type: "number" },
  ],
  "Düğün Fotoğrafçısı": [
    { id: "etkinlik_turu", label: "Çekim türü", type: "select", options: ["Düğün", "Nişan", "Dış Çekim", "Diğer"] },
    { id: "sure_saat", label: "Kaç saat?", type: "number" },
  ],
  "Drone Çekimi": [{ id: "cekim_konusu", label: "Çekim konusu", type: "text" }],
  Psikolog: [{ id: "gorusme_sekli", label: "Görüşme şekli", type: "select", options: ["Yüz yüze", "Online"] }],
  "Yaşam Koçu": [{ id: "gorusme_sekli", label: "Görüşme şekli", type: "select", options: ["Yüz yüze", "Online"] }],
  "Oto Boya": [{ id: "arac_bilgisi", label: "Araç marka/model", type: "text" }],
  "Oto Klima": [{ id: "arac_bilgisi", label: "Araç marka/model", type: "text" }],
  Lastikçi: [{ id: "arac_bilgisi", label: "Araç marka/model", type: "text" }],
  "Köpek Bakımı": [{ id: "hizmet_yeri", label: "Hizmet yeri", type: "select", options: ["Evimde", "Sizde"] }],
  "Kedi Bakımı": [{ id: "hizmet_yeri", label: "Hizmet yeri", type: "select", options: ["Evimde", "Sizde"] }],
  "Köpek Eğitimi": [{ id: "hizmet_yeri", label: "Hizmet yeri", type: "select", options: ["Evimde", "Sizde"] }],
  "Logo Tasarım": [{ id: "proje_kapsami", label: "Projeni kısaca anlat", type: "text" }],
  "İnternet Sitesi Oluşturma": [{ id: "proje_kapsami", label: "Projeni kısaca anlat", type: "text" }],
  "SEO Hizmeti": [{ id: "proje_kapsami", label: "Projeni kısaca anlat", type: "text" }],
  Tercüme: [
    { id: "dil_cifti", label: "Hangi dilden hangi dile?", type: "text" },
    { id: "belge_turu", label: "Belge türü", type: "select", options: ["Resmi Evrak", "Akademik", "Ticari", "Diğer"] },
  ],
  Terzi: [
    {
      id: "islem_turu",
      label: "İşlem türü",
      type: "select",
      options: ["Daraltma/Genişletme", "Boy Kısaltma", "Yeni Dikim", "Diğer"],
    },
  ],
  Muhasebe: [
    {
      id: "hizmet_turu",
      label: "Hizmet türü",
      type: "select",
      options: ["Şahıs Şirketi", "Limited/AŞ", "Serbest Meslek", "Diğer"],
    },
  ],
};

const TAXONOMY = [
  {
    name: "Temizlik",
    children: [
      "Ev Temizliği",
      "Ofis Temizliği",
      "Boş Ev Temizliği",
      "Halı Yıkama",
      "Koltuk Yıkama",
      "Cam Temizliği",
      "İnşaat Sonrası Temizlik",
      "Apartman Temizliği",
      "İlaçlama",
      "Ev İlaçlama",
      "Böcek İlaçlama",
      "Merdiven Temizliği",
      "Taşınma Öncesi Temizlik",
      "Yatak Yıkama",
      "Kuru Temizleme",
    ],
  },
  {
    name: "Tadilat",
    children: [
      "Boya Badana",
      "Banyo Tadilat",
      "Banyo Yenileme",
      "Alçıpan",
      "Fayans Döşeme",
      "Parke Döşeme",
      "Çatı Tamiri",
      "Bahçe Bakımı",
      "Bahçe Peyzaj",
      "Anahtar Teslim Tadilat",
      "Ahşap Kapı",
      "Cam Balkon",
      "Balkon Kapatma",
      "Asma Tavan",
      "Mutfak Dolabı Yapımı",
    ],
  },
  {
    name: "Nakliyat",
    children: [
      "Evden Eve Nakliyat",
      "Ofis Taşıma",
      "Eşya Taşıma",
      "Parça Eşya Taşıma",
      "Şehirler Arası Nakliye",
      "Hamal",
      "Eşya Depolama",
      "Kurye",
      "Moto Kurye",
      "Havaalanı Transfer",
      "Şoförlü Araç Kiralama",
      "Asansörlü Nakliyat",
      "Oto Çekici",
      "Vip Transfer",
    ],
  },
  {
    name: "Tamir",
    children: [
      "Elektrikçi",
      "Kombi Servisi",
      "Klima Montaj",
      "Klima Servisi",
      "Çilingir",
      "Su Tesisatçısı",
      "Beyaz Eşya Servisi",
      "Buzdolabı Tamiri",
      "Çamaşır Makinesi Tamiri",
      "TV Tamiri",
      "Bilgisayar Tamiri",
      "iPhone Servisi",
      "Güvenlik Kamera Montajı",
      "IKEA Montaj",
      "Dolap Montajı",
      "Gider Açma",
    ],
  },
  {
    name: "Özel Ders",
    children: [
      "İngilizce Özel Ders",
      "Matematik Özel Ders",
      "Piyano Dersi",
      "Gitar Dersi",
      "Yüzme Dersi",
      "Direksiyon Dersi",
      "Yoga Dersi",
      "Pilates Dersi",
      "Personal Trainer",
      "Diyetisyen",
      "Online İngilizce Özel Ders",
      "LGS Matematik Özel Ders",
      "YKS Koçu",
      "Almanca Özel Ders",
    ],
  },
  {
    name: "Organizasyon",
    children: [
      "Düğün Organizasyon",
      "Nişan Organizasyon",
      "Doğum Günü Organizasyonu",
      "Kına Organizasyon",
      "Catering",
      "Çiçekçi",
      "DJ",
      "Pasta",
      "Ses Sistemi Kiralama",
      "Masa Sandalye Kiralama",
      "Gelin Arabası Kiralama",
    ],
  },
  {
    name: "Diğer",
    children: [
      "Kuaför",
      "Makyaj",
      "Epilasyon",
      "Fotoğrafçı",
      "Düğün Fotoğrafçısı",
      "Drone Çekimi",
      "Psikolog",
      "Yaşam Koçu",
      "Oto Boya",
      "Oto Klima",
      "Lastikçi",
      "Köpek Bakımı",
      "Kedi Bakımı",
      "Köpek Eğitimi",
      "Logo Tasarım",
      "İnternet Sitesi Oluşturma",
      "SEO Hizmeti",
      "Tercüme",
      "Terzi",
      "Muhasebe",
    ],
  },
];

for (const group of TAXONOMY) {
  const questions = QUESTIONS[group.name] ?? null;
  const parent = await prisma.category.upsert({
    where: { slug: slugify(group.name) },
    update: { questions },
    create: { name: group.name, slug: slugify(group.name), questions },
  });

  for (const childName of group.children) {
    const childQuestions = SUBCATEGORY_QUESTIONS[childName] ?? null;
    await prisma.category.upsert({
      where: { slug: slugify(childName) },
      update: { parentId: parent.id, questions: childQuestions },
      create: { name: childName, slug: slugify(childName), parentId: parent.id, questions: childQuestions },
    });
  }
}

// Cleanup: the very first seed pass (before the full taxonomy) created a
// one-off "Tadilat & Tesisat" top-level category that the real Armut-derived
// taxonomy above replaces with "Tadilat" — fold it in rather than leaving a
// stale duplicate top-level entry.
const staleTadilat = await prisma.category.findUnique({ where: { slug: "tadilat-tesisat" } });
if (staleTadilat) {
  const tadilatParent = await prisma.category.findUnique({ where: { slug: "tadilat" } });
  await prisma.category.delete({ where: { id: staleTadilat.id } }).catch(async () => {
    await prisma.category.update({
      where: { id: staleTadilat.id },
      data: { parentId: tadilatParent.id },
    });
  });
}

const total = await prisma.category.count();
console.log(`Seeded ${TAXONOMY.length} main categories and ${total - TAXONOMY.length} subcategories (${total} total).`);

// Admin seed — panel.tekliflercepte.com has no public registration, so the
// first admin account has to come from here. In prod, set ADMIN_SEED_PASSWORD
// so the password is something you actually chose rather than whatever
// landed in a log line; locally it falls back to a random one for convenience.
const adminPhone = process.env.ADMIN_SEED_PHONE || "05550000000";
const existingAdmin = await prisma.user.findUnique({ where: { phone: adminPhone } });
if (!existingAdmin) {
  const password = process.env.ADMIN_SEED_PASSWORD || randomBytes(6).toString("hex");
  await prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "Teklifler Cepte",
      phone: adminPhone,
      passwordHash: await bcrypt.hash(password, 10),
      role: "ADMIN",
    },
  });
  if (process.env.ADMIN_SEED_PASSWORD) {
    console.log(`Admin user created — phone: ${adminPhone}, password: (from ADMIN_SEED_PASSWORD)`);
  } else {
    console.log(`Admin user created — phone: ${adminPhone}, password: ${password} (random, save this now — it will not be shown again)`);
  }
} else {
  console.log("Admin user already exists, skipped.");
}

await prisma.$disconnect();
