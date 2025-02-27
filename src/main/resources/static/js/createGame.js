// ================================
// SHOW GAME INFO CARD FUNCTION
// ================================
document.addEventListener("DOMContentLoaded", function () {
    const difficultyButtons = document.querySelectorAll(".btn-play-now");
    const difficultyInfo = document.getElementById("difficulty-info");
    const customOptions = document.getElementById("custom-options");
    const objective = document.getElementById("difficulty-objective");
    const customInput = document.getElementById("custom-objective");
    const startGameBtn = document.getElementById("start-game");
    const errorMessage = document.getElementById("error-message");
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
                errorMessage.textContent = ""; // Limpia cualquier mensaje de error previo

                // Actualiza el objetivo cuando el usuario ingrese un valor
                customInput.addEventListener("input", function () {
                    const value = parseFloat(customInput.value); // Convierte a número
                    if (isNaN(value) || value <= 0) {
                        errorMessage.textContent = "Please enter a valid value.";
                        objective.textContent = "0"; // Evita mostrar valores inválidos
                    } else {
                        errorMessage.textContent = ""; // Borra el mensaje de error si es válido
                        objective.textContent = customInput.value;
                    }
                });
            }
            else {
                customOptions.classList.add("d-none");

                if (mode === "beginner") {
                    objective.textContent = "10";
                } else if (mode === "experienced") {
                    objective.textContent = "30";
                }
            }
        });
    });
    const startGameButton = document.getElementById("start-game");

    startGameButton.addEventListener("click", async function () {
        const activeButton = document.querySelector(".btn-play-now.active");

        if (!activeButton) {
            console.log("No difficulty selected!");
            return;
        }

        console.log("Active button:", activeButton.outerHTML); // Para verificar si tiene la clase active
        const difficulty = activeButton.getAttribute("data-difficulty");
        console.log("Difficulty:", difficulty);
        const userLogged = await getUser();
        console.log("userLogged", userLogged);
        const game = new Game(difficulty.toUpperCase(), userLogged);
        await game.startGame();
    });

});
async function getUser() {
    try {
        const userId = await User.getUserId();
        user = await User.getUserById(userId);
        return user
    } catch (error) {
        console.error('❌ Error al obtener el usuario:', error);
        return null; // Devuelve un array vacío en caso de error
    }
}
