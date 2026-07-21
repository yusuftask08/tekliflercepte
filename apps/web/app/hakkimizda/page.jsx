import { SiteFooter } from "../site-footer";

export const metadata = {
  title: "Hakkımızda — Teklifler Cepte",
  description:
    "Teklifler Cepte, hizmet almak isteyenleri ustalarla ücretsiz buluşturan bir teklif pazaryeridir.",
};

export default function HakkimizdaPage() {
  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-10 sm:px-6 sm:py-16">
        <h1 className="text-2xl font-bold sm:text-3xl">Hakkımızda</h1>
        <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-text-muted">
          <p>
            Teklifler Cepte, temizlikten tadilata, nakliyattan özel derse kadar ihtiyacın olan bir
            hizmeti bulmanın en basit yolu olmak için kuruldu. Bir talep oluşturuyorsun, bölgendeki
            ustalar sana ücretsiz teklif gönderiyor, en uygun olanı seçip doğrudan anlaşıyorsun.
          </p>
          <p>
            Diğer bazı platformların aksine, ustalardan teklif verme ücreti ya da işi kazandıklarında
            komisyon almıyoruz. Ödeme her zaman doğrudan müşteri ile usta arasında gerçekleşir — biz
            ödemeye ya da sözleşmeye taraf olmayız, sadece güvenli bir buluşma noktası sağlarız.
          </p>
          <p>
            Her talep, ustalara görünmeden önce ekibimiz tarafından incelenir; ustalar telefon
            numaralarını doğrular; değerlendirmeler yalnızca tamamlanmış işler için yapılabilir. Amacımız
            hem hizmet arayanlar hem de hizmet verenler için güvenilir bir ortam kurmak.
          </p>
          <p className="text-xs text-text-muted/80">
            Şirket unvanı, adres ve MERSİS bilgileri kuruluş süreci tamamlandığında burada
            yayınlanacaktır.
          </p>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
