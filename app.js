const INVOICE_PAY_URL = "https://www.paypal.com/invoice/p/pay/#INV2-5ASS-K9NU-SLMA-P2Y8";
const INVOICE_ID = "INV2-5ASS-K9NU-SLMA-P2Y8";
const STORAGE_KEY = "bayar.partialInvoiceAmount";

const partialForm = document.querySelector("#partial-form");
const amountInput = document.querySelector("#partial-amount");
const amountError = document.querySelector("#partial-amount-error");
const paymentMessage = document.querySelector("#payment-message");
const openFullInvoice = document.querySelector("#open-full-invoice");

function formatMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(amount));
}

function clearAmountError() {
  amountError.textContent = "";
  amountInput.removeAttribute("aria-invalid");
}

function setAmountError(message) {
  amountError.textContent = message;
  amountInput.setAttribute("aria-invalid", "true");
}

function validateAmount() {
  const amount = Number(amountInput.value);
  clearAmountError();

  if (!Number.isFinite(amount) || amount < 0.01) {
    setAmountError("Enter a partial amount of at least 0.01.");
    return null;
  }

  return amount.toFixed(2);
}

function rememberAmount(amount) {
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      invoiceId: INVOICE_ID,
      amount,
      savedAt: new Date().toISOString(),
    }),
  );
}

function restoreAmount() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved?.invoiceId === INVOICE_ID && saved?.amount) {
      amountInput.value = saved.amount;
    }
  } catch {
    // Ignore invalid localStorage data.
  }
}

function openInvoicePayment(amount) {
  rememberAmount(amount);
  paymentMessage.textContent = `Opening PayPal for partial payment of ${formatMoney(amount)}. Confirm the amount on the invoice page if asked.`;

  // PayPal hosted invoice pages do not accept amount via URL.
  // Partial amount must be allowed on the invoice and confirmed on PayPal.
  const paymentWindow = window.open(INVOICE_PAY_URL, "_blank", "noopener,noreferrer");

  if (!paymentWindow) {
    window.location.assign(INVOICE_PAY_URL);
  }
}

partialForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const amount = validateAmount();
  if (!amount) return;
  openInvoicePayment(amount);
});

amountInput.addEventListener("input", () => {
  if (amountInput.hasAttribute("aria-invalid")) validateAmount();
});

openFullInvoice.addEventListener("click", () => {
  const amount = amountInput.value.trim();
  if (amount) {
    const validAmount = validateAmount();
    if (validAmount) rememberAmount(validAmount);
  }
});

restoreAmount();
