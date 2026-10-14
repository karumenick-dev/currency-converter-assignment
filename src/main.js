// DOM - clicks and event listener and as well connecting everything
import {
    CATEGORIES
} from "./data.js";
import { 
    fetchRates 
} from "./api.js";
import {
  getState,
  addExpense,
  setHomeCurrency,
  setCategoryFilter,
  setRatesLoading,
  setRates,
  setRatesError,
  deleteExpense,
  setEditingId,
  updateExpense,
} from "./state.js";
import {
  fillSelect,
  fillCurrencySelect,
  render,
  fillForm,
  clearForm,
} from "./ui.js";

const form = document.querySelector("#expense-form");
const descriptionInput = document.querySelector("#description");
const amountInput = document.querySelector("#amount");
const currencySelect = document.querySelector("#currency");
const categorySelect = document.querySelector("#category");
const homeCurrencySelect = document.querySelector("#home-currency");
const categoryFilterSelect = document.querySelector("#category-filter");
const expenseList = document.querySelector("#expense-list");
const retryButton = document.querySelector("#retry-button");
const cancelButton = document.querySelector("#cancel-button");
const REFRESH_INTERVAL_MS = 60 * 60 * 1000;

function refresh() {
  render(getState(), currencySelect.value);
}

// Get live rates from the API. Errors are caught and shown, never silent.
async function loadRates() {
  setRatesLoading();
  refresh();

  try {
    const { rates, lastUpdated } = await fetchRates(getState().homeCurrency);
    setRates(rates, lastUpdated);
  } catch (error) {
    setRatesError(error.message);
  }

  refresh();
}

// Fill the dropdowns
fillCurrencySelect(currencySelect, "USD");
fillSelect(categorySelect, CATEGORIES, CATEGORIES[0]);
fillCurrencySelect(homeCurrencySelect, getState().homeCurrency);
fillSelect(categoryFilterSelect, ["All", ...CATEGORIES], "All");

// Leave edit mode and go back to an empty "Add" form
function stopEditing() {
  setEditingId(null);
  clearForm();
  refresh();
}

// Add a new expense, or save changes to the one being edited
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const amount = Number(amountInput.value);

  if (description === "") {
    return;
  }
  if (Number.isNaN(amount) || amount <= 0) {
    return;
  }

  const { editingId } = getState();

  if (editingId !== null) {
    // Update existing expense
    updateExpense({
      id: editingId,
      description,
      amount,
      currency: currencySelect.value,
      category: categorySelect.value,
    });
  } else {
    // Add new expense
    const expense = {
      description,
      amount,
      currency: currencySelect.value,
      category: categorySelect.value,
    };
    addExpense(expense);
  }

  stopEditing();
  descriptionInput.focus();
});

// Handle clicks on the expense list (Delete & Edit buttons via event delegation)
expenseList.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  const id = Number(button.dataset.id);
  if (!id) return;

  // Check if delete button was clicked
  if (button.classList.contains("delete-btn") || button.dataset.action === "delete") {
    deleteExpense(id);
    refresh();
  } 
  // Check if edit button was clicked
  else if (button.classList.contains("edit-btn") || button.dataset.action === "edit") {
    setEditingId(id);
    const expenseToEdit = getState().expenses.find((exp) => exp.id === id);
    if (expenseToEdit) {
      fillForm(expenseToEdit);
    }
    refresh();
  }
});

cancelButton?.addEventListener("click", stopEditing);

// Picking a currency in the form updates its flag and the exchange rate line
currencySelect.addEventListener("change", refresh);

// Change home currency, then fetch rates for the new currency
homeCurrencySelect.addEventListener("change", () => {
  setHomeCurrency(homeCurrencySelect.value);
  refresh();
  loadRates();
});

// Filter by category
categoryFilterSelect.addEventListener("change", () => {
  setCategoryFilter(categoryFilterSelect.value);
  refresh();
});

// "Try again" button on the error banner
retryButton?.addEventListener("click", loadRates);

// Load rates now, then keep them fresh automatically
loadRates();
setInterval(loadRates, REFRESH_INTERVAL_MS);