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
    await prisma.category.upsert({
      where: { slug: slugify(childName) },
      update: { parentId: parent.id },
      create: { name: childName, slug: slugify(childName), parentId: parent.id },
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
// first admin account has to come from here. Dev-only convenience password;
// rotate it (and remove this block) before any real deployment.
const adminPhone = "05550000000";
const existingAdmin = await prisma.user.findUnique({ where: { phone: adminPhone } });
if (!existingAdmin) {
  const devPassword = randomBytes(6).toString("hex");
  await prisma.user.create({
    data: {
      firstName: "Admin",
      lastName: "Teklifler Cepte",
      phone: adminPhone,
      passwordHash: await bcrypt.hash(devPassword, 10),
      role: "ADMIN",
    },
  });
  console.log(`Admin user created — phone: ${adminPhone}, password: ${devPassword} (dev only, rotate before deploy)`);
} else {
  console.log("Admin user already exists, skipped.");
}

await prisma.$disconnect();
