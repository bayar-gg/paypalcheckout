const checkoutForm = document.querySelector("#checkout-form");
const paypalSection = document.querySelector("#paypal-section");
const emailInput = document.querySelector("#customer-email");
const itemInput = document.querySelector("#invoice-item");
const amountInput = document.querySelector("#invoice-amount");
const emailError = document.querySelector("#customer-email-error");
const itemError = document.querySelector("#invoice-item-error");
const amountError = document.querySelector("#invoice-amount-error");
const summaryEmail = document.querySelector("#summary-email");
const summaryItem = document.querySelector("#summary-item");
const summaryTotal = document.querySelector("#summary-total");
const paymentMessage = document.querySelector("#payment-message");
const editCheckoutButton = document.querySelector("#edit-checkout");
const paypalContainer = document.querySelector("#paypal-button-container");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let activeCheckout = null;
let paypalButtons = null;

function clearFieldError(input, errorNode) {
  errorNode.textContent = "";
  input.removeAttribute("aria-invalid");
}

function setFieldError(input, errorNode, message) {
  errorNode.textContent = message;
  input.setAttribute("aria-invalid", "true");
}

function formatMoney(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number(amount));
}

function validateCheckoutForm() {
  let isValid = true;
  const email = emailInput.value.trim();
  const item = itemInput.value.trim();
  const amount = Number(amountInput.value);

  clearFieldError(emailInput, emailError);
  clearFieldError(itemInput, itemError);
  clearFieldError(amountInput, amountError);

  if (!emailPattern.test(email)) {
    setFieldError(emailInput, emailError, "Enter a valid customer email.");
    isValid = false;
  }

  if (item.length < 3) {
    setFieldError(itemInput, itemError, "Description must be at least 3 characters.");
    isValid = false;
  }

  if (!Number.isFinite(amount) || amount < 0.01) {
    setFieldError(amountInput, amountError, "Enter an amount of at least 0.01.");
    isValid = false;
  }

  return isValid;
}

function destroyPayPalButtons() {
  if (paypalButtons && typeof paypalButtons.close === "function") {
    paypalButtons.close();
  }
  paypalButtons = null;
  paypalContainer.innerHTML = "";
}

function renderPayPalButtons(checkout) {
  destroyPayPalButtons();
  paymentMessage.textContent = "";

  if (!window.paypal) {
    paymentMessage.textContent =
      "PayPal SDK failed to load. Check your connection and refresh the page.";
    return;
  }

  paypalButtons = window.paypal.Buttons({
    style: {
      layout: "vertical",
      color: "gold",
      shape: "rect",
      label: "paypal",
    },

    createOrder(_data, actions) {
      return actions.order.create({
        purchase_units: [
          {
            description: checkout.item,
            custom_id: checkout.email,
            amount: {
              currency_code: "USD",
              value: checkout.amount,
            },
          },
        ],
      });
    },

    async onApprove(_data, actions) {
      paymentMessage.textContent = "Processing payment…";

      try {
        const order = await actions.order.capture();
        paymentMessage.textContent = `Payment completed. Transaction ID: ${order.id}`;
      } catch {
        paymentMessage.textContent = "Payment could not be completed. Please try again.";
      }
    },

    onCancel() {
      paymentMessage.textContent = "Payment cancelled. You can try again.";
    },

    onError() {
      paymentMessage.textContent = "PayPal reported an error. Please try again.";
    },
  });

  paypalButtons.render("#paypal-button-container");
}

function showPayPalSection(checkout) {
  activeCheckout = checkout;
  checkoutForm.hidden = true;
  paypalSection.hidden = false;
  summaryEmail.textContent = checkout.email;
  summaryItem.textContent = checkout.item;
  summaryTotal.textContent = formatMoney(checkout.amount);
  renderPayPalButtons(checkout);
}

function showCheckoutForm() {
  paypalSection.hidden = true;
  checkoutForm.hidden = false;
  destroyPayPalButtons();
  paymentMessage.textContent = "";
  window.requestAnimationFrame(() => emailInput.focus());
}

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!validateCheckoutForm()) return;

  showPayPalSection({
    email: emailInput.value.trim(),
    item: itemInput.value.trim(),
    amount: Number(amountInput.value).toFixed(2),
  });
});

editCheckoutButton.addEventListener("click", () => {
  if (activeCheckout) {
    emailInput.value = activeCheckout.email;
    itemInput.value = activeCheckout.item;
    amountInput.value = activeCheckout.amount;
  }
  showCheckoutForm();
});

[emailInput, itemInput, amountInput].forEach((input) => {
  input.addEventListener("input", () => {
    if (!input.hasAttribute("aria-invalid")) return;
    validateCheckoutForm();
  });
});
