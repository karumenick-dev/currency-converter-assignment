// Uses REST API - fethches the live exchange rates
const API_URL = "https://open.er-api.com/v6/latest/";

export async function fetchRates(baseCurrency) {
  const response = await fetch(API_URL + baseCurrency);

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  
  const data = await response.json();

  if (data.result !== "success") {
    throw new Error("The exchange rate service returned an error");
  }

  return {
    rates: data.rates,
    lastUpdated: data.time_last_update_unix * 1000, 
  };
}
