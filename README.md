# Handoff: Teklifler Cepte — Design System & Screen Mockups

## Overview
End-to-end design system + representative screen mockups for **Teklifler Cepte**, a Türkiye-based service marketplace (Armut.com competitor) connecting service seekers (ev sahibi/kiracı) with service providers (usta/esnaf). Core brand differentiator: quote submission is free, no commission, no in-app payment (customer pays the provider directly) — the visual system leans into transparency, trust, and "free" messaging (no hidden fees, no fine print).

## About the Design Files
The bundled HTML file is a **design reference built with HTML/inline CSS**, not production code. It renders live in a browser and documents the full token system plus mockups inside device-frame chrome (iPhone bezel, browser window) for presentation purposes only — those bezel/chrome wrappers are NOT part of the product UI and should be discarded during implementation.

**Task**: recreate these designs in the target codebase's existing framework (React Native / Flutter / native iOS+Android for the consumer app, React/Vue for the admin web panel, or whichever stack the project already uses) using its established component patterns. If no environment exists yet, choose the framework best suited to a two-sided marketplace app (native or React Native for mobile, React/Next for admin web) and implement there.

## Fidelity
**High-fidelity (hifi)**: All colors, typography, spacing, radii, and shadows below are final tokens, not placeholders. Copy shown in Turkish is representative sample content — implement the same information architecture and tone, but pull real data from the backend. Photos are drag-and-drop placeholders (dashed/gray boxes) — replace with real avatar/photo components wired to actual image URLs.

## Brand Direction
Two directions were explored; **"Yön A — Güven Mavi-Yeşil" (Trust Teal) was selected**:
- Teal reads as calm + fresh, aligning with "şeffaflık, güven, ücretsizlik." It also gives strong contrast against the green (success) and blue (info) trust badges used throughout — important since fake-listing complaints are a key pain point being solved, and verification/rating badges need to visually pop.
- The rejected warm orange/earth direction ("Yön B") felt more artisan/informal but reduced contrast against success-green trust badges and is visually closer to several existing local-services competitors.

## Design Tokens

### Colors — Light Theme
```css
--color-brand-50: #EAFBF6;
--color-brand-100: #CFF5EA;
--color-brand-300: #7FDFC7;
--color-brand-500: #12977E;
--color-brand-600: #0C7C67;  /* use for solid button fills — passes AA vs white text */
--color-brand-700: #096354;
--color-success: #22A559;
--color-warning: #F59E0B;
--color-danger: #DC2626;
--color-info: #2563EB;
--color-bg: #F7F9F8;
--color-surface: #FFFFFF;
--color-surface-raised: #FFFFFF;  /* pair with --shadow-sm/md to differentiate from --color-surface */
--color-border: #E2E8E6;
--color-text: #12201C;
--color-text-muted: #5B6B67;
--color-text-on-brand: #FFFFFF;
```

### Colors — Dark Theme
```css
--color-brand-50: #0E2622;
--color-brand-100: #12352F;
--color-brand-300: #1E5C4F;
--color-brand-500: #2BC4A3;  /* use for solid button fills in dark mode — brighter than light-mode 600 */
--color-brand-600: #3ED9B6;
--color-brand-700: #63E6C8;
--color-success: #3DDC84;
--color-warning: #FBBF24;
--color-danger: #F87171;
--color-info: #60A5FA;
--color-bg: #0B1512;
--color-surface: #101E1A;
--color-surface-raised: #16241F;
--color-border: #24352F;
--color-text: #EAF3F0;
--color-text-muted: #9AACA6;
--color-text-on-brand: #06231D;  /* dark text on the bright dark-mode brand-500 button fill */
```

### Spacing (8-point scale)
```css
--space-1: 4px;
--space-2: 8px;
--space-3: 16px;
--space-4: 24px;
--space-5: 32px;
--space-6: 40px;
--space-7: 48px;
--space-8: 64px;
```

### Radius
```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 20px;
--radius-full: 9999px;
```

### Shadow
Light theme:
```css
--shadow-sm: 0 1px 2px rgba(18,32,28,0.06);
--shadow-md: 0 4px 12px rgba(18,32,28,0.08);
--shadow-lg: 0 12px 32px rgba(18,32,28,0.12);
```
Dark theme:
```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.4);
--shadow-md: 0 4px 14px rgba(0,0,0,0.5);
--shadow-lg: 0 16px 40px rgba(0,0,0,0.6);
```

### Typography
Font family: **Plus Jakarta Sans** (Google Fonts, weights 400/500/600/700/800) — full Turkish character support (ğ ş ı ö ü ç İ).
```css
--font-sans: 'Plus Jakarta Sans', sans-serif;
--font-size-xs: 12px;
--font-size-sm: 14px;
--font-size-base: 16px;
--font-size-lg: 18px;
--font-size-xl: 22px;
--font-size-2xl: 28px;
--font-size-3xl: 34px;
--font-size-4xl: 42px;
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
--font-weight-extrabold: 800;
```

## Screens

