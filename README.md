# PayPal Checkout — Create Invoice API

Aplikasi Bayar untuk membuat dan mengirim invoice melalui **PayPal Invoicing API**
(`POST /v2/invoicing/invoices` + `POST /v2/invoicing/invoices/{id}/send`).

Client Secret hanya dipakai di server Node.js. Frontend tidak menyimpan kredensial rahasia
dan tidak meminta password PayPal.

## Alur

1. Pengguna mengisi email pelanggan, deskripsi, jumlah, dan mata uang.
2. Frontend memanggil `POST /api/invoices`.
3. Server meminta OAuth token PayPal, membuat draft invoice, lalu mengirimnya.
4. UI menampilkan nomor invoice, status, dan link pembayaran resmi PayPal.

## Setup

```bash
cp .env.example .env
npm install
```

Isi `.env`:

```env
PORT=3000
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_API_BASE=https://api-m.paypal.com
PAYPAL_INVOICER_BUSINESS_NAME=Bayar
```

Untuk sandbox, ganti `PAYPAL_API_BASE` menjadi `https://api-m.sandbox.paypal.com`.
Mode API base harus cocok dengan jenis Client ID/Secret.

## Menjalankan

```bash
npm start
```

Buka `http://localhost:3000`.

## Endpoint

- `GET /api/health` — status server dan apakah kredensial terisi
- `POST /api/invoices` — buat + kirim invoice PayPal

Contoh body:

```json
{
  "email": "customer@example.com",
  "item": "Langganan layanan bulanan",
  "amount": "50.84",
  "currency": "USD",
  "note": "Terima kasih"
}
```

## GitHub Pages

GitHub Pages hanya bisa menyajikan file statis, jadi Create Invoice API tidak bisa berjalan
aman di sana. Deploy server Node.js ini (misalnya Render, Railway, atau VPS) agar frontend dan
API berada di host yang sama.

Workflow Pages yang ada tetap opsional untuk preview UI saja, tanpa pembuatan invoice nyata.

## Keamanan

1. Jangan commit file `.env`.
2. Segera putar ulang Client Secret jika pernah dikirim lewat chat atau commit publik.
3. Pakai kredensial sandbox untuk uji coba sebelum live.
