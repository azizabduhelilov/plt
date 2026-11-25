# Лабораторная работа №13 — продвинутый уровень
# Вариант 16: Планировщик задач с двумя очередями
from collections import deque

class TaskScheduler:
    def __init__(self):
        self.urgent = deque()
        self.normal = deque()
        self.completed = []

    def add_task(self, title, priority="normal"):
        if not title.strip():
            return False
        task = {"title": title.strip(), "priority": priority}
        (self.urgent if priority == "urgent" else self.normal).append(task)
        return True

    def process_next(self):
        if self.urgent:
            task = self.urgent.popleft()
        elif self.normal:
            task = self.normal.popleft()
        else:
            return None
        self.completed.append(task)
        return task

    def status(self):
        return {"urgent": list(self.urgent), "normal": list(self.normal),
                "completed": list(self.completed)}

if __name__ == "__main__":
    scheduler = TaskScheduler()
    scheduler.add_task("Подготовить отчёт", "normal")
    scheduler.add_task("Исправить критическую ошибку", "urgent")
    scheduler.add_task("Ответить на письма", "normal")
    print("Первая задача:", scheduler.process_next())
    print("Состояние:", scheduler.status())
