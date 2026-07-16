import { LegalPage } from "../legal-page";

export const metadata = { title: "Gizlilik Politikası — Teklifler Cepte" };

export default function GizlilikPolitikasiPage() {
  return (
    <LegalPage title="Gizlilik Politikası">
      <section>
        <h2 className="mb-1.5 font-bold text-text">Topladığımız Veriler</h2>
        <p>
          Hesap oluştururken ad, soyad, telefon numarası ve email adresini topluyoruz. Usta
          hesapları için ayrıca iş türü (şahıs/şirket) ve varsa şirket bilgileri, hizmet
          verilen il/ilçe/mahalle, sunulan hizmet kategorileri, profil fotoğrafı, tanıtım yazısı
          ve geçmiş iş fotoğrafları toplanır. Talep oluştururken kategori, konum, talep detayları
          ve varsa fotoğraflar kaydedilir. Kullanıcılar arası mesajlar, teklif üzerinden yürüyen
          görüşme geçmişi olarak saklanır.
        </p>
      </section>

      <section>
        <h2 className="mb-1.5 font-bold text-text">Verileri Nasıl Kullanıyoruz</h2>
        <p>
          Bu veriler; talebini uygun ustalarla eşleştirmek, teklif ve mesaj bildirimlerini
          göndermek, profilini diğer kullanıcılara göstermek ve platformun güvenliğini sağlamak
          (şikayet/engelleme sistemi, kimlik doğrulama) amacıyla kullanılır. Fotoğraflar,
          yayınlanmadan önce içerik uygunluğu açısından incelenebilir.
        </p>
      </section>

      <section>
        <h2 className="mb-1.5 font-bold text-text">Kimlerle Paylaşıyoruz</h2>
        <p>
          Bilgilerin, sadece talebine teklif veren ya da teklifini aldığın kişilerle ve platformun
          işleyişi için gerekli ölçüde paylaşılır. Telefon numaran, herkese açık usta arama
          sayfalarında hiçbir zaman gösterilmez. Verilerin reklam amacıyla üçüncü taraflara
          satılması söz konusu değildir.
        </p>
      </section>

      <section>
        <h2 className="mb-1.5 font-bold text-text">Veri Güvenliği</h2>
        <p>
          Şifreler tersine çevrilemez şekilde saklanır (hash&apos;lenir), oturum bilgileri güvenli
          çerezlerle yönetilir ve yalnızca yetkili kullanıcılar kendi verilerine erişebilir.
        </p>
      </section>

      <section>
        <h2 className="mb-1.5 font-bold text-text">Haklarınız</h2>
        <p>
          Kayıtlı bilgilerine profilinden erişebilir, güncelleyebilir; hesabının ve verilerinin
          silinmesini destek@tekliflercepte.com adresinden talep edebilirsin. Detaylı haklar için
          KVKK Aydınlatma Metni&apos;ne bakabilirsin.
        </p>
      </section>
    </LegalPage>
  );
}
