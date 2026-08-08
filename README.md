# PayPal Checkout

Halaman checkout responsif dengan modal email/username pelanggan dan tombol pembayaran resmi
PayPal. Halaman ini tidak meminta atau menyimpan password PayPal.

## Menjalankan demo

```bash
python3 -m http.server 8000
```

Buka `http://localhost:8000`.

Demo menggunakan `client-id=test` dan nilai transaksi contoh sebesar `$50.84 USD`.

## GitHub Pages

Workflow `.github/workflows/deploy-pages.yml` memublikasikan halaman dari branch fitur ini dan
`main` ke:

https://bayar-gg.github.io/paypalcheckout/

## Penggunaan produksi

1. Ganti `client-id=test` di `index.html` dengan PayPal Client ID milik Anda.
2. Ubah invoice, mata uang, dan nilai transaksi di `index.html` serta `app.js`.
3. Buat dan capture order melalui backend Anda. Nilai transaksi di browser dapat dimodifikasi
   oleh pengguna sehingga implementasi client-side dalam demo ini tidak aman untuk produksi.
4. Simpan PayPal Client Secret hanya di server dan verifikasi hasil transaksi sebelum memenuhi
   pesanan.

Dokumentasi integrasi: https://developer.paypal.com/docs/checkout/