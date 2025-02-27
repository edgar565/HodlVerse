class Game {
    constructor(difficulty, user) {
        this.difficulty = difficulty;
        this.duration = 30;
        this.startDate = new Date();
        this.endDate = this.calculateEndDate();
        this.initialCredit = 100000;
        this.currentCredit = this.initialCredit;
        this.objective = this.calculateObjective();
        this.gameId = null;
        this.user = user;
    }

    // Validar difficulty
    validateDifficulty(difficulty) {
        const validDifficulties = ['BEGINNER', 'EXPERIENCED', 'PERSONALIZED'];
        if (!validDifficulties.includes(difficulty)) {
            throw new Error('Dificultad no válida. Las opciones válidas son: beginner, experienced, personalized.');
        }
    }

    // Calcular la fecha de finalización basado en la duración
    calculateEndDate() {
        let endDate = new Date(this.startDate);
        endDate.setDate(this.startDate.getDate() + this.duration);
        console.log("endDate", endDate);
        return endDate;
    }

    // Calcular el objetivo basado en la dificultad
    calculateObjective() {
        const objectiveMultipliers = {
            BEGINNER: 0.1,
            EXPERIENCED: 0.3,
            PERSONALIZED: 0 // Permitirá valores personalizados después
        };

        if (!(this.difficulty in objectiveMultipliers)) {
            throw new Error('Dificultad no válida');
        }

        return this.initialCredit * objectiveMultipliers[this.difficulty];
    }

    // Comenzar un juego enviando datos al backend
    async startGame() {
        if (this.gameId) {
            console.warn('El juego ya ha comenzado.');
            return;
        }
        console.log("userId:", this.user.userId);
        let gameData = {
            difficulty: this.difficulty,
            initial_credit: this.initialCredit,
            objective: this.objective,
            duration: this.duration,
            start_date: this.startDate.toISOString(),
            end_date: this.endDate.toISOString(),
            user: {
                userId: this.user.userId // ID of the origin currency
            },
        };
        console.log("gameData", gameData);

        $.ajax({
            url: '/games',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(gameData),
            success: (data) => {
                this.gameId = data.gameId;
                console.log('Juego comenzado:', data);
            },
            error: (jqXHR) => {
                let errorMessage = 'Error desconocido';

                if (jqXHR.responseText) {
                    try {
                        let errorData = JSON.parse(jqXHR.responseText);
                        errorMessage = errorData.error || errorData.message || 'Error en la respuesta del servidor';
                    } catch (e) {
                        errorMessage = 'Error al procesar la respuesta del servidor';
                    }
                } else {
                    errorMessage = `Error HTTP ${jqXHR.status || 'desconocido'}`;
                }

                console.error('Error al comenzar el juego:', errorMessage);
            }
        });
        let currency = await Currency.getCurrencyByTicker("usdt");
        console.log("currency", currency);
        let wallet = await Wallet.createWallet(this.user);
        console.log("wallet", wallet);
        let balance = new Balance(null, 100000, wallet, currency);
        console.log("balance", balance)
        let balanceData = {
            walletAmount: balance.walletAmount,
            wallet: balance.wallet.walletId,
            currency: balance.currency.currencyId
        };
        console.log("balanceData", balanceData);
        Balance.createBalance(balanceData);
        window.location.href = "dashboard.html";
    }

    // Obtener el estado del juego desde el backend
    getGameStatus() {
        if (!this.gameId) {
            console.log('El juego no ha comenzado aún.');
            return;
        }

        $.ajax({
            url: `/games/${this.gameId}`,
            type: 'GET',
            success: (data) => {
                console.log('Estado del juego:', data);
            },
            error: (jqXHR) => {
                console.error('Error al obtener el estado del juego:', jqXHR.responseText);
            }
        });
    }

    // Realizar una transacción dentro del juego
    makeTransaction(transactionData) {
        if (!this.gameId) {
            console.log('El juego no ha comenzado aún.');
            return;
        }

        // Validar transactionData
        this.validateTransactionData(transactionData);

        $.ajax({
            url: `/games/${this.gameId}/transactions`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(transactionData),
            success: (data) => {
                console.log('Transacción realizada:', data);
                this.updateCredit(transactionData.destinationTransactionAmount);
            },
            error: (jqXHR) => {
                console.error('Error al realizar la transacción:', jqXHR.responseText);
            }
        });
    }

    // Validar los datos de la transacción
    validateTransactionData(transactionData) {
        if (typeof transactionData.transactionType !== 'string' || !['buy', 'sell', 'exchange'].includes(transactionData.transactionType)) {
            throw new Error('Tipo de transacción no válido. Debe ser "buy", "sell" o "exchange".');
        }

        if (typeof transactionData.originTransactionAmount !== 'number' || isNaN(transactionData.originTransactionAmount) || transactionData.originTransactionAmount < 0) {
            throw new Error('El monto de origen debe ser un número positivo.');
        }

        if (typeof transactionData.destinationTransactionAmount !== 'number' || isNaN(transactionData.destinationTransactionAmount) || transactionData.destinationTransactionAmount < 0) {
            throw new Error('El monto de destino debe ser un número positivo.');
        }

        if (typeof transactionData.originUnitPrice !== 'number' || isNaN(transactionData.originUnitPrice) || transactionData.originUnitPrice <= 0) {
            throw new Error('El precio unitario de origen debe ser un número positivo.');
        }

        if (typeof transactionData.destinationUnitPrice !== 'number' || isNaN(transactionData.destinationUnitPrice) || transactionData.destinationUnitPrice <= 0) {
            throw new Error('El precio unitario de destino debe ser un número positivo.');
        }

        if (!(transactionData.transactionDate instanceof Date)) {
            throw new Error('La fecha de la transacción debe ser una instancia de Date.');
        }
    }

    // Actualizar el crédito del jugador
    updateCredit(amount) {
        if (typeof amount !== 'number' || isNaN(amount)) {
            throw new Error('El monto a actualizar debe ser un número válido.');
        }

        this.currentCredit += amount;
        console.log('Nuevo crédito:', this.currentCredit);
    }

    // Verificar si el objetivo ha sido alcanzado
    checkObjective() {
        if (this.currentCredit < 0) {
            console.log('Crédito insuficiente para continuar.');
            return false;
        }

        const hasReachedGoal = this.currentCredit >= this.initialCredit + this.objective;
        console.log('¿Objetivo alcanzado?', hasReachedGoal);
        return hasReachedGoal;
    }

    // Obtener el juego activo de un usuario por su ID
    static async getActiveGameByUserId(userId) {
        if (typeof userId !== 'number' || isNaN(userId)) {
            console.error('El ID del usuario debe ser un número válido.');
            return;
        }
        try {
            const response = await $.ajax({
                url: `/games/active/${userId}`,
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener el ID del usuario:', error);
            return null;
        }
    }

    // Obtener el último juego terminado de un usuario por su ID
    static async getLastFinishedGameByUserId(userId) {
        if (typeof userId !== 'number' || isNaN(userId)) {
            console.error('El ID del usuario debe ser un número válido.');
            return;
        }
        try {
            const response = await $.ajax({
                url: `/games/last-finished/${userId}`,
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener el ID del usuario:', error);
            return null;
        }
    }

    static async getGames(userId) {
        if (typeof userId !== 'number' || isNaN(userId)) {
            console.error('El ID del usuario debe ser un número válido.');
            return;
        }
        try {
            const response = await $.ajax({
                url: `/games/user/${userId}`,
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener el ID del usuario:', error);
            return null;
        }
    }
}

// *** Implementación en la página web ***
/*$(document).ready(function () {
    const game = new Game('experienced');

    $('#startGame').click(() => game.startGame());

    $('#getGameStatus').click(() => game.getGameStatus());

    $('#makeTransaction').click(() => {
        try {
            const transactionData = {
                transactionType: 'buy',
                originTransactionAmount: 5000,
                destinationTransactionAmount: 3000,
                originUnitPrice: 1.5,
                destinationUnitPrice: 1.3,
                transactionDate: new Date().toISOString(),
            };

            game.makeTransaction(transactionData);
        } catch (error) {
            console.error('Error al crear la transacción:', error.message);
        }
    });

    $('#checkObjective').click(() => game.checkObjective());
});
window.Game = Game;*/
