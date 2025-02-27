class Game {
    /**
     * Constructor de la clase Game.
     * @param {string} difficulty - La dificultad del juego ('BEGINNER', 'EXPERIENCED', 'PERSONALIZED').
     * @param {Object} user - El usuario que está jugando.
     */
    constructor(difficulty, user) {
        this.difficulty = difficulty;
        this.duration = 30; // Duración del juego en días
        this.startDate = new Date(); // Fecha de inicio del juego
        this.endDate = this.calculateEndDate(); // Fecha de finalización del juego
        this.initialCredit = 100000; // Crédito inicial del jugador
        this.currentCredit = this.initialCredit; // Crédito actual del jugador
        this.objective = this.calculateObjective(); // Objetivo del juego basado en la dificultad
        this.gameId = null; // ID del juego (se asigna al iniciar el juego)
        this.user = user; // Usuario que está jugando
    }

    /**
     * Valida la dificultad del juego.
     * @param {string} difficulty - La dificultad a validar.
     * @throws {Error} Si la dificultad no es válida.
     */
    validateDifficulty(difficulty) {
        const validDifficulties = ['BEGINNER', 'EXPERIENCED', 'PERSONALIZED'];
        if (!validDifficulties.includes(difficulty)) {
            throw new Error('Dificultad no válida. Las opciones válidas son: BEGINNER, EXPERIENCED, PERSONALIZED.');
        }
    }

    /**
     * Calcula la fecha de finalización del juego basado en la duración.
     * @returns {Date} La fecha de finalización del juego.
     */
    calculateEndDate() {
        let endDate = new Date(this.startDate);
        endDate.setDate(this.startDate.getDate() + this.duration);
        console.log("endDate", endDate);
        return endDate;
    }

    /**
     * Calcula el objetivo del juego basado en la dificultad.
     * @returns {number} El objetivo del juego.
     */
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

    /**
     * Comienza un juego enviando datos al backend.
     */
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
                userId: this.user.userId // ID del usuario
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

        // Obtener la moneda y crear la billetera y el balance inicial
        let currency = await Currency.getCurrencyByTicker("usdt");
        console.log("currency", currency);
        let wallet = await Wallet.createWallet(this.user);
        console.log("wallet", wallet);
        let balance = new Balance(null, 100000, wallet, currency);
        console.log("balance", balance);
        let balanceData = {
            walletAmount: balance.walletAmount,
            wallet: balance.wallet.walletId,
            currency: balance.currency.currencyId
        };
        console.log("balanceData", balanceData);
        await Balance.createBalance(balanceData);
        window.location.href = "dashboard.html";
    }

    /**
     * Obtiene el estado del juego desde el backend.
     */
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

    /**
     * Realiza una transacción dentro del juego.
     * @param {Object} transactionData - Los datos de la transacción.
     */
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

    /**
     * Valida los datos de la transacción.
     * @param {Object} transactionData - Los datos de la transacción a validar.
     * @throws {Error} Si los datos no son válidos.
     */
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

    /**
     * Actualiza el crédito del jugador.
     * @param {number} amount - El monto a actualizar.
     * @throws {Error} Si el monto no es un número válido.
     */
    updateCredit(amount) {
        if (typeof amount !== 'number' || isNaN(amount)) {
            throw new Error('El monto a actualizar debe ser un número válido.');
        }

        this.currentCredit += amount;
        console.log('Nuevo crédito:', this.currentCredit);
    }

    /**
     * Verifica si el objetivo ha sido alcanzado.
     * @returns {boolean} True si el objetivo ha sido alcanzado, false en caso contrario.
     */
    checkObjective() {
        if (this.currentCredit < 0) {
            console.log('Crédito insuficiente para continuar.');
            return false;
        }

        const hasReachedGoal = this.currentCredit >= this.initialCredit + this.objective;
        console.log('¿Objetivo alcanzado?', hasReachedGoal);
        return hasReachedGoal;
    }

    /**
     * Verifica si el juego ha terminado.
     * @returns {Object} Un objeto con la propiedad 'lost' y 'reason' si el juego ha terminado.
     */
    checkGameOver() {
        const now = new Date();

        if (this.currentCredit <= 0) {
            console.log("Has perdido la partida. Te has quedado sin crédito.");
            return { lost: true, reason: "bankruptcy" };
        }

        if (now >= this.endDate) {
            console.log("Has perdido la partida. Se acabó el tiempo.");
            return { lost: true, reason: "outOfTime" };
        }

        console.log("El juego sigue en curso.");
        return { lost: false, reason: null };
    }

    /**
     * Obtiene el juego activo de un usuario por su ID.
     * @param {number} userId - El ID del usuario.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con los datos del juego activo o null en caso de error.
     */
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
            console.error('Error al obtener el juego activo del usuario:', error);
            return null;
        }
    }

    /**
     * Obtiene el último juego terminado de un usuario por su ID.
     * @param {number} userId - El ID del usuario.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con los datos del último juego terminado o null en caso de error.
     */
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
            console.error('Error al obtener el último juego terminado del usuario:', error);
            return null;
        }
    }

    /**
     * Obtiene todos los juegos de un usuario por su ID.
     * @param {number} userId - El ID del usuario.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con los datos de los juegos del usuario o null en caso de error.
     */
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
            console.error('Error al obtener los juegos del usuario:', error);
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
