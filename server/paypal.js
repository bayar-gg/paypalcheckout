const TOKEN_SKEW_MS = 60_000;

let cachedToken = null;

function getConfig() {
  const clientId = process.env.PAYPAL_CLIENT_ID?.trim();
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET?.trim();
  const apiBase = (process.env.PAYPAL_API_BASE || "https://api-m.sandbox.paypal.com").replace(
    /\/$/,
    "",
  );
  const businessName = process.env.PAYPAL_INVOICER_BUSINESS_NAME?.trim() || "Bayar";

  if (!clientId || !clientSecret) {
    const error = new Error(
      "PAYPAL_CLIENT_ID dan PAYPAL_CLIENT_SECRET wajib diisi di environment server.",
    );
    error.status = 500;
    error.code = "MISSING_CREDENTIALS";
    throw error;
  }

  return { clientId, clientSecret, apiBase, businessName };
}

async function parsePayPalResponse(response) {
  const text = await response.text();
  let body = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { message: text };
    }
  }

  if (!response.ok) {
    const detail =
      body?.details?.map((item) => item.description || item.issue).filter(Boolean).join("; ") ||
      body?.message ||
      body?.error_description ||
      `PayPal API error (${response.status})`;

    const error = new Error(detail);
    error.status = response.status >= 400 && response.status < 600 ? response.status : 502;
    error.code = body?.name || body?.error || "PAYPAL_API_ERROR";
    error.details = body;
    throw error;
  }

  return body;
}

async function getAccessToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + TOKEN_SKEW_MS) {
    return cachedToken.value;
  }

  const { clientId, clientSecret, apiBase } = getConfig();
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`${apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const body = await parsePayPalResponse(response);
  cachedToken = {
    value: body.access_token,
    expiresAt: Date.now() + Number(body.expires_in || 300) * 1000,
  };

  return cachedToken.value;
}

async function paypalFetch(path, options = {}) {
  const { apiBase } = getConfig();
  const token = await getAccessToken();

  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(options.headers || {}),
    },
  });

  return parsePayPalResponse(response);
}

function extractLink(links, rel) {
  if (!Array.isArray(links)) return null;
  const match = links.find((link) => link.rel === rel);
  return match?.href || null;
}

function buildInvoicePayload({
  email,
  item,
  amount,
  currency,
  note,
  invoiceNumber,
  businessName,
}) {
  const today = new Date().toISOString().slice(0, 10);

  return {
    detail: {
      invoice_number: invoiceNumber,
      invoice_date: today,
      currency_code: currency,
      payment_term: {
        term_type: "DUE_ON_RECEIPT",
      },
      note: note || "Terima kasih atas pembayaran Anda.",
    },
    invoicer: {
      business_name: businessName,
    },
    primary_recipients: [
      {
        billing_info: {
          email_address: email,
        },
      },
    ],
    items: [
      {
        name: item,
        quantity: "1",
        unit_amount: {
          currency_code: currency,
          value: amount,
        },
      },
    ],
  };
}

async function sendInvoice(invoiceId, { sendToRecipient }) {
  return paypalFetch(`/v2/invoicing/invoices/${encodeURIComponent(invoiceId)}/send`, {
    method: "POST",
    body: JSON.stringify({
      send_to_recipient: sendToRecipient,
      send_to_invoicer: false,
    }),
  });
}

async function createAndSendInvoice(input) {
  const { businessName } = getConfig();
  const payload = buildInvoicePayload({ ...input, businessName });
  const sendToRecipient = input.sendEmail !== false;

  const created = await paypalFetch("/v2/invoicing/invoices", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const invoiceId = created.id;
  if (!invoiceId) {
    const error = new Error("PayPal tidak mengembalikan ID invoice.");
    error.status = 502;
    error.code = "MISSING_INVOICE_ID";
    throw error;
  }

  let sendWarning = null;

  try {
    await sendInvoice(invoiceId, { sendToRecipient });
  } catch (primarySendError) {
    // Jika pengiriman email ditolak, coba aktifkan invoice tanpa email penerima.
    try {
      await sendInvoice(invoiceId, { sendToRecipient: false });
      sendWarning =
        primarySendError.message ||
        "Invoice dibuat, tetapi email penerima tidak dapat dikirim oleh PayPal.";
    } catch {
      const invoice = await paypalFetch(
        `/v2/invoicing/invoices/${encodeURIComponent(invoiceId)}`,
        { method: "GET" },
      );

      const paymentUrl = invoice.detail?.metadata?.recipient_view_url || null;
      if (!paymentUrl) {
        throw primarySendError;
      }

      sendWarning =
        primarySendError.message ||
        "Invoice dibuat, tetapi status pengiriman PayPal tidak lengkap.";

      return {
        id: invoice.id || invoiceId,
        number: invoice.detail?.invoice_number || input.invoiceNumber,
        status: invoice.status || "DRAFT",
        customer: input.email,
        item: input.item,
        amount: input.amount,
        currency: input.currency,
        createdAt: invoice.detail?.invoice_date || new Date().toISOString(),
        paymentUrl,
        warning: sendWarning,
        paypal: {
          status: invoice.status || null,
          invoicerViewUrl: invoice.detail?.metadata?.invoicer_view_url || null,
          links: invoice.links || [],
        },
      };
    }
  }

  const invoice = await paypalFetch(`/v2/invoicing/invoices/${encodeURIComponent(invoiceId)}`, {
    method: "GET",
  });

  return {
    id: invoice.id || invoiceId,
    number: invoice.detail?.invoice_number || input.invoiceNumber,
    status: invoice.status || "SENT",
    customer: input.email,
    item: input.item,
    amount: input.amount,
    currency: input.currency,
    createdAt: invoice.detail?.invoice_date || new Date().toISOString(),
    paymentUrl:
      invoice.detail?.metadata?.recipient_view_url ||
      extractLink(invoice.links, "payer-view") ||
      extractLink(created.links, "payer-view") ||
      null,
    warning: sendWarning,
    paypal: {
      status: invoice.status || null,
      invoicerViewUrl: invoice.detail?.metadata?.invoicer_view_url || null,
      links: invoice.links || [],
    },
  };
}

module.exports = {
  createAndSendInvoice,
};
