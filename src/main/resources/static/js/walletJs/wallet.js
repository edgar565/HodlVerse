class Wallet {
    /**
     * Constructor de la clase Wallet.
     * @param {number} walletId - El identificador único de la billetera.
     * @param {string} walletName - El nombre de la billetera.
     * @param {Date} creationDate - La fecha de creación de la billetera.
     * @param {User} user - El usuario asociado a la billetera.
     */
    constructor(walletId, walletName, creationDate, user) {
        this.walletId = walletId;
        this.walletName = walletName;
        this.creationDate = creationDate;
        this.user = user;
    }

    /**
     * Valida los datos de la billetera.
     * @param {Object} walletData - Los datos de la billetera a validar.
     * @throws {Error} Si los datos no son válidos.
     */
    static validateData(walletData) {
        if (typeof walletData.walletName !== 'string' || walletData.walletName.trim() === '') {
            throw new Error('walletName debe ser una cadena no vacía.');
        }

        if (!(walletData.creationDate instanceof Date)) {
            throw new Error('creationDate debe ser una instancia de Date.');
        }

        if (!Array.isArray(walletData.balances) || !walletData.balances.every(b => b instanceof Balance)) {
            throw new Error('balances debe ser un array de instancias de la clase Balance.');
        }
    }

    // Lista donde se almacenan todas las billeteras
    static wallets = [];

    /**
     * Cargar todas las billeteras desde la API.
     * @param {Function} callback - Función a ejecutar después de cargar las billeteras.
     */
    static loadWallets(callback) {
        $.ajax({
            url: '/wallets',
            type: 'GET',
            success: (data) => {
                console.log("Respuesta del servidor:", data);

                if (!Array.isArray(data)) {
                    console.error("❌ La respuesta del servidor no es un array:", data);
                    return;
                }

                Wallet.wallets.length = 0; // Limpiar la lista antes de llenarla
                data.forEach(w => {
                    try {
                        Wallet.validateData(w);
                        Wallet.wallets.push(new Wallet(
                            w.walletId, w.walletName, new Date(w.creationDate), w.user
                        ));
                    } catch (error) {
                        console.warn(`⚠️ Billetera omitida por datos inválidos:`, w, error.message);
                    }
                });

                console.log('✅ Billeteras actualizadas:', Wallet.wallets);
                if (callback) callback(Wallet.wallets);
            },
            error: (error) => {
                console.error('❌ Error al obtener billeteras:', error);
            }
        });
    }

    /**
     * Obtener una billetera por su ID.
     * @param {number} id - El identificador de la billetera.
     * @param {Function} callback - Función a ejecutar después de obtener la billetera.
     */
    static getWalletById(id, callback) {
        if (typeof id !== 'number' || isNaN(id)) {
            console.error('El ID de la billetera debe ser un número válido.');
            return;
        }
        $.ajax({
            url: `/wallets/${id}`,
            type: 'GET',
            success: (data) => {
                try {
                    Wallet.validateData(data);
                    if (callback) callback(new Wallet(
                        data.walletId, data.walletName, new Date(data.creationDate), data.user
                    ));
                } catch (error) {
                    console.error(`Error al validar la billetera con ID ${id}:`, error.message);
                }
            },
            error: (error) => {
                console.error(`Error al obtener la billetera con ID ${id}:`, error);
            }
        });
    }

    /**
     * Obtener las monedas de una billetera por su ID.
     * @param {number} id - El identificador de la billetera.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con las monedas de la billetera o null en caso de error.
     */
    static async getWalletsCurrenciesById(id) {
        try {
            return await $.ajax({
                url: `/wallets/${id}/currencies`,
                type: 'GET'
            });
        } catch (error) {
            console.error('Error al obtener las monedas de la billetera:', error);
            return null;
        }
    }

    /**
     * Crear una nueva billetera.
     * @param {User} user - El usuario asociado a la nueva billetera.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con los datos de la nueva billetera o null en caso de error.
     */
    static async createWallet(user) {
        console.log("userId", user);
        try {
            // Crear el objeto de la nueva billetera
            let wallet = {
                walletId: null,
                walletName: "Mi billetera",
                creationDate: new Date().toISOString(),
                user: user
            };

            // Realizar la solicitud AJAX usando $.ajax sin Promesa manual
            const data = await $.ajax({
                url: '/wallets',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(wallet)
            });

            console.log("Billetera creada con éxito:", data);
            return data; // Retornar la respuesta del servidor
        } catch (error) {
            console.error('Error al crear la billetera:', error.message);
            return null; // Retorna null en caso de error
        }
    }

    /**
     * Actualizar una billetera existente.
     * @param {number} id - El identificador de la billetera.
     * @param {Object} updatedData - Los datos actualizados de la billetera.
     * @param {Function} callback - Función a ejecutar después de actualizar la billetera.
     */
    static updateWallet(id, updatedData, callback) {
        if (typeof id !== 'number' || isNaN(id)) {
            console.error('El ID de la billetera debe ser un número válido.');
            return;
        }
        try {
            this.validateData({
                walletId: id,
                walletName: updatedData.walletName,
                creationDate: new Date(updatedData.creationDate),
                balances: updatedData.balances || []
            });
            $.ajax({
                url: `/wallets/${id}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(updatedData),
                success: (data) => {
                    console.log('Billetera actualizada:', data);
                    if (callback) callback(data);
                    Wallet.loadWallets(); // Recargar la lista de billeteras
                },
                error: (error) => {
                    console.error(`Error al actualizar la billetera con ID ${id}:`, error);
                }
            });
        } catch (error) {
            console.error('Datos inválidos para actualizar la billetera:', error.message);
        }
    }

    /**
     * Eliminar una billetera.
     * @param {number} id - El identificador de la billetera.
     * @param {Function} callback - Función a ejecutar después de eliminar la billetera.
     */
    static deleteWallet(id, callback) {
        if (typeof id !== 'number' || isNaN(id)) {
            console.error('El ID de la billetera debe ser un número válido.');
            return;
        }
        $.ajax({
            url: `/wallets/${id}`,
            type: 'DELETE',
            success: () => {
                console.log(`Billetera con ID ${id} eliminada.`);
                if (callback) callback();
                Wallet.loadWallets(); // Recargar la lista de billeteras
            },
            error: (error) => {
                console.error(`Error al eliminar la billetera con ID ${id}:`, error);
            }
        });
    }

    /**
     * Obtener el saldo total de una billetera de un usuario.
     * @param {number} userId - El identificador del usuario.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con el saldo total de la billetera o null en caso de error.
     */
    static async getWalletTotalBalance(userId) {
        if (typeof userId !== 'number' || isNaN(userId)) {
            console.error('El ID del usuario debe ser un número válido.');
            return;
        }
        try {
            return await $.ajax({
                url: `/wallets/totalBalance/${userId}`,
                type: 'GET'
            });
        } catch (error) {
            console.error('Error al obtener el saldo total de la billetera:', error);
            return null; // Retorna null en caso de error
        }
    }

    /**
     * Obtener el balance histórico de un usuario en una fecha específica.
     * @param {number} userId - El identificador del usuario.
     * @param {Date} date - La fecha específica.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con el balance histórico o null en caso de error.
     */
    static async getUserBalanceOnSpecificDate(userId, date) {
        if (typeof userId !== 'number' || isNaN(userId)) {
            console.error('El ID del usuario debe ser un número válido.');
            return;
        }

        if (!(date instanceof Date)) {
            console.error('La fecha debe ser una instancia de Date.');
            return;
        }
        try {
            return await $.ajax({
                url: `/wallets/user/${userId}/balance/on/${date.toISOString().split('T')[0]}`, // Formatear la fecha como YYYY-MM-DD
                type: 'GET'
            });
        } catch (error) {
            console.error('Error al obtener el balance histórico:', error);
            return null; // Retorna null en caso de error
        }
    }

    /**
     * Obtener la billetera de un usuario por su ID.
     * @param {number} userId - El identificador del usuario.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con la billetera del usuario o null en caso de error.
     */
    static async getWalletByUserId(userId) {
        try {
            return await $.ajax({
                url: `/wallets/user/${userId}`,
                type: 'GET'
            });
        } catch (error) {
            console.error(`❌ Error al obtener la billetera del usuario con ID ${userId}:`, error);
            return null;
        }
    }
}

window.Wallet = Wallet;
