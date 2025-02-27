class User {
    /**
     * Constructor de la clase User.
     * @param {number} userId - El identificador único del usuario.
     * @param {string} name - El nombre del usuario.
     * @param {string} email - El correo electrónico del usuario.
     * @param {string} password - La contraseña del usuario.
     * @param {Date} registrationDate - La fecha de registro del usuario.
     * @param {string} picture - La URL de la imagen del usuario.
     * @param {string} token - El token de autenticación del usuario.
     */
    constructor(userId, name, email, password, registrationDate, picture, token) {
        this.userId = Number(userId);
        this.name = name;
        this.email = email;
        this.password = password;
        this.registrationDate = new Date(registrationDate);
        this.picture = picture;
        this.token = token;
    }

    /**
     * Valida los datos del usuario.
     * @param {Object} userData - Los datos del usuario a validar.
     * @throws {Error} Si los datos no son válidos.
     */
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

        // Validar token
        if (typeof userData.token !== 'string' || userData.token.trim() === '') {
            throw new Error('token debe ser una cadena no vacía.');
        }
    }

    /**
     * Verifica si una dirección de correo electrónico es válida.
     * @param {string} email - La dirección de correo electrónico a validar.
     * @returns {boolean} True si la dirección de correo electrónico es válida, false en caso contrario.
     */
    static isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    /**
     * Verifica si una URL es válida.
     * @param {string} url - La URL a validar.
     * @returns {boolean} True si la URL es válida, false en caso contrario.
     */
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

    /**
     * Carga todos los usuarios desde la API.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con los datos de los usuarios o null en caso de error.
     */
    static async loadUsers() {
        try {
            const response = await $.ajax({
                url: '/users/all',
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener los usuarios:', error);
            return null;
        }
    }

    /**
     * Obtiene un usuario por su ID.
     * @param {number} userId - El identificador del usuario.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con los datos del usuario o null en caso de error.
     */
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
            return response; // Retorna los datos del usuario
        } catch (error) {
            console.error('Error al obtener el usuario:', error);
            return null;
        }
    }

    /**
     * Obtiene el ID del usuario autenticado desde la API.
     * @returns {Promise<number|null>} Una promesa que se resuelve con el ID del usuario autenticado o null en caso de error.
     */
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

    /**
     * Crea un nuevo usuario en la API.
     * @param {string} name - El nombre del nuevo usuario.
     * @param {string} email - El correo electrónico del nuevo usuario.
     * @param {string} password - La contraseña del nuevo usuario.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con los datos del nuevo usuario o null en caso de error.
     */
    static async createUser(name, email, password) {
        try {
            // Crear el objeto del nuevo usuario
            let newUser = {
                name,
                email,
                password,
                registrationDate: new Date().toISOString(),
                picture: " ",
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

    /**
     * Actualiza un usuario en la API.
     * @param {Object} user - Los datos del usuario a actualizar.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con los datos del usuario actualizado o null en caso de error.
     */
    static async updateUser(user) {
        if (typeof user.userId !== 'number' || isNaN(user.userId)) {
            console.error('El ID del usuario debe ser un número válido.');
            return;
        }

        try {
            let updatedUser = {
                name: user.name,
                email: user.email,
                password: user.password,
                registrationDate: user.registrationDate,
                picture: user.picture,
                token: user.token
            };

            // Realizar la solicitud AJAX usando $.ajax sin Promesa manual
            const data = await $.ajax({
                url: `/users/${user.userId}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(updatedUser)
            });

            console.log('Usuario actualizado:', data);
            return data; // Retornar la respuesta del servidor

        } catch (error) {
            console.error('Error al actualizar el usuario:', error.message);
            return null; // Retorna null en caso de error
        }
    }

    /**
     * Elimina un usuario de la API.
     * @param {number} userId - El identificador del usuario.
     * @param {Function} callback - Función a ejecutar después de eliminar el usuario.
     */
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
