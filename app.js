const createView = document.querySelector("#create-view");
const invoiceView = document.querySelector("#invoice-view");
const invoiceForm = document.querySelector("#invoice-form");
const customerInput = document.querySelector("#customer-id");
const itemInput = document.querySelector("#invoice-item");
const amountInput = document.querySelector("#invoice-amount");
const currencySelect = document.querySelector("#invoice-currency");
const customerError = document.querySelector("#customer-id-error");
const itemError = document.querySelector("#invoice-item-error");
const amountError = document.querySelector("#invoice-amount-error");
const invoiceNumberDisplay = document.querySelector("#invoice-number-display");
const invoiceCustomerDisplay = document.querySelector("#invoice-customer-display");
const invoiceCreatedDisplay = document.querySelector("#invoice-created-display");
const invoiceItemDisplay = document.querySelector("#invoice-item-display");
const invoiceTotalDisplay = document.querySelector("#invoice-total-display");
const invoiceStatus = document.querySelector("#invoice-status");
const invoiceTitle = document.querySelector("#invoice-title");
const paymentMessage = document.querySelector("#payment-message");
const editInvoiceButton = document.querySelector("#edit-invoice");
const paypalContainer = document.querySelector("#paypal-button-container");

const STORAGE_KEY = "bayar.activeInvoice";
const PAYPAL_CLIENT_ID =
  "BAAGzXCZncFT6EE2MtBDQzs-VIHJnr0AjVrFzM2bMc08EyBDkRq9gxywXToh_dhanfpEfuV673RlJieBbE";

let activeInvoice = null;
let paypalButtons = null;
let loadedPayPalCurrency = null;
let paypalSdkPromise = null;

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

function formatDate(isoString) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(isoString));
}

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

function validateInvoiceForm() {
  let isValid = true;
  const customer = customerInput.value.trim();
  const item = itemInput.value.trim();
  const amount = Number(amountInput.value);

  clearFieldError(customerInput, customerError);
  clearFieldError(itemInput, itemError);
  clearFieldError(amountInput, amountError);

  if (customer.length < 3) {
    setFieldError(customerInput, customerError, "Masukkan email atau username yang valid.");
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

function persistInvoice(invoice) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(invoice));
}

function loadPersistedInvoice() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function clearPersistedInvoice() {
  window.localStorage.removeItem(STORAGE_KEY);
}

function destroyPayPalButtons() {
  if (paypalButtons && typeof paypalButtons.close === "function") {
    paypalButtons.close();
  }
  paypalButtons = null;
  paypalContainer.innerHTML = "";
}

