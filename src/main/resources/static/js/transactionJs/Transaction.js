class Transaction {
    constructor(id, transactionType, originTransactionAmount, destinationTransactionAmount, originUnitPrice, destinationUnitPrice, transactionDate, user, originCurrency, destinationCurrency) {
        // Validar cada propiedad antes de inicializar el objeto
        this.id = id;
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

    // Validar los datos de la transacción
    static validateData(transactionData) {
        // Validar id
        if (typeof transactionData.id !== 'number' || isNaN(transactionData.id)) {
            throw new Error('El ID de la transacción debe ser un número válido.');
        }

        // Validar transactionType
        if (typeof transactionData.transactionType !== 'string' || !['buy', 'sell', 'exchange'].includes(transactionData.transactionType)) {
            throw new Error('Tipo de transacción no válido. Debe ser "buy", "sell" o "exchange".');
        }

        // Validar originTransactionAmount
        if (typeof transactionData.originTransactionAmount !== 'number' || isNaN(transactionData.originTransactionAmount) || transactionData.originTransactionAmount < 0) {
            throw new Error('El monto de origen debe ser un número positivo.');
        }

        // Validar destinationTransactionAmount
        if (typeof transactionData.destinationTransactionAmount !== 'number' || isNaN(transactionData.destinationTransactionAmount) || transactionData.destinationTransactionAmount < 0) {
            throw new Error('El monto de destino debe ser un número positivo.');
        }

        // Validar originUnitPrice
        if (typeof transactionData.originUnitPrice !== 'number' || isNaN(transactionData.originUnitPrice) || transactionData.originUnitPrice <= 0) {
            throw new Error('El precio unitario de origen debe ser un número positivo.');
        }

        // Validar destinationUnitPrice
        if (typeof transactionData.destinationUnitPrice !== 'number' || isNaN(transactionData.destinationUnitPrice) || transactionData.destinationUnitPrice <= 0) {
            throw new Error('El precio unitario de destino debe ser un número positivo.');
        }

        // Validar transactionDate
        if (!(transactionData.transactionDate instanceof Date)) {
            throw new Error('La fecha de la transacción debe ser una instancia de Date.');
        }

        // Validar user
        if (!(transactionData.user instanceof User)) {
            throw new Error('El campo user debe ser una instancia de la clase User.');
        }

        // Validar originCurrency
        if (!(transactionData.originCurrency instanceof Currency)) {
            throw new Error('El campo originCurrency debe ser una instancia de la clase Currency.');
        }

        // Validar destinationCurrency
        if (!(transactionData.destinationCurrency instanceof Currency)) {
            throw new Error('El campo destinationCurrency debe ser una instancia de la clase Currency.');
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

    // Crear una nueva transacción
    static async createTransaction(transactionData) {
        // Primero validamos los datos; si son inválidos se lanza un error y se interrumpe la ejecución.
        try {
            const data = await $.ajax({
                url: '/transactions',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(transactionData)
            });
            console.log('Transacción creada:', data);
            Transaction.loadTransactions(); // Recargar la lista de transacciones
            return data;
        } catch (ajaxError) {
            console.error('Error al crear la transacción:', ajaxError);
        }
    }


    // Actualizar una transacción existente
    static updateTransaction(id, updatedData, callback) {
        if (typeof id !== 'number' || isNaN(id)) {
            console.error('El ID de la transacción debe ser un número válido.');
            return;
        }

        try {
            this.validateData(updatedData); // Validar los datos actualizados
            $.ajax({
                url: `/transactions/${id}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(updatedData),
                success: (data) => {
                    console.log('Transacción actualizada:', data);
                    if (callback) callback(data);
                    Transaction.loadTransactions(); // Recargar la lista
                },
                error: (error) => {
                    console.error(`Error al actualizar la transacción con ID ${id}:`, error);
                }
            });
        } catch (error) {
            console.error('Datos inválidos para actualizar la transacción:', error.message);
        }
    }

    // Eliminar una transacción
    static deleteTransaction(id, callback) {
        if (typeof id !== 'number' || isNaN(id)) {
            console.error('El ID de la transacción debe ser un número válido.');
            return;
        }

        $.ajax({
            url: `/transactions/${id}`,
            type: 'DELETE',
            success: () => {
                console.log(`Transacción con ID ${id} eliminada.`);
                if (callback) callback();
                Transaction.loadTransactions(); // Recargar la lista
            },
            error: (error) => {
                console.error(`Error al eliminar la transacción con ID ${id}:`, error);
            }
        });
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
