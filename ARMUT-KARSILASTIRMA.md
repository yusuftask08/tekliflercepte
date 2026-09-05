# Armut Karşılaştırması — Eksikler ve Öneriler

_Son güncelleme: 2026-08-20. Kod tabanı taranarak (Prisma schema, apps/api/src/routes, apps/web/app, apps/panel/app) doğrulanmıştır — varsayım değil, gerçek kontrol._

Bu dosya periyodik olarak güncellenmeli: her "eksik bul" turundan sonra buradaki maddeler ya kapatılmalı ya da yeni maddeler eklenmelidir.

---

## 1. Şu anda güçlü olduğumuz alanlar (özet)

Uygulama zaten oldukça olgun bir pazar yeri: tam talep→teklif→mesajlaşma→değerlendirme döngüsü, admin onay/moderasyon paneli, çok şehirli usta eşleştirme, favoriler, engelleme/şikayet, portfolyo fotoğrafları, kimlik doğrulama rozeti (admin onaylı), premium/ücretsiz teklif limiti, programatik SEO şehir+kategori sayfaları, güven istatistikleri (yanıt süresi, kabul oranı — gerçek veriden), rate limiting, güvenlik header'ları, KVKK onayı, e-posta bildirimleri (kod hazır). Bunların çoğu Armut'ta bile net karşılığı olmayan iyileştirmeler (çoklu şehir, komisyonsuz model).

Aşağıdaki liste bunların **üzerine** — gerçekten eksik olan veya yarım kalan kısımlar.

---

## 2. Kritik eksikler (güven / dönüşüm / gelir üzerinde doğrudan etkisi var)

### 2.1 ✅ Kapandı — Telefon doğrulama (OTP/SMS) (2026-08-20)
`POST /me/phone/send-code` + `POST /me/phone/verify-code` eklendi; kayıt olunca kod otomatik gönderiliyor (best-effort). 6 haneli kod, 10 dakika geçerli, 5 yanlış denemede kilit, 60sn tekrar-gönderim koruması. Telefon numarası `PATCH /me` ile değişirse doğrulama sıfırlanıyor. `usta/[id]` sayfasındaki "Telefon Doğrulandı" rozeti zaten koda bağlıydı — artık gerçek veriyle doluyor. Profil sayfasına doğrulama widget'ı eklendi.
**Kalan operasyonel adım (kod değil, hesap açma):** `apps/api/src/lib/sms.js` gerçek bir SMS sağlayıcıya (Netgsm/İleti Merkezi vb.) bağlı değil — generic bir HTTP POST placeholder. Sağlayıcı key'i yokken kodlar konsola loglanıyor (mailer.js'teki email deseniyle aynı). Hesap açılıp `SMS_PROVIDER_API_KEY`/`SMS_PROVIDER_URL` set edildiğinde, sms.js'in gövdesi o sağlayıcının gerçek API şemasına göre güncellenmeli (şu an mailer.js'teki gibi "gerçek SDK çağrısı" değil, tahmini bir istek gövdesi).

