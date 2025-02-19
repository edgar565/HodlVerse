document.addEventListener("DOMContentLoaded", function () {
    const difficultyButtons = document.querySelectorAll(".btn-play-now");
    const difficultyInfo = document.getElementById("difficulty-info");
    const customOptions = document.getElementById("custom-options");
    const objective = document.getElementById("difficulty-objective");
    const customInput = document.getElementById("custom-objective");
    const startGameBtn = document.getElementById("start-game");

    difficultyButtons.forEach(button => {
        button.addEventListener("click", function () {
            // Elimina la clase 'active' de todos los botones
            difficultyButtons.forEach(btn => btn.classList.remove("active"));

            // Añade la clase 'active' al botón seleccionado
            this.classList.add("active");

            const mode = this.dataset.difficulty;

            difficultyInfo.classList.remove("d-none");
            difficultyInfo.classList.add("show");
            startGameBtn.classList.remove("d-none"); // Muestra el botón de iniciar partida

            if (mode === "custom") {
                customOptions.classList.remove("d-none");
                customInput.value = ""; // Vacía el input visualmente
                objective.textContent = "0"; // Establece el valor inicial en 0

                // Actualiza el objetivo cuando el usuario ingrese un valor
                customInput.addEventListener("input", function () {
                    objective.textContent = customInput.value || "0";
                });
            } else {
                customOptions.classList.add("d-none");

                if (mode === "beginner") {
                    objective.textContent = "10";
                } else if (mode === "experienced") {
                    objective.textContent = "30";
                }
            }
        });
    });
});
