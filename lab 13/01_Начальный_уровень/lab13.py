# Лабораторная работа №13 — начальный уровень
# Вариант 1: Список покупок (list)

def add_product(products, name):
    name = name.strip()
    if not name:
        return False
    if any(p.lower() == name.lower() for p in products):
        return False
    products.append(name)
    return True

def remove_product(products, name):
    for product in products:
        if product.lower() == name.lower():
            products.remove(product)
            return True
    return False

def show_products(products):
    return products.copy()

if __name__ == "__main__":
    shopping_list = []
    add_product(shopping_list, "Молоко")
    add_product(shopping_list, "Хлеб")
    print("Список:", show_products(shopping_list))
    print("Удаление молока:", remove_product(shopping_list, "Молоко"))
    print("Итог:", show_products(shopping_list))
    print("Удаление отсутствующего товара:", remove_product(shopping_list, "Сыр"))
