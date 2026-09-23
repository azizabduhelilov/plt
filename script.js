const form = document.getElementById("orderForm");

form.addEventListener("submit", function(event) {

    // Запрещаем перезагрузку страницы
    event.preventDefault();

    // Получаем значения полей
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();

    const product = document.getElementById("product").value;
    const quantity = Number(document.getElementById("quantity").value);

    const city = document.getElementById("city").value;

    const delivery = document.querySelector(
        'input[name="delivery"]:checked'
    );

    const payment = document.querySelector(
        'input[name="payment"]:checked'
    );

    const gift = document.getElementById("gift").checked;
    const insurance = document.getElementById("insurance").checked;
    const agreement = document.getElementById("agreement").checked;

    let valid = true;

    // Очистка старых сообщений
    document.querySelectorAll(".error").forEach(function(error) {
        error.textContent = "";
    });

    document.getElementById("result").innerHTML = "";
    document.getElementById("result").className = "";


    // Проверка ФИО
    if (name === "") {
        document.getElementById("nameError").textContent =
            "Введите ФИО";
        valid = false;
    }


    // Проверка E-mail
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email === "") {
        document.getElementById("emailError").textContent =
            "Введите e-mail";
        valid = false;
    } else if (!emailPattern.test(email)) {
        document.getElementById("emailError").textContent =
            "Введите корректный e-mail";
        valid = false;
    }


    // Проверка телефона
    if (phone === "") {
        document.getElementById("phoneError").textContent =
            "Введите номер телефона";
        valid = false;
    } else if (phone.length < 10) {
        document.getElementById("phoneError").textContent =
            "Номер телефона слишком короткий";
        valid = false;
    }


    // Проверка товара
    if (product === "") {
        document.getElementById("productError").textContent =
            "Выберите товар";
        valid = false;
    }


    // Проверка количества
    if (quantity <= 0 || isNaN(quantity)) {
        document.getElementById("quantityError").textContent =
            "Количество должно быть больше 0";
        valid = false;
    }


    // Проверка города
    if (city === "") {
        document.getElementById("cityError").textContent =
            "Выберите город";
        valid = false;
    }


    // Проверка доставки
    if (!delivery) {
        document.getElementById("deliveryError").textContent =
            "Выберите способ доставки";
        valid = false;
    }


    // Проверка оплаты
    if (!payment) {
        document.getElementById("paymentError").textContent =
            "Выберите способ оплаты";
        valid = false;
    }


    // Проверка согласия
    if (!agreement) {
        document.getElementById("agreementError").textContent =
            "Необходимо согласиться с условиями заказа";
        valid = false;
    }


    // Если есть ошибки — прекращаем выполнение
    if (!valid) {
        return;
    }


    // Расчёт стоимости
    let total = Number(product) * quantity;

    // Стоимость доставки
    if (delivery.value === "2000") {
        total += 2000;
    }

    // Дополнительные услуги
    if (gift) {
        total += 1000;
    }

    if (insurance) {
        total += 2000;
    }


    // Название выбранного товара
    const productName =
        document.getElementById("product").selectedOptions[0].text;


    // Вывод результата
    document.getElementById("result").className = "success";

    document.getElementById("result").innerHTML = `
        <h3>Заказ успешно оформлен!</h3>
        <p><strong>ФИО:</strong> ${name}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Телефон:</strong> ${phone}</p>
        <p><strong>Товар:</strong> ${productName}</p>
        <p><strong>Количество:</strong> ${quantity}</p>
        <p><strong>Город:</strong> ${city}</p>
        <p><strong>Итоговая стоимость:</strong> ${total.toLocaleString()} ₸</p>
    `;

});