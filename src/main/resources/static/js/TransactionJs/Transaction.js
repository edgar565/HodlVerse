class Transaction {
    constructor(id, transactionType, originTransactionAmount, destinationTransactionAmount, originUnitPrice, destinationUnitPrice, transactionDate, user, originCurrency, destinationCurrency) {
        this.id = id || null;
        this.transactionType = transactionType;
        this.originTransactionAmount = originTransactionAmount;
        this.destinationTransactionAmount = destinationTransactionAmount;
        this.originUnitPrice = originUnitPrice;
        this.destinationUnitPrice = destinationUnitPrice;
        this.transactionDate = transactionDate;
        this.user = user;
        this.originCurrency = originCurrency;
        this.destinationCurrency = destinationCurrency;
    }

    static validateData(transactionData) {
        if (!transactionData.user || !(transactionData.user instanceof User)) {
            throw new Error('El campo user debe ser una instancia válida de la clase User.');
        }
    }

    static async createTransaction(transactionData) {
        try {
            if (!transactionData.user || !transactionData.user.id) {
                throw new Error('Usuario no especificado para la transacción.');
            }
            this.validateData(transactionData);

            const balances = await Balance.getBalancesByWallet(transactionData.user.wallet.id);
            const originBalance = balances.find(b => b.currency.id === transactionData.originCurrency.id);

            if (!originBalance || originBalance.walletAmount < transactionData.originTransactionAmount) {
                throw new Error('Fondos insuficientes para la transacción.');
            }

            transactionData.user = { id: transactionData.user.id }; // Asegurar que solo se envíe el ID

            const data = await $.ajax({
                url: '/transactions',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(transactionData)
            });

            console.log('Transacción creada:', data);
            Transaction.loadTransactions();
            return data;
        } catch (error) {
            console.error('Error al crear la transacción:', error);
        }
    }

    static updateTransaction(id, updatedData, callback) {
        if (!updatedData.user || !updatedData.user.id) {
            console.error('Usuario no especificado para la actualización de la transacción.');
            return;
        }

        updatedData.user = { id: updatedData.user.id }; // Asegurar que solo se envíe el ID

        try {
            this.validateData(updatedData);
            $.ajax({
                url: `/transactions/${id}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(updatedData),
                success: (data) => {
                    console.log('Transacción actualizada:', data);
                    if (callback) callback(data);
                    Transaction.loadTransactions();
                },
                error: (error) => {
                    console.error(`Error al actualizar la transacción con ID ${id}:`, error);
                }
            });
        } catch (error) {
            console.error('Datos inválidos para actualizar la transacción:', error.message);
        }
    }

    static transactions = [];

    // Cargar todas las transacciones desde la API
    static loadTransactions(callback) {
        $.ajax({
            url: '/transactions',
            type: 'GET',
            success: (data) => {
                Transaction.transactions.length = 0; // Limpiar lista antes de llenarla
                data.forEach(t => {
                    try {
                        Transaction.validateData(t);
                        Transaction.transactions.push(new Transaction(
                            t.id, t.transactionType, t.originTransactionAmount, t.destinationTransactionAmount,
                            t.originUnitPrice, t.destinationUnitPrice, new Date(t.transactionDate),
                            new User(t.user), new Currency(t.originCurrency), new Currency(t.destinationCurrency)
                        ));
                    } catch (error) {
                        console.warn(`Transacción omitida debido a datos inválidos:`, t, error.message);
                    }
                });
                console.log('Transacciones actualizadas:', Transaction.transactions);
                if (callback) callback(Transaction.transactions);
            },
            error: (error) => {
                console.error('Error al obtener transacciones:', error);
            }
        });
    }

    // Obtener una transacción por ID
    static getTransactionById(id, callback) {
        if (typeof id !== 'number' || isNaN(id)) {
            console.error('El ID de la transacción debe ser un número válido.');
            return;
        }

        $.ajax({
            url: `/transactions/${id}`,
            type: 'GET',
            success: (data) => {
                try {
                    Transaction.validateData(data);
                    if (callback) callback(new Transaction(
                        data.id, data.transactionType, data.originTransactionAmount, data.destinationTransactionAmount,
                        data.originUnitPrice, data.destinationUnitPrice, new Date(data.transactionDate),
                        new User(data.user), new Currency(data.originCurrency), new Currency(data.destinationCurrency)
                    ));
                } catch (error) {
                    console.error(`Error al validar la transacción con ID ${id}:`, error.message);
                }
            },
            error: (error) => {
                console.error(`Error al obtener la transacción con ID ${id}:`, error);
            }
        });
    }

    // Eliminar una transacción
    static async deleteTransaction(id) {
        try {
            const transaction = await this.getTransactionById(id);
            if (!transaction) {
                throw new Error('Transacción no encontrada.');
            }

            const balances = await Balance.getBalancesByWallet(transaction.user.wallet.id);

            const originBalance = balances.find(b => b.currency.id === transaction.originCurrency.id);
            if (originBalance) {
                originBalance.walletAmount += transaction.originTransactionAmount;
            }

            const destinationBalance = balances.find(b => b.currency.id === transaction.destinationCurrency.id);
            if (destinationBalance) {
                destinationBalance.walletAmount -= transaction.destinationTransactionAmount;
            }

            await $.ajax({
                url: `/transactions/${id}`,
                type: 'DELETE'
            });

            console.log(`Transacción con ID ${id} eliminada.`);
            Transaction.loadTransactions();
        } catch (error) {
            console.error(`Error al eliminar la transacción con ID ${id}:`, error);
        }
    }

    // Obtener las transacciones de un usuario por su ID
    static async getTransactionsByUserId(userId) {
        try {
            const response = await $.ajax({
                url: `/transactions/all/${userId}`,
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener el ID del usuario:', error);
            return null;
        }
    }

    // Obtener las últimas 3 transacciones de un usuario por su ID
    static async getLatestTransactionsByUserId(userId) {
        if (typeof userId !== 'number' || isNaN(userId)) {
            console.error('El ID del usuario debe ser un número válido.');
            return;
        }
        try {
            const response = await $.ajax({
                url: `/transactions/latest/${userId}`,
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener el ID del usuario:', error);
            return null;
        }
    }
}
window.Transaction = Transaction;
