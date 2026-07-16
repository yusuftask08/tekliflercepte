import { LegalPage } from "../legal-page";

export const metadata = { title: "Kullanıcı Sözleşmesi — Teklifler Cepte" };

export default function KullaniciSozlesmesiPage() {
  return (
    <LegalPage title="Kullanıcı Sözleşmesi">
      <section>
        <h2 className="mb-1.5 font-bold text-text">1. Taraflar</h2>
        <p>
          Bu sözleşme, Teklifler Cepte (&quot;Platform&quot;) ile Platform&apos;u kullanan hizmet
          alan (&quot;Müşteri&quot;) ve hizmet veren (&quot;Usta&quot;) kullanıcılar arasındaki
          ilişkiyi düzenler. Şirket unvanı ve iletişim bilgileri: [Şirket Unvanı / Adres / MERSİS
          No — kuruluş tamamlandığında eklenecek].
        </p>
      </section>

      <section>
        <h2 className="mb-1.5 font-bold text-text">2. Hizmetin Niteliği</h2>
        <p>
          Teklifler Cepte, Müşteri ile Usta&apos;yı bir araya getiren bir aracı hizmet
          sağlayıcıdır. Platform, taraflar arasında kurulan hizmet ilişkisinin bir tarafı
          değildir; hizmetin ifası, kalitesi, süresi ve bedeli tamamen Müşteri ile Usta arasındaki
          anlaşmaya bağlıdır. Ödeme, Platform üzerinden değil, doğrudan taraflar arasında
          gerçekleşir.
        </p>
      </section>

      <section>
        <h2 className="mb-1.5 font-bold text-text">3. Üyelik ve Hesap</h2>
        <p>
          Platform&apos;a üye olabilmek için doğru ve güncel bilgi verilmesi zorunludur. Her
          kullanıcı tek bir hesap türü (Müşteri veya Usta) ile kayıt olabilir; aynı hesap her iki
          rolde birden kullanılamaz. Hesap bilgilerinin gizliliğinden kullanıcı sorumludur.
        </p>
      </section>

      <section>
        <h2 className="mb-1.5 font-bold text-text">4. Ücretlendirme</h2>
        <p>
          Talep oluşturmak ve teklif vermek ücretsizdir; Platform, gerçekleşen işlerden komisyon
          almaz. Usta hesapları için ileride opsiyonel, görünürlük/öne çıkma amaçlı ücretli ek
          özellikler sunulabilir — bu tür özellikler her zaman açıkça belirtilir ve tercihe
          bağlıdır, teklif verme veya teklif alma hakkı hiçbir şekilde ücretlendirilmez.
        </p>
      </section>

      <section>
        <h2 className="mb-1.5 font-bold text-text">5. Kullanıcı Yükümlülükleri</h2>
        <p>
          Kullanıcılar; doğru bilgi vermekle, paylaştıkları fotoğraf ve içeriklerin hukuka ve genel
          ahlaka uygun olmasını sağlamakla, diğer kullanıcılara karşı taciz, dolandırıcılık veya
          yanıltıcı davranışta bulunmamakla yükümlüdür. Bu yükümlülüklerin ihlali halinde Platform,
          ilgili talebi, teklifi veya hesabı askıya alma hakkını saklı tutar.
        </p>
      </section>

      <section>
        <h2 className="mb-1.5 font-bold text-text">6. İçerik ve Onay</h2>
        <p>
          Kullanıcılar tarafından yüklenen fotoğraflar ve talep/profil içerikleri, ilgili
          taraflarla paylaşılabilir ve Platform tarafından, yayına alınmadan önce incelenebilir.
          Uygunsuz veya kurallara aykırı içerik, bildirim yapılmaksızın kaldırılabilir.
        </p>
      </section>

      <section>
        <h2 className="mb-1.5 font-bold text-text">7. Hesap Askıya Alma ve Sonlandırma</h2>
        <p>
          Platform, bu sözleşmeyi ihlal eden, şikayet edilen veya kötüye kullanım tespit edilen
          hesapları uyarı yapmaksızın askıya alma veya kapatma hakkına sahiptir. Kullanıcılar
          hesaplarını diledikleri zaman kapatabilir.
        </p>
      </section>

      <section>
        <h2 className="mb-1.5 font-bold text-text">8. Sorumluluğun Sınırlandırılması</h2>
        <p>
          Platform, Usta&apos;nın sunduğu hizmetin kalitesinden, teslim süresinden veya
          Müşteri&apos;nin verdiği bilgilerin doğruluğundan sorumlu değildir. Kullanıcılar,
          birbirleriyle kurdukları ilişkiden doğan anlaşmazlıklardan bizzat sorumludur.
        </p>
      </section>

      <section>
        <h2 className="mb-1.5 font-bold text-text">9. Değişiklikler</h2>
        <p>
          Platform, bu sözleşmeyi güncelleyebilir; güncel metin her zaman bu sayfada yayınlanır.
          Önemli değişikliklerde kullanıcılar bilgilendirilir.
        </p>
      </section>
    </LegalPage>
  );
}
