const modal = document.querySelector("#customer-modal");
const openModalButton = document.querySelector("#open-customer-modal");
const closeModalButton = document.querySelector("#close-customer-modal");
const customerForm = document.querySelector("#customer-form");
const customerInput = document.querySelector("#customer-id");
const customerError = document.querySelector("#customer-id-error");
const customerDisplay = document.querySelector("#customer-display");
const editCustomerButton = document.querySelector("#edit-customer");
const paypalSection = document.querySelector("#paypal-section");
const paymentMessage = document.querySelector("#payment-message");

let paypalButtonsRendered = false;

function openModal() {
  modal.showModal();
  window.requestAnimationFrame(() => customerInput.focus());
}

function closeModal() {
  modal.close();
  customerError.textContent = "";
  customerInput.removeAttribute("aria-invalid");
}

function validateCustomerId() {
  const value = customerInput.value.trim();

  if (value.length < 3) {
    customerError.textContent = "Masukkan email atau username yang valid.";
    customerInput.setAttribute("aria-invalid", "true");
    return false;
  }

  customerError.textContent = "";
  customerInput.removeAttribute("aria-invalid");
  return true;
}

function renderPayPalButtons() {
  if (paypalButtonsRendered) return;

  if (!window.paypal) {
    paymentMessage.textContent =
      "PayPal tidak dapat dimuat. Periksa koneksi internet lalu muat ulang halaman.";
    return;
  }

  window.paypal
    .Buttons({
      style: {
        layout: "vertical",
        shape: "pill",
        label: "paypal",
      },

      createOrder(data, actions) {
        return actions.order.create({
          purchase_units: [
            {
              description: "Pembayaran invoice INV-2026-001",
              amount: {
                currency_code: "USD",
                value: "50.84",
              },
            },
          ],
        });
      },

      async onApprove(data, actions) {
        paymentMessage.textContent = "Sedang memproses pembayaran…";

        try {
          const order = await actions.order.capture();
          paymentMessage.textContent = `Pembayaran berhasil. ID transaksi: ${order.id}`;
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
    })
    .render("#paypal-button-container");

  paypalButtonsRendered = true;
}

openModalButton.addEventListener("click", openModal);
closeModalButton.addEventListener("click", closeModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

customerInput.addEventListener("input", () => {
  if (customerInput.hasAttribute("aria-invalid")) validateCustomerId();
});

customerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateCustomerId()) return;

  customerDisplay.textContent = customerInput.value.trim();
  customerForm.hidden = true;
  paypalSection.hidden = false;
  renderPayPalButtons();
});

editCustomerButton.addEventListener("click", () => {
  paypalSection.hidden = true;
  customerForm.hidden = false;
  customerInput.focus();
});
