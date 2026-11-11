// Чистые функции преобразования температур — без обращения к DOM.
export function celsiusToFahrenheit(celsius) {
  return (celsius * 9 / 5) + 32;
}
export function celsiusToKelvin(celsius) {
  return celsius + 273.15;
}
export function formatTemperature(value) {
  return Number(value.toFixed(2)).toString();
}