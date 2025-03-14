class Balance {
    /**
     * Constructor de la clase Balance.
     * @param {number} balanceId - El identificador único del balance.
     * @param {number} walletAmount - La cantidad en la billetera.
     * @param {Wallet} wallet - La billetera asociada al balance.
     * @param {Currency} currency - La divisa del balance.
     */
    constructor(balanceId, walletAmount, wallet, currency) {
        this.balanceId = balanceId || null;
        this.walletAmount = walletAmount;
        this.wallet = wallet;
        this.currency = currency;
    }

    /**
     * Valida los datos del balance.
     * @param {Object} balanceData - Los datos del balance a validar.
     * @throws {Error} Si los datos no son válidos.
     */
    static validateBalanceData(balanceData) {
        // Validar que walletAmount sea un número válido
        if (typeof balanceData.walletAmount !== 'number' || isNaN(balanceData.walletAmount)) {
            throw new Error('walletAmount debe ser un número válido.');
        }

        // Validar que wallet sea una instancia de Wallet
        if (!(balanceData.wallet instanceof Wallet)) {
            throw new Error('wallet debe ser una instancia de Wallet.');
        }

        // Validar que currency sea una instancia de Currency
        if (!(balanceData.currency instanceof Currency)) {
            throw new Error('currency debe ser una instancia de Currency.');
        }
    }

    /**
     * Almacena los balances cargados.
     * @type {Balance[]}
     */
    static balances = [];

    /**
     * Carga los balances desde el servidor.
     * @param {Function} callback - Función a ejecutar después de cargar los balances.
     */
    static loadBalances(callback) {
        $.ajax({
            url: '/balances',
            type: 'GET',
            success: (data) => {
                // Mapear los datos recibidos a instancias de Balance
                Balance.balances = data.map(b => new Balance(
                    b.balanceId, b.walletAmount, new Wallet(b.wallet), new Currency(b.currency)
                ));
                console.log('Balances actualizados:', Balance.balances);
                if (callback) callback(Balance.balances);
            },
            error: (error) => {
                console.error('Error al obtener balances:', error);
            }
        });
    }

    /**
     * Obtiene un balance por su ID.
     * @param {number} id - El identificador del balance.
     * @param {Function} callback - Función a ejecutar después de obtener el balance.
     */
    static getBalanceById(id, callback) {
        $.ajax({
            url: `/balances/${id}`,
            type: 'GET',
            success: (data) => {
                if (callback) callback(new Balance(
                    data.balanceId, data.walletAmount, new Wallet(data.wallet), new Currency(data.currency)
                ));
            },
            error: (error) => {
                console.error(`Error al obtener el balance con ID ${id}:`, error);
            }
        });
    }

    /**
     * Crea un nuevo balance.
     * @param {Object} balanceData - Los datos del nuevo balance.
     * @param {Function} callback - Función a ejecutar después de crear el balance.
     */
     static async createBalance(balanceData, callback) {
        try {
            console.log("📤 Enviando solicitud POST con datos:", balanceData);

            // Enviar solo los IDs de wallet y currency
            const requestBody = {
                walletAmount: balanceData.walletAmount,
                wallet: { walletId: balanceData.wallet.walletId || balanceData.wallet }, // Solo el ID
                currency: { currencyId: balanceData.currency.currencyId || balanceData.currency } // Solo el ID
            };

            await $.ajax({
                url: '/balances',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(requestBody),
                success: (data) => {
                    console.log("✅ Balance creado correctamente:", data);
                    if (callback) callback(data);
                    Balance.loadBalances();
                },
                error: (xhr) => {
                    // Imprime la respuesta completa del servidor
                    console.error("❌ Error al crear el balance:", xhr);
                    console.error("📩 Respuesta del servidor:", xhr.responseText);
                }
            });
        } catch (error) {
            console.error("❌ Error en createBalance:", error.message);
        }
    }

    /**
     * Actualiza un balance existente.
     * @param {number} balanceId - El identificador del balance a actualizar.
     * @param {Object} updatedBalance - Los datos actualizados del balance.
     * @param {Function} callback - Función a ejecutar después de actualizar el balance.
     */
    static async updateBalance(balanceId, updatedBalance, callback) {
        console.log("🔄 Intentando actualizar balance...", balanceId, updatedBalance);

        // Validación previa para evitar datos incorrectos
        if (!updatedBalance || !updatedBalance.wallet || !updatedBalance.currency) {
            console.error("❌ Error: updatedBalance tiene datos incorrectos.", updatedBalance);
            return;
        }

        const requestBody = {
            balanceId: updatedBalance.balanceId,
            walletAmount: updatedBalance.walletAmount,
            wallet: { walletId: updatedBalance.wallet.walletId || updatedBalance.wallet }, // Solo el ID
            currency: { currencyId: updatedBalance.currency.currencyId || updatedBalance.currency } // Solo el ID
        };

        console.log("📤 Enviando solicitud PUT con datos:", JSON.stringify(requestBody, null, 2));

        try {
            let response = await $.ajax({
                url: `http://localhost:8080/balances/${balanceId}`,
                type: "PUT",
                contentType: "application/json",
                data: JSON.stringify(requestBody)
            });

            console.log("✅ Balance actualizado correctamente:", response);
            if (callback) callback(response);
        } catch (xhr) {
            console.error(`❌ Error al actualizar el balance con ID ${balanceId}:`, xhr);
            console.error("❌ Respuesta del servidor:", xhr.responseText);
        }
    }

    /**
     * Elimina un balance por su ID.
     * @param {number} id - El identificador del balance a eliminar.
     * @param {Function} callback - Función a ejecutar después de eliminar el balance.
     */
    static deleteBalance(id, callback) {
        $.ajax({
            url: `/balances/${id}`,
            type: 'DELETE',
            success: () => {
                console.log(`Balance con ID ${id} eliminado.`);
                if (callback) callback();
                Balance.loadBalances();
            },
            error: (error) => {
                console.error(`Error al eliminar el balance con ID ${id}:`, error);
            }
        });
    }

    /**
     * Obtiene los balances asociados a una billetera.
     * @param {number} walletId - El identificador de la billetera.
     * @returns {Promise<Balance[]>} Una promesa que se resuelve con los balances asociados.
     */
    static async getBalancesByWallet(walletId) {
        try {
            const data = await $.ajax({
                url: `/balances/wallet/${walletId}`,
                type: 'GET'
            });

            // Usamos Promise.all para obtener los objetos completos de wallet y currency
            const balances = await Promise.all(data.map(async (b) => {
                const wallet = typeof b.wallet === "object" && b.wallet.walletId ? b.wallet : await Wallet.getWalletById(b.walletId);
                const currency = typeof b.currency === "object" && b.currency.currencyId ? b.currency : await Currency.getCurrencyById(b.currencyId);

                return new Balance(
                    b.balanceId,
                    b.walletAmount,
                    wallet,
                    currency
                );
            }));

            console.log(`Balances para la billetera con ID ${walletId}:`, balances);
            return balances;
        } catch (error) {
            console.error(`Error al obtener balances para la billetera con ID ${walletId}:`, error);
            throw error;
        }
    }

    /**
     * Obtiene los balances asociados a una divisa.
     * @param {number} currencyId - El identificador de la divisa.
     * @returns {Promise<Balance[]>} Una promesa que se resuelve con los balances asociados.
     */
    static getBalancesByCurrency(currencyId) {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: `/balances/currency/${currencyId}`,
                type: 'GET',
                success: (data) => {
                    const balances = data.map(b => new Balance(
                        b.balanceId, b.walletAmount, new Wallet(b.wallet), new Currency(b.currency)
                    ));
                    console.log(`✅ Balances para la divisa con ID ${currencyId}:`, balances);
                    resolve(balances);
                },
                error: (error) => {
                    console.error(`❌ Error al obtener balances para la divisa con ID ${currencyId}:`, error);
                    reject(error);
                }
            });
        });
    }
}