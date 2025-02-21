class Balance {
    constructor(balanceId, walletAmount, wallet, currency) {
        // Validar los datos antes de inicializar el objeto
        Balance.validateBalanceData({ balanceId, walletAmount, wallet, currency });
        this.balanceId = balanceId;
        this.walletAmount = walletAmount;
        this.wallet = wallet;
        this.currency = currency;
    }

    static validateBalanceData(balanceData) {
        // Validar balanceId
        if (typeof balanceData.balanceId !== 'number' || isNaN(balanceData.balanceId)) {
            throw new Error('balanceId debe ser un número válido.');
        }

        // Validar walletAmount
        if (typeof balanceData.walletAmount !== 'number' || isNaN(balanceData.walletAmount)) {
            throw new Error('walletAmount debe ser un número válido.');
        }

        // Validar wallet
        if (!(balanceData.wallet instanceof Wallet)) {
            throw new Error('wallet debe ser una instancia de Wallet.');
        }

        // Validar currency
        if (!(balanceData.currency instanceof Currency)) {
            throw new Error('currency debe ser una instancia de Currency.');
        }
    }

    static balances = [];

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

    static createBalance(balanceData, callback) {
        try {
            // Validar los datos antes de enviar la solicitud
            this.validateBalanceData(balanceData);

            $.ajax({
                url: '/balances',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(balanceData),
                success: (data) => {
                    console.log('Balance creado:', data);
                    if (callback) callback(data);
                    Balance.loadBalances();
                },
                error: (error) => {
                    console.error('Error al crear el balance:', error);
                }
            });
        } catch (error) {
            console.error(error.message);
        }
    }

    static updateBalance(id, updatedData, callback) {
        try {
            // Validar el ID del balance
            if (typeof id !== 'number' || isNaN(id)) {
                throw new Error('El ID del balance debe ser un número válido.');
            }

            // Validar los datos actualizados
            this.validateBalanceData(updatedData);

            $.ajax({
                url: `/balances/${id}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(updatedData),
                success: (data) => {
                    console.log('Balance actualizado:', data);
                    if (callback) callback(data);
                    Balance.loadBalances();
                },
                error: (error) => {
                    console.error(`Error al actualizar el balance con ID ${id}:`, error);
                }
            });
        } catch (error) {
            console.error(error.message);
        }
    }

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

    static getBalancesByWallet(walletId, callback) {
        $.ajax({
            url: `/balances/wallet/${walletId}`,
            type: 'GET',
            success: (data) => {
                const balances = data.map(b => new Balance(
                    b.balanceId, b.walletAmount, new Wallet(b.wallet), new Currency(b.currency)
                ));
                console.log(`Balances para la billetera con ID ${walletId}:`, balances);
                if (callback) callback(balances);
            },
            error: (error) => {
                console.error(`Error al obtener balances para la billetera con ID ${walletId}:`, error);
            }
        });
    }

    static getBalancesByCurrency(currencyId, callback) {
        $.ajax({
            url: `/balances/currency/${currencyId}`,
            type: 'GET',
            success: (data) => {
                const balances = data.map(b => new Balance(
                    b.balanceId, b.walletAmount, new Wallet(b.wallet), new Currency(b.currency)
                ));
                console.log(`Balances para la divisa con ID ${currencyId}:`, balances);
                if (callback) callback(balances);
            },
            error: (error) => {
                console.error(`Error al obtener balances para la divisa con ID ${currencyId}:`, error);
            }
        });
    }
}