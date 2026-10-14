// functions for currency conversions and currency culculations

import { CURRENCIES } from "./data.js";

export function convert(amount, fromCurrency, toCurrency, rates) {
  const fromRate = rates[fromCurrency];
  const toRate = rates[toCurrency];

  if (!fromRate || !toRate) {
    return null;
  }

  return (amount / fromRate) * toRate;
}

//convert each expense to home currency
export function calculateTotal(expenses, homeCurrency, rates) {
  return expenses.reduce((total, expense) => {
    const converted = convert(expense.amount, expense.currency, homeCurrency, rates);
    return converted === null ? total : total + converted;
  }, 0);
}

// filter expenses by category
export function filterByCategory(expenses, category) {
  if (category === "All") {
    return expenses;
  }
  return expenses.filter((expense) => expense.category === category);
}

// formatting numbers as money
export function formatMoney(amount, currency) {
  const formatted = amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currency}`;
}

//flag image for the country code
export function getFlagUrl(currencyCode) {
  const currency = CURRENCIES.find((item) => item.code === currencyCode);

  if (!currency) {
    return "";
  }
  if (currency.country === "EU") {
    return "https://flagcdn.com/w80/eu.png";
  }

  return `https://flagsapi.com/${currency.country}/flat/64.png`;
}
