class User {
    constructor(userId, name, email, password, registrationDate, picture, wallet, transactions, game, token) {
        this.userId = Number(userId);
        this.name = name;
        this.email = email;
        this.password = password;
        this.registrationDate = new Date(registrationDate);
        this.picture = picture;
        this.wallet = wallet;
        this.transactions = transactions;
        this.game = game;
        this.token = token;
    }

    static validateData(userData) {
        if (!userData || typeof userData !== 'object') {
            throw new Error('Datos del usuario inválidos.');
        }

        if (typeof userData.name !== 'string' || userData.name.trim() === '') {
            throw new Error('name debe ser una cadena no vacía.');
        }

        if (typeof userData.email !== 'string' || !User.isValidEmail(userData.email)) {
            throw new Error('email debe ser una dirección de correo electrónico válida.');
        }

        if (!(userData.registrationDate instanceof Date) || isNaN(userData.registrationDate.getTime())) {
            throw new Error('registrationDate debe ser una instancia válida de Date.');
        }

        if (typeof userData.picture !== 'string' || !User.isValidUrl(userData.picture)) {
            throw new Error('picture debe ser una URL válida.');
        }

        if (!userData.wallet) {
            throw new Error('wallet debe ser una instancia válida de Wallet o null.');
        }

        // Validar token
        if (typeof userData.token !== 'string' || userData.token.trim() === '') {
            throw new Error('token debe ser una cadena no vacía.');
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

    // Lista donde se almacenan todos los usuarios
    static users = [];

    // 🔄 Cargar todos los usuarios desde la API (limpia la lista antes)
    static async loadUsers() {
        try {
            const response = await $.ajax({
                url: '/users/all',
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener el usuario:', error);
            return null;
        }
    }

    static async getUserById(userId) {
        if (isNaN(Number(userId))) {
            console.error('El ID del usuario debe ser un número válido.');
            return null;
        }
        try {
            const response = await $.ajax({
                url: `/users/${userId}`,
                type: 'GET'
            });
            return response; // Retorna el ID del usuario autenticado
        } catch (error) {
            console.error('Error al obtener el usuario:', error);
            return null;
        }
    }

    // 🔍 Obtener el ID del usuario autenticado desde la API
    static async getUserId() {
        try {
            const response = await $.ajax({
                url: '/users',
                type: 'GET'
            });
            if (typeof response.id !== 'number' || isNaN(response.id)) {
                throw new Error('El ID del usuario autenticado no es válido.');
            }
            return response.id; // Retorna el ID del usuario autenticado
        } catch (error) {
            console.error('Error al obtener el ID del usuario:', error);
            return null; // Retorna null en caso de error
        }
    }

    // ➕ Crear un nuevo usuario en la API
    static async createUser(name, email, password) {
        try {
            // Crear el objeto del nuevo usuario
            let newUser = {
                name,
                email,
                password,
                registrationDate: new Date().toISOString(),
                picture: " ",
                wallet: null,
                transactions: [],
                game: null,
                token: 2
            };

            // Realizar la solicitud AJAX usando $.ajax sin Promesa manual
            const data = await $.ajax({
                url: '/users',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(newUser)
            });

            console.log('Usuario creado:', data);
            return data; // Retornar la respuesta del servidor

        } catch (error) {
            console.error('Error al crear el usuario:', error.message);
            return null; // Retorna null en caso de error
        }
    }

    // 🔄 Actualizar un usuario en la API
    static async updateUser(user) {
        if (typeof user.userId !== 'number' || isNaN(user.userId)) {
            console.error('El ID del usuario debe ser un número válido.');
            return;
        }

        try {
            let updatedUser = { name: user.name,email: user.email, password: user.password, registrationDate: user.registrationDate.toISOString(), picture: user.picture, wallet: user.wallet, transactions: user.transactions, games: user.games, token: user.token};

            // Realizar la solicitud AJAX usando $.ajax sin Promesa manual
            const data = await $.ajax({
                url: `/users/${user.userId}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(updatedUser)
            });

            console.log('Usuario creado:', data);
            return data; // Retornar la respuesta del servidor

        } catch (error) {
            console.error('Error al crear el usuario:', error.message);
            return null; // Retorna null en caso de error
        }
    }

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