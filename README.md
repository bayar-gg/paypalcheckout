# PayPal Checkout (GitHub Pages + SDK)

Static checkout page for Bayar using the official PayPal JavaScript SDK. No backend and no
Client Secret are required for this demo.

## Live URL

https://bayar-gg.github.io/paypalcheckout/

## SDK

The page loads:

```text
https://www.paypal.com/sdk/js?client-id=AcoSQ-EMf7YxRYtdNt1LFCvYyOe8ZDGvi7Jj7mzhEwq_uibxnztuzMVNWcAQpEuO2UBmrVVyFwbEi2a-&merchant-id=L6QMR5J7SMTLN&components=buttons&enable-funding=venmo,card,credit,paylater,bancontact,blik,eps,giropay,ideal,mercadopago,mybank,p24,sepa,sofort&currency=USD&locale=en_US
```

## Local preview

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

## Notes

- This flow uses client-side `actions.order.create` / `capture` for demo use on GitHub Pages.
- For production, create and capture orders on a server and verify the result before fulfilling.
- Do not put PayPal Client Secret in the repository or frontend.
