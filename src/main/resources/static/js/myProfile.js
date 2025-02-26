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
                totalBalanceElement.textContent = balance.toFixed(2) + "$";
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
    let transactions = await getTransactions(user.userId);
    let newName = document.getElementById("newDisplayName").value;
    let newUser = new User(user.userId, newName, user.email, user.password, user.registrationDate, user.picture, user.wallet, transactions, );
    let updatedUser = await updateUser(newUser);
}

async function changeEmail(event){
    event.preventDefault();
    let user = await getUser();
    let transactions = await getTransactions(user.userId);
    let newEmail = document.getElementById("newDisplayName").value;
    let newUser = new User(user.userId, user.name, newEmail, user.password, user.registrationDate, user.picture, user.wallet, transactions);
    let updatedEmail = await updateUser(newUser);
}

async function changePassword(event){
    event.preventDefault();
    let user = await getUser();
    let transactions = await getTransactions(user.userId);
    let newPassword = document.getElementById("newDisplayName").value;
    let newUser = new User(user.userId, user.name, user.email, newPassword, user.registrationDate, user.picture, user.wallet, transactions);
    let updatedPassword = await updateUser(newUser);
}