// changing the live states and building new array for the expense list using spread,map and filter - The DOM
import { CURRENCIES } from "./data.js";
import {
  convert,
  calculateTotal,
  filterByCategory,
  formatMoney,
  formatRateStatement,
  getFlagUrl,
} from "./utils.js";

// ---------- Filling dropdowns ----------

/** Fill a <select> with simple text options, e.g. categories. */
export function fillSelect(select, values, selectedValue) {
  select.innerHTML = "";
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    option.selected = value === selectedValue;
    select.appendChild(option);
  });
}

/** Fill a <select> with every currency, e.g. "KES - Kenyan Shilling". */
export function fillCurrencySelect(select, selectedCode) {
  select.innerHTML = "";
  CURRENCIES.forEach((currency) => {
    const option = document.createElement("option");
    option.value = currency.code;
    option.textContent = `${currency.code} - ${currency.name}`;
    option.selected = currency.code === selectedCode;
    select.appendChild(option);
  });
}

// ---------- Small pieces ----------

/** Point an <img> at the flag for a currency. */
export function showFlag(img, currencyCode) {
  img.src = getFlagUrl(currencyCode);
  img.alt = `${currencyCode} flag`;
}

export function showFormError(message) {
  document.querySelector("#form-error").textContent = message;
}

export function clearFormError() {
  document.querySelector("#form-error").textContent = "";
}

/** The coloured banner at the top: loading, error or last updated. */
function renderRatesStatus(state) {
  const banner = document.querySelector("#rates-status");
  const message = document.querySelector("#rates-message");
  const retryButton = document.querySelector("#retry-button");

  banner.className = `rates-status ${state.ratesStatus}`;
  retryButton.hidden = state.ratesStatus !== "error";

  if (state.ratesStatus === "loading") {
    message.textContent = "Loading exchange rates…";
  } else if (state.ratesStatus === "error") {
    const hasOldRates = Object.keys(state.rates).length > 0;
    message.textContent = hasOldRates
      ? `Couldn't refresh rates (${state.ratesError}). Showing the last rates we had.`
      : `Couldn't load exchange rates (${state.ratesError}).`;
  } else {
    const time = new Date(state.lastUpdated).toLocaleString();
    message.textContent = `Live exchange rates, last updated ${time}`;
  }
}

/** The "1 KES = 0.007722 USD" line under the form. */
function renderRateStatement(formCurrency, state) {
  const statement = formatRateStatement(formCurrency, state.homeCurrency, state.rates);
  document.querySelector("#rate-statement").textContent = statement
    ? `Exchange rate: ${statement}`
    : "";
}

/** Build one <li> for an expense. */
function createExpenseItem(expense, state) {
  const { homeCurrency, rates } = state;
  const converted = convert(expense.amount, expense.currency, homeCurrency, rates);

  const item = document.createElement("li");
  item.className = "expense-item";
  item.dataset.id = expense.id;

  // Highlight the row that is being edited
  if (expense.id === state.editingId) {
    item.classList.add("editing");
  }

  // Left side: description + category
  const info = document.createElement("div");

  const description = document.createElement("div");
  description.className = "expense-description";
  description.textContent = expense.description; // textContent keeps user input safe

  const category = document.createElement("div");
  category.className = "expense-category";
  category.textContent = expense.category;

  info.append(description, category);

  // Middle: converted amount + original amount with its flag
  const amounts = document.createElement("div");
  amounts.className = "expense-amounts";

  const convertedText = document.createElement("span");
  convertedText.className = "converted";
  convertedText.textContent =
    converted === null ? "Rate unavailable" : formatMoney(converted, homeCurrency);

  const originalText = document.createElement("span");
  originalText.className = "original";

  const flag = document.createElement("img");
  flag.className = "flag flag-small";
  showFlag(flag, expense.currency);

  originalText.append(flag, " ", formatMoney(expense.amount, expense.currency));
  amounts.append(convertedText, originalText);

  // Right side: Edit and Delete buttons
  const actions = document.createElement("div");
  actions.className = "expense-actions";

  const editButton = document.createElement("button");
  editButton.type = "button";
  editButton.className = "btn btn-small btn-edit";
  editButton.textContent = "Edit";

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "btn btn-small btn-delete";
  deleteButton.textContent = "Delete";

  actions.append(editButton, deleteButton);

  item.append(info, amounts, actions);
  return item;
}

/** Draw the expense list and the empty message. */
function renderExpenses(visibleExpenses, state) {
  const expenseList = document.querySelector("#expense-list");
  const emptyMessage = document.querySelector("#empty-message");

  expenseList.innerHTML = "";
  visibleExpenses
    .map((expense) => createExpenseItem(expense, state))
    .forEach((item) => expenseList.appendChild(item));

  emptyMessage.hidden = visibleExpenses.length > 0;
  emptyMessage.textContent =
    state.expenses.length === 0
      ? "No expenses yet. Add one above."
      : `No expenses in "${state.categoryFilter}".`;
}

/** Draw the total. It follows the filter, so it matches what's on screen. */
function renderTotal(visibleExpenses, state) {
  const totalAmount = document.querySelector("#total-amount");
  const hasRates = Object.keys(state.rates).length > 0;

  if (!hasRates) {
    totalAmount.textContent = "—";
    return;
  }

  const total = calculateTotal(visibleExpenses, state.homeCurrency, state.rates);
  totalAmount.textContent = formatMoney(total, state.homeCurrency);
}

/** Switch the form between "Add" mode and "Edit" mode. */
function renderFormMode(state) {
  const isEditing = state.editingId !== null;

  document.querySelector("#form-title").textContent = isEditing ? "Edit expense" : "Add an expense";
  document.querySelector("#submit-button").textContent = isEditing ? "Save changes" : "Add expense";
  document.querySelector("#cancel-button").hidden = !isEditing;
  document.querySelector("#form-card").classList.toggle("editing", isEditing);
}

/** Put an expense's values into the form so the user can change them. */
export function fillForm(expense) {
  document.querySelector("#description").value = expense.description;
  document.querySelector("#amount").value = expense.amount;
  document.querySelector("#currency").value = expense.currency;
  document.querySelector("#category").value = expense.category;
}

/** Empty the text boxes (the dropdowns keep their choice). */
export function clearForm() {
  document.querySelector("#description").value = "";
  document.querySelector("#amount").value = "";
}

// ---------- Main render ----------

/**
 * Redraw everything from the current state.
 * `formCurrency` is the currency picked in the "Add an expense" form.
 */
export function render(state, formCurrency) {
  const visibleExpenses = filterByCategory(state.expenses, state.categoryFilter);

  renderRatesStatus(state);
  renderFormMode(state);
  renderRateStatement(formCurrency, state);
  renderExpenses(visibleExpenses, state);
  renderTotal(visibleExpenses, state);

  showFlag(document.querySelector("#currency-flag"), formCurrency);
  showFlag(document.querySelector("#home-flag"), state.homeCurrency);
}
