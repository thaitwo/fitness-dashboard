// FORMATE LARGE NUMBERS
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

// TRIM STRINGS TO SPECIFIED LENGTH
export function trimString(string, length) {
  return string.length > length ? string.substring(0, length - 3) + '...' : string.substring(0, length);
}