class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius

    # Перевод из Цельсия в Фаренгейт
    def to_fahrenheit(self):
        return self.celsius * 9 / 5 + 32

    # Перевод из Цельсия в Кельвины
    def to_kelvin(self):
        return self.celsius + 273.15

    # Изменение температуры
    def set_temperature(self, celsius):
        self.celsius = celsius

    # Получение текущей температуры
    def get_temperature(self):
        return self.celsius

    # Определение состояния температуры
    def get_status(self):
        if self.celsius < 0:
            return "Морозная температура"
        elif self.celsius == 0:
            return "Температура замерзания воды"
        elif self.celsius < 20:
            return "Прохладная температура"
        elif self.celsius <= 30:
            return "Комфортная температура"
        else:
            return "Жаркая температура"

    # Проверка температуры
    def is_below_zero(self):
        return self.celsius < 0

    # Абсолютное значение температуры
    def absolute_value(self):
        return abs(self.celsius)

    # Вывод полной информации
    def show_info(self):
        print("-----------------------------------")
        print(f"Температура: {self.celsius:.2f} °C")
        print(f"Фаренгейт: {self.to_fahrenheit():.2f} °F")
        print(f"Кельвин: {self.to_kelvin():.2f} K")
        print(f"Состояние: {self.get_status()}")
        print(f"Ниже нуля: {'Да' if self.is_below_zero() else 'Нет'}")
        print(f"Абсолютное значение: {self.absolute_value():.2f}")
        print("-----------------------------------")


# Создание объектов класса
temp1 = Temperature(25)
temp2 = Temperature(0)
temp3 = Temperature(-10)

# Вывод информации об объектах
print("ПЕРВЫЙ ОБЪЕКТ")
temp1.show_info()

print("\nВТОРОЙ ОБЪЕКТ")
temp2.show_info()

print("\nТРЕТИЙ ОБЪЕКТ")
temp3.show_info()


# Изменение состояния первого объекта
print("\nИЗМЕНЕНИЕ ПЕРВОГО ОБЪЕКТА")
print(f"Старая температура: {temp1.get_temperature()} °C")

temp1.set_temperature(35)

print(f"Новая температура: {temp1.get_temperature()} °C")
temp1.show_info()


# Дополнительная проверка
print("\nДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА")

test_temperature = Temperature(15)

print(f"Температура: {test_temperature.get_temperature()} °C")
print(f"Фаренгейт: {test_temperature.to_fahrenheit():.2f} °F")
print(f"Кельвин: {test_temperature.to_kelvin():.2f} K")
print(f"Статус: {test_temperature.get_status()}")

# Изменяем температуру
test_temperature.set_temperature(-5)

print("\nПосле изменения:")
test_temperature.show_info()
