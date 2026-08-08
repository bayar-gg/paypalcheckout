# PayPal Invoice Checkout (GitHub Pages)

Static page that opens a specific PayPal invoice for payment, with a **Partial amount** field.

## Live URL

https://bayar-gg.github.io/paypalcheckout/

## Invoice

Payment opens:

https://www.paypal.com/invoice/p/pay/#INV2-5ASS-K9NU-SLMA-P2Y8

## Partial amount

1. Enter the partial amount on this page.
2. Continue to the official PayPal invoice page.
3. Confirm/enter the partial amount on PayPal if the invoice allows partial payments.

PayPal hosted invoice URLs do not accept the amount as a query parameter. Partial payments only
work when the invoice itself has partial payments enabled in PayPal.

## Local preview

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.
