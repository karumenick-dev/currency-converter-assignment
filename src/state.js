// all the functions needed to update the list as well

const initialState = {
  expenses: [],
  homeCurrency: "USD",
  categoryFilter: "All",
  rates: {}, // which is being filled in by the API
  ratesStatus: "loading", // "loading", "ready" or "error"
  ratesError: "",
  lastUpdated: null, // when the API last updated its rates
  editingId: null, // id of the expense being edited, or null when adding
};

let state = initialState;
let nextId = 1;

export function getState() {
  return state;
}

// Start again from scratch (used by the tests)
export function resetState() {
  state = initialState;
  nextId = 1;
}

// expenses

export function addExpense({ description, amount, currency, category }) {
  const newExpense = { id: nextId, description, amount, currency, category };
  nextId = nextId + 1;
  state = { ...state, expenses: [...state.expenses, newExpense] };
}

// Settings

export function setHomeCurrency(currency) {
  state = { ...state, homeCurrency: currency };
}

export function setCategoryFilter(category) {
  state = { ...state, categoryFilter: category };
}

// Exchange rates 

export function setRatesLoading() {
  state = { ...state, ratesStatus: "loading", ratesError: "" };
}

export function setRates(rates, lastUpdated) {
  state = { ...state, rates, lastUpdated, ratesStatus: "ready", ratesError: "" };
}

// Note: we keep the old rates (if any), so the app still works offline
export function setRatesError(message) {
  state = { ...state, ratesStatus: "error", ratesError: message };
}

