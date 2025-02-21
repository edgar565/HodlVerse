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
        if (!transactionData.user) {
            throw new Error('El campo user debe ser una instancia válida de la clase User.');
        }
    }

    static async createTransaction(transactionData) {
        try {
            // Validar los datos de la transacción
            this.validateData(transactionData);

            // Obtener el balance real de la currency en la wallet
            let userOriginBalanceCurrency =   await Balance.getBalancesByCurrency(transactionData.originCurrency.currencyId);
            let userOriginBalanceAmount = userOriginBalanceCurrency[0].walletAmount;
            let userOriginBalancePrice =   await History.getLatestHistoryByCurrencyId(transactionData.originCurrency.currencyId);
            userOriginBalancePrice = userOriginBalancePrice.currentPrice;
            let userOriginBalance = userOriginBalanceAmount * userOriginBalancePrice;
            console.log(`💰 Saldo en la moneda origen : ${userOriginBalance}`);

            // Calcular el precio de la transacción en USD
            const originPrice = transactionData.originTransactionAmount * transactionData.originUnitPrice;
            const destinationPrice = transactionData.destinationTransactionAmount * transactionData.destinationUnitPrice;

            console.log(`🔹 Origin Price: ${originPrice} USD`);
            console.log(`🔹 Destination Price: ${destinationPrice} USD`);

            // Validar si se puede realizar la transacción
            if (transactionData.transactionType === "buy") {
                if (userOriginBalance < originPrice || originPrice < destinationPrice) {
                    throw new Error('❌ Fondos insuficientes o el precio de origen es menor al precio de destino.');
                }
            }

            console.log("✅ Transacción validada correctamente, procediendo...");
            const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute('content');
            const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute('content');


            /*const response = await $.ajax({
                url: '/transactions',
                type: 'POST',
                contentType: 'application/json',
                headers: {
                    "csrfHeader": csrfToken,  // Envía el token CSRF en la cabecera
                    "Authorization": "Bearer " + localStorage.getItem("google_token"),
                },
                data: JSON.stringify(transactionData),
                success: function(response) {
                    console.log("✅ Transacción creada con éxito:", response);
                },
                error: function(xhr, status, error) {
                    console.error("❌ Error al crear la transacción:", xhr);
                    console.error("❌ STATUS / ERRoR:", status, error);
                }
            });*/

            // 7️⃣ Actualizar el balance de la moneda de origen

            let originBalanceArray = await Balance.getBalancesByCurrency(transactionData.originCurrency.currencyId);
            console.log("originBalanceArray", originBalanceArray);

            if (!originBalanceArray || originBalanceArray.length === 0) {
                // Si no hay balance previo, se crea uno nuevo con la cantidad inicial (en negativo porque es una salida)
                let newOriginBalance = {
                    currencyId: transactionData.originCurrency.currencyId,
                    walletAmount: -transactionData.originTransactionAmount, // Se resta porque es un gasto
                    userId: transactionData.userId // Asegúrate de incluir el userId
                };
                await Balance.createBalance(newOriginBalance, (createdBalance) => {
                    console.log("✅ Nuevo balance de moneda origen creado:", createdBalance);
                });
            } else {
                let originBalance = originBalanceArray[0]; // Se asume que existe al menos un balance
                let updatedOriginAmount = originBalance.walletAmount - transactionData.originTransactionAmount;

                Balance.updateBalance(originBalance.balanceId, { walletAmount: updatedOriginAmount }, (data) => {
                    console.log("✅ Balance de moneda origen actualizado:", data);
                });
            }

            // 8️⃣ Actualizar el balance de la moneda de destino
            let destinationBalanceArray = await Balance.getBalancesByCurrency(transactionData.destinationCurrency.currencyId);
            console.log("destinationBalanceArray", destinationBalanceArray);

            if (!destinationBalanceArray || destinationBalanceArray.length === 0) {
                // Si no hay balance previo, se crea uno nuevo con la cantidad inicial
                let newDestinationBalance = {
                    currencyId: transactionData.destinationCurrency.currencyId,
                    walletAmount: transactionData.destinationTransactionAmount,
                    userId: transactionData.userId // Asegúrate de incluir el userId
                };
                await Balance.createBalance(newDestinationBalance, (createdBalance) => {
                    console.log("✅ Nuevo balance de moneda destino creado:", createdBalance);
                });
            } else {
                let destinationBalance = destinationBalanceArray[0]; // Se asume que existe al menos un balance
                let updatedDestinationAmount = destinationBalance.walletAmount + transactionData.destinationTransactionAmount;

                Balance.updateBalance(destinationBalance.balanceId, { walletAmount: updatedDestinationAmount }, (data) => {
                    console.log("✅ Balance de moneda destino actualizado:", data);
                });
            }



        } catch (error) {
            console.error('❌ Error al crear la transacción:', error);
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
