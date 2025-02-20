// ================================
// ANIMATION TOTAL BALANCE
// ================================
let balance = 0;
let totalBalance = 1200; // Valance value
const totalBalanceElement = document.getElementById('total-balance');
function animateBalance() {
    let step = totalBalance / 100;
    let interval = setInterval(function () {
        if (balance < totalBalance) {
            balance += step;
            totalBalanceElement.textContent = `$${balance.toFixed(2)}`;
        } else {
            clearInterval(interval);
        }
    }, 20);
}
setTimeout(animateBalance);