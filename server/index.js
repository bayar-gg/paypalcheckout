const path = require("node:path");
const express = require("express");
const dotenv = require("dotenv");
const { createAndSendInvoice } = require("./paypal");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const app = express();
const rootDir = path.join(__dirname, "..");
const port = Number(process.env.PORT || 3000);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedCurrencies = new Set(["USD", "EUR", "GBP", "SGD", "AUD"]);

app.use(express.json({ limit: "32kb" }));

function createInvoiceNumber() {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");
  const randomPart = Math.floor(Math.random() * 9000 + 1000);
  return `INV-${datePart}-${randomPart}`;
}

function validateCreateInvoiceBody(body) {
  const email = String(body?.email || "").trim().toLowerCase();
  const item = String(body?.item || "").trim();
  const currency = String(body?.currency || "USD").trim().toUpperCase();
  const note = String(body?.note || "").trim();
  const amountNumber = Number(body?.amount);
  const errors = [];

  if (!emailPattern.test(email)) {
    errors.push("email harus berupa alamat email valid.");
  }

  if (item.length < 3 || item.length > 120) {
    errors.push("item harus 3–120 karakter.");
  }

  if (!Number.isFinite(amountNumber) || amountNumber < 0.01) {
    errors.push("amount minimal 0.01.");
  }

  if (!allowedCurrencies.has(currency)) {
    errors.push("currency tidak didukung.");
  }

  if (note.length > 2000) {
    errors.push("note terlalu panjang.");
  }

  return {
    errors,
    value: {
      email,
      item,
      currency,
      note,
      amount: Number.isFinite(amountNumber) ? amountNumber.toFixed(2) : "0.00",
      invoiceNumber: createInvoiceNumber(),
      sendEmail: body?.sendEmail !== false,
    },
  };
}

app.use((req, res, next) => {
  const blocked =
    req.path === "/.env" ||
    req.path.startsWith("/server/") ||
    req.path.startsWith("/node_modules/") ||
    req.path.startsWith("/.git/");

  if (blocked) {
    return res.status(404).end();
  }

  return next();
});

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "bayar-paypal-invoicing",
    hasCredentials: Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET),
  });
});

app.post("/api/invoices", async (req, res) => {
  const { errors, value } = validateCreateInvoiceBody(req.body || {});

  if (errors.length > 0) {
    return res.status(400).json({
      error: "VALIDATION_ERROR",
      message: errors.join(" "),
    });
  }

  try {
    const invoice = await createAndSendInvoice(value);
    return res.status(201).json({ invoice });
  } catch (error) {
    const status = error.status || 502;
    return res.status(status).json({
      error: error.code || "INVOICE_CREATE_FAILED",
      message: error.message || "Gagal membuat invoice PayPal.",
      details: error.details || undefined,
    });
  }
});

app.use(
  express.static(rootDir, {
    index: "index.html",
    dotfiles: "deny",
  }),
);

app.use((error, _req, res, _next) => {
  res.status(500).json({
    error: "SERVER_ERROR",
    message: error.message || "Terjadi kesalahan server.",
  });
});

app.listen(port, () => {
  console.log(`Bayar invoice server listening on http://127.0.0.1:${port}`);
});
