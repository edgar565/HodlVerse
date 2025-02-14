class Game {
    constructor(difficulty, duration = 30, startDate = new Date()) {
        // Validar difficulty
        this.validateDifficulty(difficulty);

        // Validar duration
        if (typeof duration !== 'number' || duration <= 0) {
            throw new Error('La duración debe ser un número positivo.');
        }

        // Validar startDate
        if (!(startDate instanceof Date)) {
            throw new Error('La fecha de inicio debe ser una instancia de Date.');
        }

        this.difficulty = difficulty;
        this.duration = duration;
        this.startDate = startDate;
        this.endDate = this.calculateEndDate();
        this.initialCredit = 100000;
        this.currentCredit = this.initialCredit;
        this.objective = this.calculateObjective();
        this.gameId = null;
    }

    // Validar difficulty
    validateDifficulty(difficulty) {
        const validDifficulties = ['beginner', 'experienced', 'personalized'];
        if (!validDifficulties.includes(difficulty)) {
            throw new Error('Dificultad no válida. Las opciones válidas son: beginner, experienced, personalized.');
        }
    }

    // Calcular la fecha de finalización basado en la duración
    calculateEndDate() {
        let endDate = new Date(this.startDate);
        endDate.setDate(this.startDate.getDate() + this.duration);
        return endDate;
    }

    // Calcular el objetivo basado en la dificultad
    calculateObjective() {
        const objectiveMultipliers = {
            beginner: 0.1,
            experienced: 0.3,
            personalized: 0 // Permitirá valores personalizados después
        };

        if (!(this.difficulty in objectiveMultipliers)) {
            throw new Error('Dificultad no válida');
        }

        return this.initialCredit * objectiveMultipliers[this.difficulty];
    }

    // Comenzar un juego enviando datos al backend
    startGame() {
        if (this.gameId) {
            console.warn('El juego ya ha comenzado.');
            return;
        }

        let gameData = {
            difficulty: this.difficulty,
            initial_credit: this.initialCredit,
            objective: this.objective,
            duration: this.duration,
            start_date: this.startDate.toISOString(),
        };

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
                console.error('Error al comenzar el juego:', jqXHR.responseText);
            }
        });
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
    static getActiveGameByUserId(userId, callback) {
        if (typeof userId !== 'number' || isNaN(userId)) {
            console.error('El ID del usuario debe ser un número válido.');
            return;
        }
        $.ajax({
            url: `/games/active/${userId}`,
            type: 'GET',
            success: (data) => {
                console.log('Juego activo obtenido:', data);
                if (callback) callback(new Game(data.difficulty, data.duration, new Date(data.start_date)));
            },
            error: (jqXHR) => {
                console.error('Error al obtener el juego activo:', jqXHR.responseText);
            }
        });
    }

    // Obtener el último juego terminado de un usuario por su ID
    static getLastFinishedGameByUserId(userId, callback) {
        if (typeof userId !== 'number' || isNaN(userId)) {
            console.error('El ID del usuario debe ser un número válido.');
            return;
        }
        $.ajax({
            url: `/games/last-finished/${userId}`,
            type: 'GET',
            success: (data) => {
                console.log('Último juego terminado obtenido:', data);
                if (callback) callback(new Game(data.difficulty, data.duration, new Date(data.start_date)));
            },
            error: (jqXHR) => {
                console.error('Error al obtener el último juego terminado:', jqXHR.responseText);
            }
        });
    }
}

// *** Implementación en la página web ***
$(document).ready(function () {
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