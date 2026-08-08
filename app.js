const createView = document.querySelector("#create-view");
const invoiceView = document.querySelector("#invoice-view");
const invoiceForm = document.querySelector("#invoice-form");
const emailInput = document.querySelector("#customer-email");
const itemInput = document.querySelector("#invoice-item");
const amountInput = document.querySelector("#invoice-amount");
const currencySelect = document.querySelector("#invoice-currency");
const noteInput = document.querySelector("#invoice-note");
const emailError = document.querySelector("#customer-email-error");
const itemError = document.querySelector("#invoice-item-error");
const amountError = document.querySelector("#invoice-amount-error");
const formStatus = document.querySelector("#form-status");
const submitButton = document.querySelector("#submit-invoice");
const invoiceNumberDisplay = document.querySelector("#invoice-number-display");
const invoiceCustomerDisplay = document.querySelector("#invoice-customer-display");
const invoiceIdDisplay = document.querySelector("#invoice-id-display");
const invoiceItemDisplay = document.querySelector("#invoice-item-display");
const invoiceTotalDisplay = document.querySelector("#invoice-total-display");
const invoiceStatus = document.querySelector("#invoice-status");
const invoiceTitle = document.querySelector("#invoice-title");
const paymentMessage = document.querySelector("#payment-message");
const payInvoiceLink = document.querySelector("#pay-invoice-link");
const createAnotherButton = document.querySelector("#create-another");

const STORAGE_KEY = "bayar.activePaypalInvoice";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function clearFieldError(input, errorNode) {
  errorNode.textContent = "";
  input.removeAttribute("aria-invalid");
}

function setFieldError(input, errorNode, message) {
  errorNode.textContent = message;
  input.setAttribute("aria-invalid", "true");
}

function formatMoney(amount, currency) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Number(amount));
}

function persistInvoice(invoice) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(invoice));
}

function loadPersistedInvoice() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearPersistedInvoice() {
  window.localStorage.removeItem(STORAGE_KEY);
}

function validateInvoiceForm() {
  let isValid = true;
  const email = emailInput.value.trim();
  const item = itemInput.value.trim();
  const amount = Number(amountInput.value);

  clearFieldError(emailInput, emailError);
  clearFieldError(itemInput, itemError);
  clearFieldError(amountInput, amountError);

  if (!emailPattern.test(email)) {
    setFieldError(emailInput, emailError, "Masukkan email pelanggan yang valid.");
    isValid = false;
  }

  if (item.length < 3) {
    setFieldError(itemInput, itemError, "Deskripsi tagihan minimal 3 karakter.");
    isValid = false;
  }

  if (!Number.isFinite(amount) || amount < 0.01) {
    setFieldError(amountInput, amountError, "Masukkan jumlah minimal 0.01.");
    isValid = false;
  }

  return isValid;
}

function setSubmitting(isSubmitting) {
  submitButton.disabled = isSubmitting;
  submitButton.textContent = isSubmitting
    ? "Membuat invoice…"
    : "Buat & kirim invoice PayPal";
}

function showCreateView() {
  invoiceView.hidden = true;
  createView.hidden = false;
  formStatus.textContent = "";
  window.requestAnimationFrame(() => emailInput.focus());
}

function showInvoiceView(invoice) {
  createView.hidden = true;
  invoiceView.hidden = false;

  invoiceTitle.textContent = `Invoice ${invoice.number}`;
  invoiceNumberDisplay.textContent = invoice.number;
  invoiceCustomerDisplay.textContent = invoice.customer;
  invoiceIdDisplay.textContent = invoice.id || "-";
  invoiceItemDisplay.textContent = invoice.item;
  invoiceTotalDisplay.textContent = `${formatMoney(invoice.amount, invoice.currency)} ${invoice.currency}`;
  invoiceStatus.textContent = invoice.status || "SENT";

  const paid = String(invoice.status || "").toUpperCase() === "PAID";
  invoiceStatus.classList.toggle("status-pill--paid", paid);

  if (invoice.paymentUrl) {
    payInvoiceLink.href = invoice.paymentUrl;
    payInvoiceLink.hidden = false;
    paymentMessage.textContent = paid
      ? "Invoice sudah lunas."
      : invoice.warning ||
        "Invoice PayPal siap. Buka link resmi untuk membayar atau periksa email pelanggan.";
  } else {
    payInvoiceLink.removeAttribute("href");
    payInvoiceLink.hidden = true;
    paymentMessage.textContent =
      invoice.warning ||
      "Invoice berhasil dibuat. Link pembayaran tidak tersedia; periksa email pelanggan di PayPal.";
  }
}

async function createInvoiceRequest(payload) {
  const response = await fetch("/api/invoices", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || "Gagal membuat invoice melalui PayPal API.");
  }

  return data.invoice;
}

invoiceForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  formStatus.textContent = "";
  if (!validateInvoiceForm()) return;

  setSubmitting(true);

  try {
    const invoice = await createInvoiceRequest({
      email: emailInput.value.trim(),
      item: itemInput.value.trim(),
      amount: amountInput.value,
      currency: currencySelect.value,
      note: noteInput.value.trim(),
    });

    persistInvoice(invoice);
    showInvoiceView(invoice);
  } catch (error) {
    formStatus.textContent = error.message || "Gagal membuat invoice.";
  } finally {
    setSubmitting(false);
  }
});

createAnotherButton.addEventListener("click", () => {
  clearPersistedInvoice();
  invoiceForm.reset();
  currencySelect.value = "USD";
  showCreateView();
});

[emailInput, itemInput, amountInput].forEach((input) => {
  input.addEventListener("input", () => {
    if (!input.hasAttribute("aria-invalid")) return;
    validateInvoiceForm();
  });
});

const existingInvoice = loadPersistedInvoice();
if (existingInvoice?.id || existingInvoice?.number) {
  showInvoiceView(existingInvoice);
} else {
  showCreateView();
}
