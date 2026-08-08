# Apple Pay domain association

1. PayPal Developer Dashboard (Live) → Apps & Credentials → your app
2. Features → Accept payments → enable **Apple Pay** → **Manage**
3. Download the domain association file
4. Replace `apple-developer-merchantid-domain-association` in this folder with that file
5. Register domain in PayPal

## Important for GitHub Pages

Apple validates the **domain root**, not a project path.

- Site URL: `https://bayar-gg.github.io/paypalcheckout/`
- Association file must be reachable at:
  `https://bayar-gg.github.io/.well-known/apple-developer-merchantid-domain-association`

So either:

- put this file in a `bayar-gg.github.io` user/org Pages repo, or
- use a custom domain and host `.well-known` at that domain root

Then register `bayar-gg.github.io` (or your custom domain) in PayPal Apple Pay Manage Domains.
