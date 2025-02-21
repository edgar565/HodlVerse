document.addEventListener("DOMContentLoaded", function () {






});


document.getElementById("logout-btn").addEventListener("click", function () {
    fetch("/logout", {
        method: "POST",
        headers: {
            "X-CSRF-TOKEN": getCsrfToken() // Agregar el token CSRF
        },
        credentials: "same-origin"
    }).then(response => {
        if (response.ok) {
            window.location.href = "/index.html";
        } else {
            alert("Error al cerrar sesión");
        }
    }).catch(error => console.error("Error:", error));
});

// Función para obtener el token CSRF del HTML (Spring Security lo genera automáticamente)
function getCsrfToken() {
    let csrfMeta = document.querySelector('meta[name="_csrf"]');
    return csrfMeta ? csrfMeta.content : "";
}







let balance = 0;
let totalBalance = 1200; // Valor del balance
const totalBalanceElement = document.getElementById('total-balance');
const progressBar = document.getElementById('balance-progress');

// Función para animar el número
function animateBalance() {
    let step = totalBalance / 100;
    let interval = setInterval(function () {
        if (balance < totalBalance) {
            balance += step;
            totalBalanceElement.textContent = `$${balance.toFixed(2)}`;
        } else {
            clearInterval(interval);
        }
    }, 20); // Tiempo de intervalo
}

// Iniciar animación después de un pequeño retraso
setTimeout(animateBalance);
