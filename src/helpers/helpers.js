import store from 'store2';

export function updateChart(Chart, prices, dates) {
  Chart.data.datasets[0].data = prices;
  Chart.data.labels = dates;
  Chart.update();
}

// Formate large numbers
export function formatLargeNumber(num) {
  return Math.abs(Number(num)) >= 1.0e+9 ? (Math.abs(Number(num)) / 1.0e+9).toFixed(2) + "B"
       // Six Zeroes for Millions 
       : Math.abs(Number(num)) >= 1.0e+6 ? (Math.abs(Number(num)) / 1.0e+6).toFixed(2) + "M"
       // Three Zeroes for Thousands
       : Math.abs(Number(num)) >= 1.0e+3 ? (Math.abs(Number(num)) / 1.0e+3).toFixed(2) + "K"
       : Math.abs(Number(num)).toFixed(2);
}

// Insert commas into numbers
export function formatNumberWithCommas(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Trim strings to specified length
export function trimString(string, length) {
  return string.length > length ? string.substring(0, length - 3) + '...' : string.substring(0, length);
}

// Calculate whether local storage for stock is more than 1 day old (24 hours)
export function calcLocalStorageAge(symbol) {
  const oneDay = 60 * 60 * 24 * 1000;
  const newTime = Date.now();
  let oldTime;

  // if stored data exists, calculate if data needs to be updated
  if (store.get(symbol) !== null) {
    oldTime = store.get(symbol).time;
    return (newTime - oldTime) > oneDay;
  } else {
    return true;
  }
}