### 1. Ana Sayfa (Home) — mobile, 375×812
- Header row: greeting text ("Merhaba, {name}") + location line with pin icon + circular notification-bell button (surface bg, shadow-sm).
- Hero card: full-width, `--radius-lg`, gradient `--color-brand-600 → --color-brand-700` (light) / `--color-brand-500 → --color-brand-600` (dark), white/on-brand text, headline + subcopy + full-width white CTA button "Talep Oluştur" (`--radius-md`).
- "Popüler Kategoriler" section: 3-column grid of category cards (surface bg, `--radius-md`, `--shadow-sm`), each with a circular icon badge (`--color-brand-100` bg, `--color-brand-600` icon) and label below.
- Trust strip: single card row with 3 stats (jobs completed count, average rating, "% free quotes"), bordered, `--shadow-sm`.
- Bottom tab bar: 4 items (Ana Sayfa / Taleplerim / Mesajlar / Profil), active tab in `--color-brand-600`, inactive in `--color-text-muted`.

### 2. Talep Oluşturma — Detay Adımı (Request Form, step 3/4)
- Header: back chevron + title + step counter "3/4".
- 4-segment progress bar (filled segments `--color-brand-600`, current segment `--color-brand-300`, remaining `--color-border`).
- Removable chip showing selected category.
- Form fields: multiline description textarea, optional budget input, optional photo-upload row (3 dashed `--radius-md` add-slots), helper note about data privacy.
- Sticky bottom full-width primary button "Devam Et" (`--color-brand-600`, `--shadow-md`).

### 3. Teklif Gelen Kutusu (Offers Inbox)
- Header: request title + location/date + pill badge showing offer count (`--color-brand-100` bg / `--color-brand-700` text).
- Stacked provider cards (surface, `--radius-lg`, `--shadow-sm`, bordered): avatar, name, business name, star rating + review count, price (bold, `--color-brand-700`), two trust-badge chips ("X iş tamamlandı", "Telefon doğrulandı" with check icon in `--color-success`), italic message preview, two-button row ("Mesaj" outline / "Teklifi Seç" filled brand-600).

### 4. Usta Profil Sayfası (Provider Profile)
- Cover photo placeholder + overlapping circular avatar placeholder.
- Name, business name, category chips.
- Large rating number + stars + review count.
- 3-column stat row (jobs completed / years experience / response rate) in a bordered surface card.
- Verification badge row ("Telefon Doğrulandı", "Kimlik Doğrulandı" — success-colored check chips).
- About paragraph.
- Reviews list (name, star rating, comment) as individual bordered cards.
- Sticky bottom bar: average price + full-width "Mesaj Gönder" CTA.

### 5. Mesajlaşma (Messaging)
- Header: back chevron, avatar, name, online-status dot + "Çevrimiçi" label.
- Pinned context card referencing the active request.
- Chat bubbles: provider messages left-aligned (`--color-surface-raised`, bordered, radius 16/16/16/4), customer messages right-aligned (`--color-brand-600` fill, white text, radius 16/16/4/16), timestamp caption under each.
- Bottom input bar: attach icon, pill-shaped text input, circular send button (`--color-brand-600`).

### 6. Admin Panel — Talepler (desktop, 1280×760)
- Left sidebar (220px, surface bg, bordered): logo/wordmark + nav list (Talepler active — `--color-brand-100` bg / `--color-brand-700` text; Kullanıcılar, Ustalar, Ödemeler, Raporlar, Ayarlar).
- Main content: page title + total count, filter chip row (Tümü active filled, others outlined).
- Data table (bordered card, `--radius-lg`, `--shadow-sm`): columns Talep ID, Müşteri, Kategori, Durum (status pill: Açık = info-blue tint, Teklif Seçildi = success-green tint, Kapalı = neutral gray), Gelen Teklif count, Tarih, chevron action.

### 7. Dark Theme Variants
Home and Offers Inbox are also specced in dark theme — same layout/structure as above, swap in the dark token set. Note the brand-role swap: dark mode uses `--color-brand-500` (bright) for solid fills with `--color-text-on-brand` (dark) for contrast, versus light mode's `--color-brand-600` fill + white text.

## Interactions & Behavior (implied, to be built)
- Home CTA → opens multi-step request creation flow (Kategori → Konum → Detay → Gönder).
- Category card tap → pre-fills category in request flow.
- "Teklifi Seç" on an offer card → confirmation + moves request to "Teklif Seçildi" status; triggers a direct-contact/payment-outside-platform flow (no in-app payment).
- "Mesaj" / message bubble tap → opens per-request Mesajlaşma thread with that provider.
- Admin table row chevron → opens request detail view (not mocked here).
- Bottom tab bar and admin sidebar items are standard navigation, single active state each.

## Design Tokens File
All CSS custom properties above are also visually swatched in the HTML reference file — treat the property names as the exact ones to implement in the codebase (they were defined to match an existing token naming convention).

## Assets
No external image assets — all photos (avatars, cover photos) are placeholders to be replaced with real images/CDN URLs in implementation. All icons are simple inline line-icons (chevron, location pin, bell, star, check, home/list/chat/user, category glyphs) — recreate with the codebase's existing icon library/set at equivalent visual weight (2px stroke, rounded caps).

## Files
- `Teklifler Cepte - Tasarim Sistemi.dc.html` — full design reference (token showcase + all mockups, light + dark). Open in a browser to view/interact.
