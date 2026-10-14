// changing the live states and building new array for the expense list using spread,map and filter - The DOM
import { CURRENCIES } from "./data.js";
import {
  convert,
  calculateTotal,
  filterByCategory,
  formatMoney,
  getFlagUrl,
} from "./utils.js";

// filling dropdowns
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

// show the flag
export function showFlag(img, currencyCode) {
  img.src = getFlagUrl(currencyCode);
  img.alt = `${currencyCode} flag`;
}

export function showFormError(message) {
  const formError = document.querySelector("#form-error");
  if (formError) formError.textContent = message;
}

export function clearFormError() {
  const formError = document.querySelector("#form-error");
  if (formError) formError.textContent = "";
}

export function renderRatesStatus(state) {
  const statusEl = document.querySelector("#rates-status");
  if (!statusEl) return;

  const hasRates = Object.keys(state.rates).length > 0;
  statusEl.textContent = hasRates ? "Rates available" : "Rates unavailable";
  statusEl.dataset.state = hasRates ? "ready" : "missing";
}

export function renderRateStatement(formCurrency, state) {
  const statementEl = document.querySelector("#rate-statement");
  if (!statementEl) return;

  const hasRates = Object.keys(state.rates).length > 0;
  const currency = formCurrency || state.homeCurrency;

  if (!hasRates || !state.rates[currency]) {
    statementEl.textContent = "Rates unavailable";
    return;
  }

  const converted = convert(1, currency, state.homeCurrency, state.rates);
  statementEl.textContent =
    converted === null
      ? "Rates unavailable"
      : `${formatMoney(converted, state.homeCurrency)} per ${currency}`;
}

//expense list
function createExpenseItem(expense, state) {
  const { homeCurrency, rates, editingId } = state;
  const converted = convert(expense.amount, expense.currency, homeCurrency, rates);

  const item = document.createElement("li");
  item.className = "expense-item";
  item.dataset.id = expense.id;

  // Highlight the item if it's currently being edited
  if (expense.id === editingId) {
    item.classList.add("editing");
  }

  const info = document.createElement("div");

  const description = document.createElement("div");
  description.className = "expense-description";
  description.textContent = expense.description;

  const category = document.createElement("div");
  category.className = "expense-category";
  category.textContent = expense.category;

  info.append(description, category);

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

  // --- NEW: Edit and Delete buttons container ---
  const actions = document.createElement("div");
  actions.className = "expense-actions";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "edit-btn";
  editBtn.dataset.action = "edit";
  editBtn.dataset.id = expense.id;
  editBtn.textContent = "Edit";

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "delete-btn";
  deleteBtn.dataset.action = "delete";
  deleteBtn.dataset.id = expense.id;
  deleteBtn.textContent = "Delete";

  actions.append(editBtn, deleteBtn);
  // ----------------------------------------------

  item.append(info, amounts, actions);
  return item;
}

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

function renderFormMode(state) {
  const isEditing = state.editingId !== null;

  document.querySelector("#form-title").textContent = isEditing ? "Edit expense" : "Add an expense";
  document.querySelector("#submit-button").textContent = isEditing ? "Save changes" : "Add expense";
  document.querySelector("#cancel-button").hidden = !isEditing;
  document.querySelector("#form-card").classList.toggle("editing", isEditing);
}

export function fillForm(expense) {
  document.querySelector("#description").value = expense.description;
  document.querySelector("#amount").value = expense.amount;
  document.querySelector("#currency").value = expense.currency;
  document.querySelector("#category").value = expense.category;
}

export function clearForm() {
  document.querySelector("#description").value = "";
  document.querySelector("#amount").value = "";
  const currency = document.querySelector("#currency");
  const category = document.querySelector("#category");

  if (currency && currency.options.length) {
    currency.value = currency.options[0].value;
  }

  if (category && category.options.length) {
    category.value = category.options[0].value;
  }
}

// Rewriting of everything in the current state
export function render(state, formCurrency) {
  const visibleExpenses = filterByCategory(state.expenses, state.categoryFilter);

  renderRatesStatus(state);
  renderFormMode(state);
  renderRateStatement(formCurrency, state);
  renderExpenses(visibleExpenses, state);
  renderTotal(visibleExpenses, state);

  showFlag(document.querySelector("#currency-flag"), formCurrency || state.homeCurrency);
  showFlag(document.querySelector("#home-flag"), state.homeCurrency);
}
