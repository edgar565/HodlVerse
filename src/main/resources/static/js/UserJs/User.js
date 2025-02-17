class User {
    constructor(userId, name, email, password, registrationDate, picture, wallet, transactions, game) {
        // Validar cada propiedad antes de inicializar el objeto
        User.validateUserData({
            userId,
            name,
            email,
            password,
            registrationDate,
            picture,
            wallet,
            transactions,
            game
        });

        this.userId = Number(userId);
        this.name = name;
        this.email = email;
        this.password = password;
        this.registrationDate = new Date(registrationDate);
        this.picture = picture;
        this.wallet = wallet instanceof Wallet ? wallet : null;
        this.transactions = Array.isArray(transactions) ? transactions.map(t => new Transaction(t)) : [];
        this.game = game instanceof Game ? game : null;
    }

    // Validar los datos del usuario
    static validateUserData(userData) {
        if (!userData || typeof userData !== 'object') {
            throw new Error('Datos del usuario inválidos.');
        }

        if (typeof userData.name !== 'string' || userData.name.trim() === '') {
            console.log(userData.email);
            throw new Error('name debe ser una cadena no vacía.');
        }

        if (typeof userData.email !== 'string' || !User.isValidEmail(userData.email)) {
            throw new Error('email debe ser una dirección de correo electrónico válida.');
        }

        if (typeof userData.password !== 'string' || userData.password.trim() === '') {
            throw new Error('password debe ser una cadena no vacía.');
        }

        if (!(userData.registrationDate instanceof Date) || isNaN(userData.registrationDate.getTime())) {
            throw new Error('registrationDate debe ser una instancia válida de Date.');
        }

        if (typeof userData.picture !== 'string' || !User.isValidUrl(userData.picture)) {
            throw new Error('picture debe ser una URL válida.');
        }
    }

    static isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    static isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    static async getUserId() {
        try {
            const response = await $.ajax({ url: '/users', type: 'GET' });
            const userId = Number(response.id);
            return isNaN(userId) ? null : userId;
        } catch (error) {
            console.error('Error al obtener el ID del usuario:', error);
            return null;
        }
    }

    static async getUserById(userId) {
        if (isNaN(Number(userId))) {
            console.error('El ID del usuario debe ser un número válido.');
            return null;
        }
        try {
            return await $.ajax({ url: `/users/${userId}`, type: 'GET' });
        } catch (error) {
            console.error('Error al obtener el usuario:', error);
            return null;
        }
    }

    static async loadUsers(callback) {
        try {
            const data = await $.ajax({ url: '/users/all', type: 'GET' });
            User.users = data.map(u => {
                try {
                    User.validateUserData(u);
                    return new User(
                        u.userId, u.name, u.email, u.password,
                        new Date(u.registrationDate), u.picture,
                        new Wallet(u.wallet),
                        u.transactions.map(t => new Transaction(t)),
                        u.game ? new Game(u.game) : null
                    );
                } catch (error) {
                    console.warn('Usuario omitido por datos inválidos:', u, error.message);
                    return null;
                }
            }).filter(u => u !== null);
            if (callback) callback(User.users);
        } catch (error) {
            console.error('Error al obtener los usuarios:', error);
        }
    }


    // ➕ Crear un nuevo usuario en la API
    static createUser(name, email, password, registrationDate, picture, callback) {
        try {
            this.validateUserData({
                userId: null,
                name,
                email,
                password,
                registrationDate: new Date(registrationDate),
                picture,
                wallet: null,
                transactions: [],
                game: null
            });

            let newUser = { name, email, password, registrationDate: registrationDate.toISOString(), picture };
            $.ajax({
                url: '/users',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(newUser),
                success: (data) => {
                    let user = new User(
                        data.userId, data.name, data.email, data.password, new Date(data.registrationDate), data.picture,
                        data.wallet ? new Wallet(data.wallet) : null, data.transactions.map(t => new Transaction(t)), data.game ? new Game(data.game) : null
                    );
                    User.users.push(user);
                    console.log('Usuario creado y almacenado:', user);
                    if (callback) callback(user);
                },
                error: (error) => {
                    console.error('Error al crear el usuario:', error);
                }
            });
        } catch (error) {
            console.error('Datos inválidos para crear el usuario:', error.message);
        }
    }

    // 🔄 Actualizar un usuario en la API
    static updateUser(userId, name, email, password, registrationDate, picture, callback) {
        if (typeof userId !== 'number' || isNaN(userId)) {
            console.error('El ID del usuario debe ser un número válido.');
            return;
        }

        try {
            this.validateUserData({
                userId,
                name,
                email,
                password,
                registrationDate: new Date(registrationDate),
                picture,
                wallet: null,
                transactions: [],
                game: null
            });

            let updatedUser = { name, email, password, registrationDate: registrationDate.toISOString(), picture };
            $.ajax({
                url: `/users/${userId}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(updatedUser),
                success: (data) => {
                    let index = User.users.findIndex(u => u.userId === userId);
                    if (index !== -1) {
                        User.users[index] = new User(
                            data.userId, data.name, data.email, data.password, new Date(data.registrationDate), data.picture,
                            data.wallet ? new Wallet(data.wallet) : null, data.transactions.map(t => new Transaction(t)), data.game ? new Game(data.game) : null
                        );
                        console.log('Usuario actualizado:', User.users[index]);
                    }
                    if (callback) callback(data);
                },
                error: (error) => {
                    console.error('Error al actualizar el usuario:', error);
                }
            });
        } catch (error) {
            console.error('Datos inválidos para actualizar el usuario:', error.message);
        }
    }

    // ❌ Eliminar un usuario de la API
    static deleteUser(userId, callback) {
        if (typeof userId !== 'number' || isNaN(userId)) {
            console.error('El ID del usuario debe ser un número válido.');
            return;
        }

        $.ajax({
            url: `/users/${userId}`,
            type: 'DELETE',
            success: () => {
                User.users = User.users.filter(u => u.userId !== userId);
                console.log(`Usuario con ID ${userId} eliminado.`);
                if (callback) callback();
            },
            error: (error) => {
                console.error('Error al eliminar el usuario:', error);
            }
        });
    }
}
window.User = User;

// =============================
// 🔥 Cargar automáticamente todos los usuarios al iniciar
// =============================
$(document).ready(function () {
    User.loadUsers((users) => {
        console.log('Usuarios cargados en la aplicación:', users);
    });
});