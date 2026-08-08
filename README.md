# PayPal Smart Buttons Checkout

Static GitHub Pages checkout using the official PayPal JS SDK, configured like PayPal
Smart Buttons for **card** funding.

## Live URL

https://bayar-gg.github.io/paypalcheckout/

## SDK config

```text
https://www.paypal.com/sdk/js?client-id=AcoSQ-EMf7YxRYtdNt1LFCvYyOe8ZDGvi7Jj7mzhEwq_uibxnztuzMVNWcAQpEuO2UBmrVVyFwbEi2a-&merchant-id=L6QMR5J7SMTLN&components=buttons&enable-funding=credit,venmo,card&disable-funding=bancontact,blik,eps,giropay,ideal,mercadopago,mybank,p24,sepa,sofort,paylater&currency=USD&intent=capture&locale=en_US
```

Button style matched from the smart/buttons request:

- `layout: horizontal`
- `color: black`
- `shape: rect`
- `tagline: false`
- `fundingSource: card`

The raw `https://www.paypal.com/smart/buttons?...` URL is an internal PayPal iframe endpoint
and is not embedded directly. Equivalent options are applied through the public SDK.

## Local preview

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.
