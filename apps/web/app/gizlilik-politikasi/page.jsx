import { LegalPage } from "../legal-page";

export const metadata = { title: "Gizlilik Politikası — Teklifler Cepte" };

export default function GizlilikPolitikasiPage() {
  return (
    <LegalPage title="Gizlilik Politikası">
      <p>
        Kayıt olurken paylaştığın ad, telefon ve talep detayların, yalnızca teklif verdiğin veya
        teklif aldığın kişilerle ve platformun çalışması için gerekli ölçüde paylaşılır.
      </p>
      <p>Detaylı gizlilik politikası yayına alınmadan önce hazırlanacaktır.</p>
    </LegalPage>
  );
}
