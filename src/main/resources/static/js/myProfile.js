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

async function getTotalBalance(userId) {
    try {
        console.log(userId);
        const totalBalance = await Wallet.getWalletTotalBalance(userId);
        return totalBalance
    } catch (error) {
        console.error('❌ Error al obtener el usuario:', error);
        return null; // Devuelve un array vacío en caso de error
    }
}

document.addEventListener("DOMContentLoaded", async function () {
    let user = await getUser();
    console.log(user)

    document.getElementById("username").textContent = user.name;
    document.getElementById("displayName").textContent = user.name;
    document.getElementById("newDisplayName").placeholder = user.name;
    document.getElementById("newEmail").placeholder = user.email;
    document.getElementById("email").textContent = user.email;
    document.getElementById("remaining-tokens").textContent = user.token;

    // ================================
    // ANIMATION TOTAL BALANCE
    // ================================

    let balance = 0;
    console.log(user.userId);
    let totalBalance = await getTotalBalance(user.userId);
    const totalBalanceElement = document.getElementById('total-balance');
    function animateBalance() {
        let step = totalBalance / 100;
        let interval = setInterval(function () {
            if (balance < totalBalance) {
                balance += step;
                totalBalanceElement.textContent = formatNumber(balance.toFixed(2)) + "$";
            } else {
                clearInterval(interval);
            }
        }, 20);
    }

    setTimeout(animateBalance);
});

async function getTransactions(userId) {
    try {
        console.log(userId);
        const totalBalance = await Transaction.getTransactionsByUserId(userId);
        return totalBalance
    } catch (error) {
        console.error('❌ Error al obtener el usuario:', error);
        return null; // Devuelve un array vacío en caso de error
    }
}

async function getWallet(userId) {
    try {
        console.log(userId);
        const totalBalance = await Wallet.getWalletByUserId(userId);
        return totalBalance
    } catch (error) {
        console.error('❌ Error al obtener el usuario:', error);
        return null; // Devuelve un array vacío en caso de error
    }
}

async function updateUser(user) {
    try {
        const userId = await User.updateUser(user);
        return userId;
    } catch (error) {
        console.error('❌ Error al obtener el usuario:', error);
        return null; // Devuelve un array vacío en caso de error
    }
}

async function changeName(event){
    event.preventDefault();
    let user = await getUser();
    let newName = document.getElementById("newDisplayName").value;
    let newUser = new User(user.userId, newName, user.email, user.password, user.registrationDate, user.picture, user.token);
    console.log(newUser)
    let updatedUser = await updateUser(newUser);
    console.log(updatedUser)
    closeModal("editDisplayNameModal");
}

async function changeEmail(event){
    event.preventDefault();
    let user = await getUser();
    let newEmail = document.getElementById("newDisplayName").value;
    let newUser = new User(user.userId, user.name, newEmail, user.password, user.registrationDate, user.picture, user.token);
    let updatedEmail = await updateUser(newUser);
    console.log(updatedEmail)
    closeModal("editEmailModal");
}

async function changePassword(event){
    event.preventDefault();
    let user = await getUser();
    let newPassword = document.getElementById("newDisplayName").value;
    let newUser = new User(user.userId, user.name, user.email, newPassword, user.registrationDate, user.picture, user.token);
    let updatedPassword = await updateUser(newUser);
    console.log(updatedPassword)
    closeModal("editPasswordModal");
}

function closeModal(idModal){
    // Obtener el elemento del modal
    const editDisplayModalEl = document.getElementById(idModal);
// Crear o recuperar la instancia del modal
    const editDisplayModal = bootstrap.Modal.getInstance(editDisplayModalEl) || new bootstrap.Modal(editDisplayModalEl);
// Cerrar el modal
    editDisplayModal.hide();
    window.location.reload();
}
// Genera y añade una card para cada crypto
function formatNumber(num) {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num.toFixed(2);
}

async function buyTokens(event){
    event.preventDefault();
    let user = await getUser();
    let amountToken = parseFloat(document.getElementById("tokenAmount").value) + user.token;
    let newUser = new User(user.userId, user.name, user.email, user.password, user.registrationDate, user.picture, amountToken);
    let updatedEmail = await updateUser(newUser);
    console.log(updatedEmail)
    closeModal("editEmailModal");
}