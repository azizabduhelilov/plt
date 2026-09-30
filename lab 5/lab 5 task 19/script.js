const form = document.getElementById("registrationForm");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

const result = document.getElementById("result");

form.addEventListener("submit", function (event) {

    event.preventDefault();

    nameError.textContent = "";
    emailError.textContent = "";
    passwordError.textContent = "";
    result.textContent = "";

    let valid = true;

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (name === "") {
        nameError.textContent = "Введите имя";
        valid = false;
    }

    if (!email.includes("@")) {
        emailError.textContent = "Введите правильный email";
        valid = false;
    }

    if (password.length < 6) {
        passwordError.textContent = "Минимум 6 символов";
        valid = false;
    }

    if (valid) {
        result.textContent = "✓ Регистрация успешно выполнена!";
        form.reset();
    }
});