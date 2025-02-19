document.addEventListener("DOMContentLoaded", function () {
    const difficultyButtons = document.querySelectorAll(".btn-play-now");
    const difficultyInfo = document.getElementById("difficulty-info");
    const customOptions = document.getElementById("custom-options");

    const objective = document.getElementById("difficulty-objective");

    difficultyButtons.forEach(button => {
        button.addEventListener("click", function () {
            const mode = this.dataset.difficulty;

            if (mode === "custom") {
                difficultyInfo.classList.add("d-none");
                customOptions.classList.remove("d-none");
            } else {
                customOptions.classList.add("d-none");
                difficultyInfo.classList.remove("d-none");

                if (mode === "beginner") {
                    objective.textContent = "10%";
                } else if (mode === "experienced") {
                    objective.textContent = "30%";
                }
            }
        });
    });
});