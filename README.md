# Bayar PayPal Checkout

Kode utama: `index.html`  
Live: https://bayar-gg.github.io/paypalcheckout/

## Fitur

- Form kartu **langsung tampil** (PayPal Card Fields) — tanpa tombol Debit or Credit Card
- Apple Pay (jika domain terdaftar + perangkat eligible)

## Agar form kartu embedded aktif

1. PayPal Developer Dashboard (Live) → Apps & Credentials → app Anda
2. Features → Accept payments → enable **Advanced Credit and Debit Card Payments**
3. Save, lalu refresh halaman checkout

Jika belum enabled, halaman fallback ke tombol kartu PayPal.

## Apple Pay

1. Enable Apple Pay di app PayPal
2. Host file domain association di root domain:
   `https://bayar-gg.github.io/.well-known/apple-developer-merchantid-domain-association`
3. Register domain `bayar-gg.github.io` di PayPal → Apple Pay → Manage

## GitHub Pages

Settings → Pages → Deploy from a branch → `gh-pages` / root
