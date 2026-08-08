# PayPal Checkout

Halaman create-invoice responsif untuk Bayar. Pengguna membuat invoice (pelanggan,
deskripsi, jumlah, mata uang), lalu membayar dengan tombol resmi PayPal. Halaman ini tidak
meminta atau menyimpan password PayPal.

## Alur

1. Isi form **Buat invoice baru**.
2. Sistem membuat nomor invoice dan menampilkan ringkasan.
3. Pelanggan membayar melalui tombol resmi PayPal.
4. Status invoice berubah menjadi lunas dan disimpan di `localStorage` browser.

## Menjalankan demo

```bash
python3 -m http.server 8000
```

Buka `http://localhost:8000`.

PayPal Client ID publik ada di `app.js`. PayPal Client Secret tidak disimpan di repository ini.

## GitHub Pages

Workflow `.github/workflows/deploy-pages.yml` memublikasikan halaman dari branch fitur ini dan
`main` ke:

https://bayar-gg.github.io/paypalcheckout/

## Penggunaan produksi

1. Simpan PayPal Client Secret hanya sebagai environment variable di backend, bukan di frontend.
2. Segera putar ulang Secret jika pernah dikirim lewat chat, email, atau commit publik.
3. Pindahkan create invoice, create order, dan capture ke backend. Nilai di browser dapat
   dimodifikasi pengguna sehingga alur client-side ini tidak aman untuk produksi.
4. Untuk invoice resmi PayPal Invoicing API, buat dan kirim invoice dari server, lalu verifikasi
   pembayaran sebelum memenuhi pesanan.

Dokumentasi integrasi: https://developer.paypal.com/docs/checkout/
