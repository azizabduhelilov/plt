const nameInput = document.getElementById("name");
const groupInput = document.getElementById("group");
const courseInput = document.getElementById("course");

const createButton = document.getElementById("createButton");
const card = document.getElementById("card");

function createStudentCard(name, group, course) {
    card.innerHTML = `
        <div class="student-card">
            <h2>Студент</h2>
            <p><strong>Имя:</strong> ${name}</p>
            <p><strong>Группа:</strong> ${group}</p>
            <p><strong>Курс:</strong> ${course}</p>
        </div>
    `;
}

createButton.addEventListener("click", function () {

    const name = nameInput.value.trim();
    const group = groupInput.value.trim();
    const course = courseInput.value.trim();

    if (name === "" || group === "" || course === "") {
        card.innerHTML = `
            <p class="error">Пожалуйста, заполните все поля.</p>
        `;
        return;
    }

    createStudentCard(name, group, course);
});