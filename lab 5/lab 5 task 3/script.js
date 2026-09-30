let count = 0;

const counter = document.getElementById("counter");
const plusButton = document.getElementById("plus");
const minusButton = document.getElementById("minus");
const resetButton = document.getElementById("reset");

function updateCounter() {
    counter.textContent = count;
}

plusButton.addEventListener("click", function () {
    count++;
    updateCounter();
});

minusButton.addEventListener("click", function () {
    count--;
    updateCounter();
});

resetButton.addEventListener("click", function () {
    count = 0;
    updateCounter();
});