function loadPayPalSdk(currency) {
  if (loadedPayPalCurrency === currency && window.paypal) {
    return Promise.resolve(window.paypal);
  }

  if (paypalSdkPromise && loadedPayPalCurrency === currency) {
    return paypalSdkPromise;
  }

  destroyPayPalButtons();
  document.querySelectorAll("script[data-paypal-sdk]").forEach((node) => node.remove());
  delete window.paypal;
  loadedPayPalCurrency = currency;

  paypalSdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
      PAYPAL_CLIENT_ID,
    )}&currency=${encodeURIComponent(currency)}&intent=capture`;
    script.async = true;
    script.dataset.paypalSdk = "true";
    script.onload = () => resolve(window.paypal);
    script.onerror = () => reject(new Error("PayPal SDK gagal dimuat."));
    document.body.appendChild(script);
  });

  return paypalSdkPromise;
}

function showCreateView() {
  invoiceView.hidden = true;
  createView.hidden = false;
  destroyPayPalButtons();
  paymentMessage.textContent = "";
  window.requestAnimationFrame(() => customerInput.focus());
}

function showInvoiceView(invoice) {
  activeInvoice = invoice;
  createView.hidden = true;
  invoiceView.hidden = false;

  invoiceTitle.textContent = `Bayar ${invoice.number}`;
  invoiceNumberDisplay.textContent = invoice.number;
  invoiceCustomerDisplay.textContent = invoice.customer;
  invoiceCreatedDisplay.textContent = formatDate(invoice.createdAt);
  invoiceItemDisplay.textContent = invoice.item;
  invoiceTotalDisplay.textContent = `${formatMoney(invoice.amount, invoice.currency)} ${invoice.currency}`;

  if (invoice.status === "paid") {
    invoiceStatus.textContent = "Lunas";
    invoiceStatus.classList.add("status-pill--paid");
    editInvoiceButton.hidden = true;
    paymentMessage.textContent = invoice.transactionId
      ? `Pembayaran berhasil. ID transaksi: ${invoice.transactionId}`
      : "Invoice sudah lunas.";
    destroyPayPalButtons();
    return;
  }

  invoiceStatus.textContent = "Belum dibayar";
  invoiceStatus.classList.remove("status-pill--paid");
  editInvoiceButton.hidden = false;
  paymentMessage.textContent = "";
  renderPayPalButtons(invoice);
}

async function renderPayPalButtons(invoice) {
  destroyPayPalButtons();
  paymentMessage.textContent = "Menyiapkan opsi pembayaran…";

  try {
    const paypal = await loadPayPalSdk(invoice.currency);
    if (!paypal) {
      throw new Error("PayPal SDK tidak tersedia.");
    }

    paypalButtons = paypal.Buttons({
      style: {
        layout: "vertical",
        shape: "pill",
        label: "pay",
      },

      createOrder(data, actions) {
        return actions.order.create({
          purchase_units: [
            {
              invoice_id: invoice.number,
              description: invoice.item,
              custom_id: invoice.customer,
              amount: {
                currency_code: invoice.currency,
                value: invoice.amount,
              },
            },
          ],
        });
      },

      async onApprove(data, actions) {
        paymentMessage.textContent = "Sedang memproses pembayaran…";

        try {
          const order = await actions.order.capture();
          activeInvoice = {
            ...invoice,
            status: "paid",
            transactionId: order.id,
            paidAt: new Date().toISOString(),
          };
          persistInvoice(activeInvoice);
          showInvoiceView(activeInvoice);
        } catch {
          paymentMessage.textContent =
            "Pembayaran belum dapat diselesaikan. Silakan coba kembali.";
        }
      },

      onCancel() {
        paymentMessage.textContent = "Pembayaran dibatalkan. Anda dapat mencoba kembali.";
      },

      onError() {
        paymentMessage.textContent =
          "Terjadi kesalahan saat membuka PayPal. Silakan coba kembali.";
      },
    });

    await paypalButtons.render("#paypal-button-container");
    if (activeInvoice?.status !== "paid") {
      paymentMessage.textContent = "";
    }
  } catch {
    paymentMessage.textContent =
      "PayPal tidak dapat dimuat. Periksa koneksi internet lalu muat ulang halaman.";
  }
}

invoiceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateInvoiceForm()) return;

  const invoice = {
    number: createInvoiceNumber(),
    customer: customerInput.value.trim(),
    item: itemInput.value.trim(),
    amount: Number(amountInput.value).toFixed(2),
    currency: currencySelect.value,
    createdAt: new Date().toISOString(),
    status: "unpaid",
    transactionId: null,
    paidAt: null,
  };

  persistInvoice(invoice);
  showInvoiceView(invoice);
});

editInvoiceButton.addEventListener("click", () => {
  if (!activeInvoice) {
    showCreateView();
    return;
  }

  customerInput.value = activeInvoice.customer;
  itemInput.value = activeInvoice.item;
  amountInput.value = activeInvoice.amount;
  currencySelect.value = activeInvoice.currency;
  clearPersistedInvoice();
  activeInvoice = null;
  showCreateView();
});

[customerInput, itemInput, amountInput].forEach((input) => {
  input.addEventListener("input", () => {
    if (!input.hasAttribute("aria-invalid")) return;
    validateInvoiceForm();
  });
});

const existingInvoice = loadPersistedInvoice();
if (existingInvoice?.number) {
  showInvoiceView(existingInvoice);
} else {
  showCreateView();
}
