import { LegalPage } from "../legal-page";

export const metadata = { title: "KVKK Aydınlatma Metni — Teklifler Cepte" };

export default function KvkkPage() {
  return (
    <LegalPage title="KVKK Aydınlatma Metni">
      <section>
        <h2 className="mb-1.5 font-bold text-text">Veri Sorumlusu</h2>
        <p>
          6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca, Teklifler
          Cepte platformunu işleten [Şirket Unvanı — kuruluş tamamlandığında eklenecek], veri
          sorumlusu sıfatıyla aşağıda açıklanan kapsamda kişisel verilerini işlemektedir.
        </p>
      </section>

      <section>
        <h2 className="mb-1.5 font-bold text-text">İşlenen Kişisel Veri Kategorileri</h2>
        <p>
          Kimlik bilgileri (ad, soyad), iletişim bilgileri (telefon, email), konum bilgileri
          (il/ilçe/mahalle), Usta hesapları için mesleki bilgiler (hizmet kategorileri, deneyim,
          şirket bilgileri), görsel veriler (profil ve portföy fotoğrafları) ve kullanıcılar arası
          mesajlaşma içerikleri işlenmektedir.
        </p>
      </section>

      <section>
        <h2 className="mb-1.5 font-bold text-text">İşleme Amaçları</h2>
        <p>
          Kişisel verilerin; hizmet talebi ile uygun ustaların eşleştirilmesi, teklif ve mesaj
          bildirimlerinin iletilmesi, kullanıcı profillerinin görüntülenmesi, platform güvenliğinin
          sağlanması (şikayet/engelleme, kimlik doğrulama) ve yasal yükümlülüklerin yerine
          getirilmesi amacıyla işlenmektedir.
        </p>
      </section>

      <section>
        <h2 className="mb-1.5 font-bold text-text">Hukuki Sebep</h2>
        <p>
          Veriler, KVKK madde 5/2 kapsamında bir sözleşmenin kurulması ve ifası ile meşru menfaat
          hukuki sebeplerine dayanılarak işlenmekte; fotoğraf paylaşımı gibi belirli işlemler için
          açık rıza alınmaktadır.
        </p>
      </section>

      <section>
        <h2 className="mb-1.5 font-bold text-text">Aktarım</h2>
        <p>
          Veriler, yalnızca eşleşilen Müşteri/Usta ile ve platformun teknik altyapısını sağlayan
          hizmet sağlayıcılarla (sunucu, email gönderimi gibi) sınırlı ölçüde paylaşılır; pazarlama
          amacıyla üçüncü taraflara aktarılmaz.
        </p>
      </section>

      <section>
        <h2 className="mb-1.5 font-bold text-text">İlgili Kişinin Hakları (KVKK m.11)</h2>
        <p>
          Kişisel verinin işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme,
          işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme, yurt içinde veya
          yurt dışında aktarıldığı üçüncü kişileri bilme, eksik veya yanlış işlenmişse düzeltilmesini
          isteme, KVKK&apos;da öngörülen şartlarda silinmesini isteme ve bu işlemlerin aktarıldığı
          üçüncü kişilere bildirilmesini isteme haklarına sahipsin.
        </p>
      </section>

      <section>
        <h2 className="mb-1.5 font-bold text-text">Başvuru</h2>
        <p>
          Haklarını kullanmak için destek@tekliflercepte.com adresine yazılı olarak
          başvurabilirsin.
        </p>
      </section>
    </LegalPage>
  );
}
