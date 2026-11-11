import { celsiusToFahrenheit, celsiusToKelvin, formatTemperature } from "./modules/temperature.js";

const input = document.querySelector("#celsius");
const result = document.querySelector("#result");

document.querySelector("#convert").addEventListener("click", () => {
  const c = Number(input.value);
  if (input.value.trim() === "" || !Number.isFinite(c)) {
    result.innerHTML = '<span class="error">Введите корректное числовое значение.</span>';
    return;
  }
  if (c < -273.15) {
    result.innerHTML = '<span class="error">Температура не может быть ниже абсолютного нуля (−273,15 °C).</span>';
    return;
  }
  result.textContent = `Цельсий: ${formatTemperature(c)} °C | Фаренгейт: ${formatTemperature(celsiusToFahrenheit(c))} °F | Кельвин: ${formatTemperature(celsiusToKelvin(c))} K`;
});

document.querySelector("#clear").addEventListener("click", () => {
  input.value = "";
  result.textContent = "Введите значение и нажмите «Конвертировать».";
  input.focus();
});