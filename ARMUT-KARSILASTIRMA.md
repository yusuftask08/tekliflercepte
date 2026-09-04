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

### 2.3 Uyuşmazlık / iptal sonrası çözüm akışı yok
Müşteri bir talebi iptal edebiliyor (`cancel-button.jsx` → `CANCELLED`), admin da panelden iptal edebiliyor — ama bir teklif seçildikten SONRA ortaya çıkan anlaşmazlıklarda (usta gelmedi, fiyat üstüne para istendi, iş yarım bırakıldı) ne müşterinin ne ustanın başvurabileceği bir "itiraz/uyuşmazlık" mekanizması yok. Sadece genel `Report`/`Block` var, bunlar iş akışına bağlı değil.
**Öneri:** MVP için ağır bir sistem gerekmez — en azından `Report` modelini `serviceRequestId`'ye de bağlayıp panelde "bu talep hakkında açılan şikayetler" görünür kılmak yeterli olur.

### 2.4 Gerçek e-posta gönderimi henüz aktif değil — kod tarafı doğrulandı, hesap bekliyor (2026-08-20)
`mailer.js` kod olarak tam hazır (gerçek Resend SDK çağrısı, `RESEND_API_KEY` set edilince başka hiçbir değişiklik gerekmiyor) ama key hâlâ boş — email'ler best-effort loglanıyor. `.env.example`'da zaten dokümante edilmişti, tekrar doğrulandı. **Bu satırda geliştiriciye kalan iş yok** — tek eksik resend.com hesabı açıp domain doğrulamak (iş sahibine ait, [[project_legal_requirements]] ile aynı kategori).

---

## 3. Orta öncelikli eksikler

### 3.1 Usta belge/sigorta rozetleri yok
Armut'ta "Belgeli Usta", "Sigortalı Hizmet" gibi rozetler var. Bizde sadece admin'in manuel açtığı `identityVerifiedAt` var (gerçek bir belge/adli sicil/sigorta yükleme-inceleme akışı yok). Bu bilinçli bir "gerçek olmayan güven sinyali koymayalım" tercihiyle örtüşüyor ama gerçek bir belge yükleme akışı (usta diploma/sertifika/sigorta poliçesi yükler, admin onaylar) eklenebilir — sahte değil, gerçek bir doğrulama katmanı olur.

### 3.2 Randevu/takvim sistemi yok
`ServiceRequest.preferredDate` tek bir serbest tarih alanı. Ustanın müsaitlik takvimi, saat bazlı slot seçimi, yeniden planlama (reschedule) yok — sadece `isAvailable` (mola modu) boolean açık/kapalı anahtarı var. Armut bazı kategorilerde (temizlik gibi) tarih/saat seçimini daha yapılandırılmış sunuyor.

### 3.3 Tekrarlayan hizmet / abonelik talebi yok
Haftalık ev temizliği gibi düzenli hizmet talepleri için bir "recurring booking" kavramı yok — her seferinde yeniden talep oluşturmak gerekiyor.

### 3.4 Kupon / referans (davet) sistemi yok
Ne müşteri ne usta tarafında promosyon kodu veya "arkadaşını davet et" bonus mekanizması yok. Büyüme/edinim maliyetini düşürmek için düşük efor, yüksek etkili bir eklenti olabilir.

### 3.5 Canlı destek / ticket sistemi yok
`/iletisim` statik bir iletişim sayfası — canlı sohbet, destek talebi (ticket) takibi yok. Armut şikayetlerinin en büyük tekrar eden temalarından biri zaten "şablon/ilgisiz destek" olduğu için burada minimal bile olsa gerçek bir ticket kaydı (ör. panelde görünen "Destek Talepleri" listesi) fark yaratabilir.

### 3.6 ✅ Kapandı — Değerlendirmelere fotoğraf ekleme (2026-08-20)
`Review.photos String[]` eklendi, `POST /requests/:id/review` en fazla 3 fotoğraf kabul ediyor. Wizard'ın fotoğraf seçici UI'ı `PhotoPicker` bileşenine çıkarılıp değerlendirme formunda da kullanıldı (kopya kod yok); fotoğraflar hem talep sahibinin kendi değerlendirmesinde hem usta profilindeki değerlendirme listesinde küçük thumbnail + lightbox olarak görünüyor. Uçtan uca doğrulandı.

### 3.7 B2B / kurumsal hesap yok
`UserRole` sadece `CUSTOMER / PROVIDER / ADMIN / MODERATOR`. Site yönetimi, apartman yönetimi gibi kurumsal/toplu talep oluşturan hesap tipi yok. Şu an için önceliksiz olabilir ama büyüme planına girerse not düşülsün.

### 3.8 CSP (Content-Security-Policy) header'ı yok
`project_security_headers_round` notunda bilinçli olarak ertelenmiş (JSON-LD `dangerouslySetInnerHTML` incelemesi gerekiyor). Hâlâ açık bir madde.

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

Bölüm 2'deki kritik eksiklerin hepsi kapandı (2.3 uyuşmazlık akışı hariç — o daha büyük bir ürün kararı gerektiriyor). Sıradaki en düşük efor/en somut madde **3.8 CSP header'ı** — daha önce JSON-LD `dangerouslySetInnerHTML` incelemesi gerektiği için ertelenmişti, şimdi o incelemeyi yapıp kapatmak mantıklı. Diğer orta öncelikli maddeler (3.1-3.5, 3.7) daha büyük ürün/tasarım kararları gerektiriyor, tek oturumda kod yazıp kapatılacak türden değil.
