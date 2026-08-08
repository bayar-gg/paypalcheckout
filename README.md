# Bayar PayPal Checkout + Apple Pay

Kode utama: `index.html`

Live: https://bayar-gg.github.io/paypalcheckout/

## Apple Pay — cara mengaktifkan

Kode sudah memuat `components=buttons,applepay` dan `enable-funding=applepay`.
Tombol Apple Pay hanya muncul jika semua syarat di bawah terpenuhi.

### 1) Aktifkan Apple Pay di akun PayPal

1. Buka [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/) (mode **Live**)
2. Apps & Credentials → pilih app Client ID ini
3. Features → Accept payments → centang **Apple Pay** → Save
4. Klik **Manage** di bagian Apple Pay

### 2) Host file domain association

1. Download file association dari PayPal
2. Ganti isi `.well-known/apple-developer-merchantid-domain-association`
3. File harus bisa diakses di **root domain**:

```text
https://bayar-gg.github.io/.well-known/apple-developer-merchantid-domain-association
```

Catatan: GitHub project Pages (`/paypalcheckout/`) tidak cukup untuk path root domain.
Host file ini di repo `bayar-gg.github.io` atau pakai custom domain.

### 3) Register domain di PayPal

Di Apple Pay → Manage → Add Domain:

- `bayar-gg.github.io`  
  atau custom domain Anda

### 4) Uji di perangkat Apple

- Safari di iPhone/iPad/Mac dengan Apple Pay aktif
- Kartu ada di Apple Wallet
- HTTPS (GitHub Pages sudah HTTPS)

## GitHub Pages

Jika URL 404, aktifkan Pages:

Settings → Pages → Deploy from a branch → `gh-pages` / root
