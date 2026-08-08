# PayPal Checkout (GitHub Pages + SDK)

Static checkout page using the official PayPal JavaScript SDK only.

- No backend
- No PayPal Client Secret
- Works on GitHub Pages

## Live URL

https://bayar-gg.github.io/paypalcheckout/

## SDK

```text
https://www.paypal.com/sdk/js?client-id=AcoSQ-EMf7YxRYtdNt1LFCvYyOe8ZDGvi7Jj7mzhEwq_uibxnztuzMVNWcAQpEuO2UBmrVVyFwbEi2a-&merchant-id=L6QMR5J7SMTLN&components=buttons,applepay&enable-funding=applepay,venmo,card,credit,paylater,bancontact,blik,eps,giropay,ideal,mercadopago,mybank,p24,sepa,sofort&currency=USD&locale=en_US
```

Checkout uses `shipping_preference: NO_SHIPPING` so PayPal does not collect a shipping
address. Apple Pay appears when the buyer device/browser supports it and Apple Pay is
enabled for the PayPal app/domain.

## Local preview

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Notes

This demo creates and captures orders in the browser. For production, move order
create/capture to a server and verify payment before fulfilling.
