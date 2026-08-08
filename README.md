# PayPal Checkout

Halaman checkout responsif dengan modal email/username pelanggan dan tombol pembayaran resmi
PayPal. Halaman ini tidak meminta atau menyimpan password PayPal.

## Menjalankan demo

```bash
python3 -m http.server 8000
```

Buka `http://localhost:8000`.

Halaman memakai PayPal Client ID publik di `index.html` dan nilai transaksi contoh
`$50.84 USD`. PayPal Client Secret tidak disimpan di repository ini.

## GitHub Pages

Workflow `.github/workflows/deploy-pages.yml` memublikasikan halaman dari branch fitur ini dan
`main` ke:

https://bayar-gg.github.io/paypalcheckout/

## Penggunaan produksi

1. Simpan PayPal Client Secret hanya sebagai environment variable di backend, bukan di frontend.
2. Segera putar ulang Secret jika pernah dikirim lewat chat, email, atau commit publik.
3. Ubah invoice, mata uang, dan nilai transaksi di `index.html` serta `app.js`.
4. Buat dan capture order melalui backend Anda. Nilai transaksi di browser dapat dimodifikasi
   oleh pengguna sehingga implementasi client-side dalam demo ini tidak aman untuk produksi.
5. Verifikasi hasil transaksi di server sebelum memenuhi pesanan.

Dokumentasi integrasi: https://developer.paypal.com/docs/checkout/