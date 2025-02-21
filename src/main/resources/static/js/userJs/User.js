class User {
    constructor(userId, name, email, password, token, registrationDate, picture, wallet, transactions, game) {
        // Validar cada propiedad antes de inicializar el objeto
        this.validateUserData({
            userId,
            name,
            email,
            password,
            registrationDate,
            picture,
            wallet,
            transactions,
            game,
            token
        });

        this.userId = userId;
        this.name = name;
        this.email = email;
        this.password = password;
        this.registrationDate = registrationDate;
        this.picture = picture;
        this.wallet = wallet;
        this.transactions = transactions;
        this.game = game;
        this.token = token;
    }

    // Validar los datos del usuario
    static validateUserData(userData) {
        // Validar name
        if (typeof userData.name !== 'string' || userData.name.trim() === '') {
            throw new Error('name debe ser una cadena no vacía.');
        }

        // Validar email
        if (typeof userData.email !== 'string' || !this.isValidEmail(userData.email)) {
            throw new Error('email debe ser una dirección de correo electrónico válida.');
        }

        // Validar password
        if (typeof userData.password !== 'string' || userData.password.trim() === '') {
            throw new Error('password debe ser una cadena no vacía.');
        }

        // Validar registrationDate
        if (!(userData.registrationDate instanceof Date)) {
            throw new Error('registrationDate debe ser una instancia de Date.');
        }

        // Validar wallet
        if (!(userData.wallet instanceof Wallet)) {
            throw new Error('wallet debe ser una instancia de la clase Wallet.');
        }

        // Validar transactions
        if (!Array.isArray(userData.transactions) || !userData.transactions.every(t => t instanceof Transaction)) {
            throw new Error('transactions debe ser un array de instancias de la clase Transaction.');
        }

        // Validar game
        if (userData.game && !(userData.game instanceof Game)) {
            throw new Error('game debe ser una instancia de la clase Game o null.');
        }

        // Validar token
        if (typeof userData.token !== 'string' || userData.token.trim() === '') {
            throw new Error('token debe ser una cadena no vacía.');
        }
    }

    // Validar formato de correo electrónico
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validar formato de URL
    static isValidUrl(url) {
        try {
            new URL(url); // Intenta crear un objeto URL
            return true;
        } catch (e) {
            return false; // No es una URL válida
        }
    }

    // Lista donde se almacenan todos los usuarios
    static users = [];

    // 🔄 Cargar todos los usuarios desde la API (limpia la lista antes)
    static loadUsers(callback) {
        $.ajax({
            url: '/users/all',
            type: 'GET',
            success: (data) => {
                User.users.length = 0; // Vacía la lista antes de llenarla
                data.forEach(u => {
                    try {
                        User.validateUserData(u);
                        User.users.push(new User(
                            u.userId, u.name, u.email, u.password, new Date(u.registrationDate), u.picture,
                            new Wallet(u.wallet), u.transactions.map(t => new Transaction(t)), u.game ? new Game(u.game) : null
                        ));
                    } catch (error) {
                        console.warn(`Usuario omitido debido a datos inválidos:`, u, error.message);
                    }
                });
                console.log('Lista de usuarios recargada:', User.users);
                if (callback) callback(User.users);
            },
            error: (error) => {
                console.error('Error al obtener los usuarios:', error);
            }
        });
    }

    // 🔍 Obtener un usuario por su ID desde la API
    static async getUserById(userId) {
        if (typeof userId !== 'number' || isNaN(userId)) {
            console.error('El ID del usuario debe ser un número válido.');
            return;
        }
        try {
            const response = await $.ajax({
                url: `/users/${userId}`,
                type: 'GET'
            });
            return response; // Retorna el ID del usuario autenticado
        } catch (error) {
            console.error('Error al obtener el usuario:', error);
            return null; // Retorna null en caso de error
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
    static async createUser(name, email, password, registrationDate, picture) {
        try {
            // Validación de los datos del usuario
            this.validateUserData({
                userId: null,
                name,
                email,
                password,
                registrationDate: registrationDate,
                picture,
                wallet: null,
                transactions: [],
                game: null
            });

            // Crear el objeto del nuevo usuario
            let newUser = {
                name,
                email,
                password,
                registrationDate: registrationDate.toISOString(),
                picture,
                wallet: null,
                transactions: [],
                game: null
            };

            // Realizar la solicitud AJAX usando $.ajax
            const data = await $.ajax({
                    url: '/users',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(newUser),
                    success: (response) => resolve(response), // Resolvemos la promesa con la respuesta exitosa
                    error: (error) => reject(new Error('Error al crear el usuario: ' + error.statusText)) // Rechazamos la promesa en caso de error
            });

            // Crear el nuevo usuario con los datos obtenidos
            let user = new User(
                data.userId,
                data.name,
                data.email,
                data.password,
                new Date(data.registrationDate),
                data.picture,
                data.wallet ? new Wallet(data.wallet) : null,
                data.transactions.map(t => new Transaction(t)),
                data.game ? new Game(data.game) : null
            );

            // Almacenar el usuario en el array de usuarios
            User.users.push(user);
            console.log('Usuario creado y almacenado:', user);

        } catch (error) {
            console.error('Error al crear el usuario:', error.message);
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