### 2.2 ✅ Kapandı — İş tamamlama onayı (2026-08-20)
`POST /requests/:id/complete` eklendi (müşteri, `OFFER_SELECTED` durumundaki kendi talebini `CLOSED`'a çekebiliyor); değerlendirme gönderimi de artık transaction içinde talebi `CLOSED` yapıyor. `stats.js`'teki `completedJobsCount` artık gerçek `CLOSED` talep sayısından geliyor. Talep detay sayfasında durum rozeti ve kapalı taleplerde geçmiş değerlendirme gösterimi var. Uçtan uca API testleriyle doğrulandı (tamamlama, değerlendirme üzerinden kapatma, sahiplik/durum guard'ları, stats sayacı).
Kalan not: usta tarafında ayrı bir "işi bitirdim" işaretleme (iki taraflı onay) hâlâ yok — istenirse ayrı bir madde olarak eklenebilir, şu an tek taraflı (müşteri) onay yeterli görüldü.

### 2.3 ✅ Kapandı — Uyuşmazlık / iptal sonrası çözüm akışı MVP (2026-08-21)
`Report.offerId` gerçek bir ilişkiye çevrildi (önceden bare scalar'dı, offer.serviceRequest üzerinden hangi talebe ait olduğu artık bulunabiliyor). `GET /admin/requests/:id` her teklifin altında ona açılan şikayetleri de döndürüyor; panelde talep detay sayfasına "Bu talep hakkında açılan şikayetler" bölümü eklendi, mevcut ResolveReportButton ile aynı yerden kapatılabiliyor. Uçtan uca doğrulandı.
Kalan not: bu hâlâ genel Report/Block altyapısını yeniden kullanan hafif bir MVP — ayrı bir "itiraz" durumu/akışı (ör. talebi otomatik askıya alma) yok, ihtiyaç olursa ayrı madde olarak açılabilir.

### 2.4 Gerçek e-posta gönderimi henüz aktif değil — kod tarafı doğrulandı, hesap bekliyor (2026-08-20)
`mailer.js` kod olarak tam hazır (gerçek Resend SDK çağrısı, `RESEND_API_KEY` set edilince başka hiçbir değişiklik gerekmiyor) ama key hâlâ boş — email'ler best-effort loglanıyor. `.env.example`'da zaten dokümante edilmişti, tekrar doğrulandı. **Bu satırda geliştiriciye kalan iş yok** — tek eksik resend.com hesabı açıp domain doğrulamak (iş sahibine ait, [[project_legal_requirements]] ile aynı kategori).

---

## 3. Orta öncelikli eksikler

### 3.1 ✅ Kapandı — Usta belge/sigorta rozetleri (2026-08-22)
`ProviderDocument` modeli eklendi (CERTIFICATE/INSURANCE, PENDING/APPROVED/REJECTED) — usta gerçek bir sertifika/sigorta poliçesi dosyası yüklüyor (PDF veya görsel), admin o dosyayı görüp onaylıyor/reddediyor. Sadece APPROVED belgeler public'e "Belgeli Usta"/"Sigortalı Hizmet" rozeti olarak yansıyor (fileUrl asla public endpoint'e sızmıyor). Web'de `/usta/belgeler`, panelde `/belgeler` (durum sekmeleri + onayla/reddet + sidebar rozeti). Uçtan uca doğrulandı: PDF yükleme, onay/red sonrası rozet görünürlüğü, reddedilme sebebini usta görebiliyor, incelenmiş belge silinemiyor.

### 3.2 Randevu/takvim sistemi yok
`ServiceRequest.preferredDate` tek bir serbest tarih alanı. Ustanın müsaitlik takvimi, saat bazlı slot seçimi, yeniden planlama (reschedule) yok — sadece `isAvailable` (mola modu) boolean açık/kapalı anahtarı var. Armut bazı kategorilerde (temizlik gibi) tarih/saat seçimini daha yapılandırılmış sunuyor.

### 3.3 Tekrarlayan hizmet / abonelik talebi yok
Haftalık ev temizliği gibi düzenli hizmet talepleri için bir "recurring booking" kavramı yok — her seferinde yeniden talep oluşturmak gerekiyor.

### 3.4 ✅ Kapandı — Referans (davet) sistemi (2026-08-23)
Herkes kendi referans linkini (`/kayit?ref=<id>`) paylaşabiliyor, profilde kaç kişiyi davet ettiğini görüyor. Ödül sadece usta→usta zincirinde: referansla katılan bir usta profilini tamamlayınca referrer otomatik `isPremium` kazanıyor (bildirim + email ile). Müşteri referansları sadece sayılıyor, ödül yok — platformda müşteri tarafında ödüllendirilecek bir "premium" kavramı olmadığı için uydurma bir mekanik eklemedim. Uçtan uca doğrulandı (ödül tetiklenmesi + müşteri-referrer'ın ödül almadığı negatif senaryo).
Not: "kupon" kısmı hiç yapılmadı — platformda ödeme/komisyon olmadığı için parasal bir indirim kodunun karşılığı yok; bu bilinçli bir kapsam daraltması, [[project_armut_differentiation]] ile aynı mantık.

### 3.5 ✅ Kapandı — Destek talebi (ticket) sistemi (2026-08-21)
`SupportTicket` modeli eklendi, `/iletisim` artık gerçek bir form (giriş yapmışsa ad/email otomatik dolduruluyor, çıkış yapmamış ziyaretçi de gönderebiliyor). Panelde "Destek Talepleri" sayfası + sidebar'da açık talep rozeti, resolve akışı Şikayetler'deki desenle aynı. Yeni talep gelince adminlere e-posta gidiyor. Uçtan uca doğrulandı (anonim/oturumlu gönderim, doğrulama, admin listeleme/arama/resolve, rate limit).
Not: canlı sohbet (gerçek zamanlı) hâlâ yok, bu bilinçli olarak MVP kapsamı dışında bırakıldı — ticket kaydı zaten Armut şikayetlerindeki asıl sorunu (kaybolan/takip edilemeyen destek talepleri) çözüyor.

### 3.6 ✅ Kapandı — Değerlendirmelere fotoğraf ekleme (2026-08-20)
`Review.photos String[]` eklendi, `POST /requests/:id/review` en fazla 3 fotoğraf kabul ediyor. Wizard'ın fotoğraf seçici UI'ı `PhotoPicker` bileşenine çıkarılıp değerlendirme formunda da kullanıldı (kopya kod yok); fotoğraflar hem talep sahibinin kendi değerlendirmesinde hem usta profilindeki değerlendirme listesinde küçük thumbnail + lightbox olarak görünüyor. Uçtan uca doğrulandı.

### 3.7 B2B / kurumsal hesap yok
`UserRole` sadece `CUSTOMER / PROVIDER / ADMIN / MODERATOR`. Site yönetimi, apartman yönetimi gibi kurumsal/toplu talep oluşturan hesap tipi yok. Şu an için önceliksiz olabilir ama büyüme planına girerse not düşülsün.

### 3.8 ✅ Kapandı — CSP (Content-Security-Policy) header'ı (2026-08-20)
apps/panel: enforcing CSP eklendi (inline script/harici görsel yok, risksiz). apps/web: nonce tabanlı CSP (middleware.js), homepage/usta/[id]/hizmet/[kategori]/[sehir]'deki JSON-LD script'lerine nonce eklendi — Next'in kendi RSC script'lerine nonce'u otomatik uyguladığı doğrulandı. Production build + prod modda çalıştırılıp header/nonce eşleşmesi curl ile doğrulandı.
**Kalan adım (kod değil, tarayıcı gözlemi):** web tarafı hâlâ `Content-Security-Policy-Report-Only` — hiçbir şeyi bloklamıyor. Production'a deploy edilince siteyi gerçek tarayıcıda gezip DevTools konsolunda ihlal uyarısı kalmadığını görmek gerekiyor, sonra `middleware.js`'teki `CSP_ENFORCE` true yapılır.
**Yan bulgu:** bu incelemede `next.config.js`'in `images.remotePatterns`'ının yerel API portunu "4000" olarak hardcode ettiği, oysa gerçek dev portunun 4001 olduğu bulundu — dev'de next/image ile yüklenen tüm görseller (avatar, portfolyo, review fotoğrafları) sessizce kırıktı. Düzeltildi (env'den dinamik okunuyor).

---

## 4. Düşük öncelikli / "nice to have"

- **Native mobil uygulama yok** — sadece PWA manifest var, App Store/Play Store'da hiçbir şey yok. Armut mobil-öncelikli büyüyor; ama gerçek trafik/kullanıcı olmadan bu yatırımı yapmak erken olur.
- **Blog / içerik pazarlaması yok** — organik SEO için "nasıl yapılır" tarzı içerik bölümü yok. Programatik `hizmet/[kategori]/[sehir]` sayfaları var ama editoryal içerik sıfır.
- **Push bildirim yok** — sadece e-posta (henüz aktif değil) var; web push veya SMS yok.
- **Usta eğitim/sertifikasyon içerik akışı yok** — Armut'un ustalara yönelik "nasıl daha çok iş alırsın" eğitim/onboarding içerikleri var, bizde onboarding sadece formdan ibaret.
- **Fiyat tahmini / anlık fiyatlandırma aracı yok** — Armut bazı kategorilerde "tahmini fiyat aralığı" gösteriyor, bizde her talep serbest teklif üzerinden.

---

## 5. Bilinçli olarak yapılmadı — Armut'ta var, biz kasıtlı atladık

Bunlar "eksik" değil, ürün pozisyonlaması gereği farklı tercih:

- **Teklif ücreti / komisyon** — Armut'un en çok şikayet edilen noktası; biz bilerek ücretsiz tutuyoruz ([[project_armut_differentiation]]).
- **Platform üzerinden ödeme (PSP entegrasyonu)** — parayı hiç dokunmuyoruz, BDDK lisansı gerektirmiyor ([[project_legal_requirements]]).
- **Sahte istatistikler / sosyal medya rozetleri** — gerçek hesap/veri olmadan göstermiyoruz ([[project_homepage_polish]]).

---

## 6. Yasal / operasyonel (geliştirici işi değil, hatırlatma)

- ETBİS kaydı, VERBİS (henüz gerekli değil), avukat onayı bekleyen sözleşme/KVKK metinleri, İYS kaydı — hepsi [[project_legal_requirements]]'te detaylı, iş sahibine ait.

---

## 7. Önerilen sıradaki adım

Etki/efor dengesine göre öncelik sırası: ~~(1) iş tamamlama onayı (2.2)~~ ✅ kapandı; ~~(2) telefon OTP doğrulama (2.1)~~ ✅ kapandı (kod tarafı — SMS sağlayıcı hesabı ayrı, iş sahibine ait); ~~(3) Resend API key'in gerçekten set edilmesi (2.4)~~ kod zaten hazırdı, doğrulandı — kalan tek şey hesap açma; ~~(4) değerlendirmelere fotoğraf (3.6)~~ ✅ kapandı.

Bölüm 2'deki kritik eksiklerin hepsi kapandı, ~~2.3 uyuşmazlık akışı~~ dahil (hafif bir MVP olarak — mevcut Report/Block'u talebe bağlamak). ~~3.8 CSP header'ı~~ ✅ kapandı (web tarafı Report-Only, prod'da tarayıcı kontrolü sonrası enforce edilecek).

Geriye kalanlar:
- **Operasyonel, geliştirici işi değil:** SMS sağlayıcı hesabı (2.1), Resend hesabı (2.4), CSP'yi enforce etmeden önceki tarayıcı kontrolü (3.8).
- **Kullanıcı "sen karar ver, devam et" dedi (2026-08-21):** artık her maddeyi tek tek onaya sormak yerine kapsamı en dar/somut şekilde tanımlayıp (MVP mantığıyla) sırayla kapatılıyor. ~~3.5 destek/ticket sistemi~~, ~~3.1 usta belge/sigorta rozetleri~~, ~~3.4 referans sistemi~~ ✅ hepsi kapandı.

**Geriye sadece 3.2 randevu/takvim ve 3.3 tekrarlayan hizmet kaldı** — ikisi de mevcut veri modelinde büyük bir genişleme gerektiriyor (saat bazlı slot/müsaitlik takvimi, tekrarlayan talep + otomatik yeniden oluşturma mantığı) ve gerçek kullanıcı/talep hacmi olmadan hangi kategorilerde gerçekten gerekli olduğunu tahmin etmek zor — bu ikisi kullanıcıyla kapsam netleştirilmeden koda başlanacak türden değil. 3.7 B2B zaten önceliksiz.
