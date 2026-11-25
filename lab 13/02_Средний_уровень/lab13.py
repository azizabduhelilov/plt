# Лабораторная работа №13 — средний уровень
# Вариант 8: Система заказов (collections.deque)
from collections import deque

class OrderSystem:
    def __init__(self):
        self.orders = deque()
        self.processed = []

    def add_order(self, number, customer, details):
        if any(o["number"] == number for o in self.orders) or any(o["number"] == number for o in self.processed):
            return False
        self.orders.append({"number": number, "customer": customer, "details": details})
        return True

    def process_first(self):
        if not self.orders:
            return None
        order = self.orders.popleft()
        self.processed.append(order)
        return order

    def find_order(self, number):
        for order in list(self.orders) + self.processed:
            if order["number"] == number:
                return order
        return None

    def report(self):
        return {"waiting": len(self.orders), "processed": len(self.processed),
                "remaining": list(self.orders)}

if __name__ == "__main__":
    system = OrderSystem()
    system.add_order("ORD-1001", "Алия", "Кофе")
    system.add_order("ORD-1002", "Дамир", "Чай")
    print("Поиск:", system.find_order("ORD-1002"))
    print("Обработан:", system.process_first())
    print("Отчёт:", system.report())
