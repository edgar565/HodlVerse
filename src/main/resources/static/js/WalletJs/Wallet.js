class Wallet {
    constructor(walletId, walletName, creationDate, user, balances) {
        this.walletId = walletId;
        this.walletName = walletName;
        this.creationDate = creationDate;
        this.user = user;  // Should be an instance of User
        this.balances = balances;  // Should be an array of Balance objects
    }

     static validateData(walletData) {
        if (typeof walletData.walletName !== 'string' || walletData.walletName.trim() === '') {
            throw new Error('walletName debe ser una cadena no vacía.');
        }

        if (!(walletData.creationDate instanceof Date)) {
            throw new Error('creationDate debe ser una instancia de Date.');
        }

        if (!(walletData.user instanceof User)) {
            throw new Error('user debe ser una instancia de la clase User.');
        }

        if (!Array.isArray(walletData.balances) || !walletData.balances.every(b => b instanceof Balance)) {
            throw new Error('balances debe ser un array de instancias de la clase Balance.');
        }
    }

    static wallets = [];

    // Cargar todas las billeteras desde la API
    static loadWallets(callback) {
        $.ajax({
            url: '/wallets',
            type: 'GET',
            success: (data) => {
                Wallet.wallets.length = 0; // Limpiar la lista antes de llenarla
                data.forEach(w => {
                    try {
                        Wallet.validateData(w);
                        Wallet.wallets.push(new Wallet(
                            w.walletId, w.walletName, new Date(w.creationDate),
                            new User(w.user), w.balances.map(b => new Balance(b))
                        ));
                    } catch (error) {
                        console.warn(`Billetera omitida debido a datos inválidos:`, w, error.message);
                    }
                });
                console.log('Billeteras actualizadas:', Wallet.wallets);
                if (callback) callback(Wallet.wallets);
            },
            error: (error) => {
                console.error('Error al obtener billeteras:', error);
            }
        });
    }

    // Obtener una billetera por ID
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
                        data.walletId, data.walletName, new Date(data.creationDate),
                        new User(data.user), data.balances.map(b => new Balance(b))
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

    static async getWalletsCurrenciesById(id) {
        try {
            return await $.ajax({
                url: `/wallets/${id}/currencies`,
                type: 'GET'
            });
        } catch (error) {
            console.error('Error al obtener el usuario:', error);
            return null;
        }
    }

    // Crear una nueva billetera
    static createWallet(walletData, callback) {
        try {
            this.validateData({
                walletId: null,
                walletName: walletData.walletName,
                creationDate: new Date(),
                user: walletData.user,
                balances: []
            });
            $.ajax({
                url: '/wallets',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    walletName: walletData.walletName,
                    creationDate: new Date().toISOString(),
                    user: walletData.user
                }),
                success: (data) => {
                    console.log('Billetera creada:', data);
                    if (callback) callback(data);
                    Wallet.loadWallets(); // Recargar la lista de billeteras
                },
                error: (error) => {
                    console.error('Error al crear la billetera:', error);
                }
            });
        } catch (error) {
            console.error('Datos inválidos para crear la billetera:', error.message);
        }
    }

    // Actualizar una billetera existente
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
                user: updatedData.user,
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

    // Eliminar una billetera
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

    // Obtener el saldo total de una billetera de un usuario
    static getWalletTotalBalance(userId, callback) {
        if (typeof userId !== 'number' || isNaN(userId)) {
            console.error('El ID del usuario debe ser un número válido.');
            return;
        }
        $.ajax({
            url: `/wallets/totalBalance/${userId}`,
            type: 'GET',
            success: (data) => {
                console.log(`Saldo total para el usuario con ID ${userId}:`, data);
                if (callback) callback(data);
            },
            error: (error) => {
                console.error('Error al obtener el saldo total:', error);
            }
        });
    }

    // *** NUEVA FUNCIÓN PARA OBTENER EL BALANCE HISTÓRICO DE UN USUARIO EN UN DÍA ESPECÍFICO ***
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
            console.error('Error al obtener el usuario:', error);
            return null; // Retorna null en caso de error
        }
    }

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