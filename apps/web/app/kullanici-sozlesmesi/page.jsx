import { LegalPage } from "../legal-page";

export const metadata = { title: "Kullanıcı Sözleşmesi — Teklifler Cepte" };

export default function KullaniciSozlesmesiPage() {
  return (
    <LegalPage title="Kullanıcı Sözleşmesi">
      <p>
        Teklifler Cepte, hizmet arayanları ve hizmet verenleri bir araya getiren bir aracı hizmet
        sağlayıcıdır. Platform üzerinden gönderilen teklifler ücretsizdir, komisyon alınmaz.
      </p>
      <p>
        Hizmetin ifasına, kalitesine ve bedeline ilişkin ilişki, hizmet alan ile hizmet veren
        arasındadır; Teklifler Cepte bu ilişkinin tarafı değildir.
      </p>
      <p>Sözleşmenin tam metni yayına alınmadan önce hazırlanacaktır.</p>
    </LegalPage>
  );
}
