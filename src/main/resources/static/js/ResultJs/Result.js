class Result {
    constructor(resultId, ending, profit, game, resultDate) {
        // Validar cada propiedad antes de inicializar el objeto
        this.validateData({ resultId, ending, profit, game, resultDate });

        this.resultId = resultId;
        this.ending = ending;  // Enum: 'BANKRUPTCY', 'OUT_OF_TIME', 'GOAL_REACHED'
        this.profit = profit;  // Porcentaje de beneficios (número)
        this.game = game;  // Objeto Game
        this.resultDate = resultDate;  // Fecha del resultado (instancia de Date)
    }

    // Validar los datos del resultado
    static validateData(resultData) {
        // Validar resultId
        if (typeof resultData.resultId !== 'number' || isNaN(resultData.resultId)) {
            throw new Error('resultId debe ser un número válido.');
        }

        // Validar ending
        const validEndings = ['BANKRUPTCY', 'OUT_OF_TIME', 'GOAL_REACHED'];
        if (!validEndings.includes(resultData.ending)) {
            throw new Error('El valor de ending no es válido. Las opciones válidas son: BANKRUPTCY, OUT_OF_TIME, GOAL_REACHED.');
        }

        // Validar profit
        if (typeof resultData.profit !== 'number' || isNaN(resultData.profit)) {
            throw new Error('profit debe ser un número válido.');
        }

        // Validar game
        if (!(resultData.game instanceof Game)) {
            throw new Error('game debe ser una instancia de la clase Game.');
        }

        // Validar resultDate
        if (!(resultData.resultDate instanceof Date)) {
            throw new Error('resultDate debe ser una instancia de Date.');
        }
    }

    // Lista donde se almacenan todos los resultados
    static results = [];

    // Cargar todos los resultados desde la API
    static loadResults(callback) {
        $.ajax({
            url: '/results',
            type: 'GET',
            success: (data) => {
                Result.results.length = 0; // Limpiar lista antes de llenarla
                data.forEach(r => {
                    try {
                        Result.validateData(r);
                        Result.results.push(new Result(
                            r.resultId, r.ending, r.profit, new Game(r.game.difficulty, r.game.duration, new Date(r.game.start_date)),
                            new Date(r.resultDate)
                        ));
                    } catch (error) {
                        console.warn(`Resultado omitido debido a datos inválidos:`, r, error.message);
                    }
                });
                console.log('Resultados actualizados:', Result.results);
                if (callback) callback(Result.results);
            },
            error: (error) => {
                console.error('Error al obtener resultados:', error);
            }
        });
    }

    // Obtener un resultado por ID
    static getResultById(id, callback) {
        if (typeof id !== 'number' || isNaN(id)) {
            console.error('El ID del resultado debe ser un número válido.');
            return;
        }

        $.ajax({
            url: `/results/${id}`,
            type: 'GET',
            success: (data) => {
                try {
                    Result.validateData(data);
                    if (callback) callback(new Result(
                        data.resultId, data.ending, data.profit, new Game(data.game.difficulty, data.game.duration, new Date(data.game.start_date)),
                        new Date(data.resultDate)
                    ));
                } catch (error) {
                    console.error(`Error al validar el resultado con ID ${id}:`, error.message);
                }
            },
            error: (error) => {
                console.error(`Error al obtener el resultado con ID ${id}:`, error);
            }
        });
    }

    // Obtener un resultado por el ID del juego
    static getResultByGameId(gameId, callback) {
        if (typeof gameId !== 'number' || isNaN(gameId)) {
            console.error('El ID del juego debe ser un número válido.');
            return;
        }

        $.ajax({
            url: `/results/game/${gameId}`,
            type: 'GET',
            success: (data) => {
                try {
                    Result.validateData(data);
                    if (callback) callback(new Result(
                        data.resultId, data.ending, data.profit, new Game(data.game.difficulty, data.game.duration, new Date(data.game.start_date)),
                        new Date(data.resultDate)
                    ));
                } catch (error) {
                    console.error(`Error al validar el resultado para el juego con ID ${gameId}:`, error.message);
                }
            },
            error: (error) => {
                console.error(`Error al obtener el resultado para el juego con ID ${gameId}:`, error);
            }
        });
    }

    // Crear un nuevo resultado
    static createResult(resultData, callback) {
        try {
            this.validateData(resultData); // Validar los datos antes de enviarlos
            $.ajax({
                url: '/results',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(resultData),
                success: (data) => {
                    console.log('Resultado creado:', data);
                    if (callback) callback(data);
                    Result.loadResults(); // Recargar la lista de resultados
                },
                error: (error) => {
                    console.error('Error al crear el resultado:', error);
                }
            });
        } catch (error) {
            console.error('Datos inválidos para crear el resultado:', error.message);
        }
    }

    // Eliminar un resultado
    static deleteResult(id, callback) {
        if (typeof id !== 'number' || isNaN(id)) {
            console.error('El ID del resultado debe ser un número válido.');
            return;
        }

        $.ajax({
            url: `/results/${id}`,
            type: 'DELETE',
            success: () => {
                console.log(`Resultado con ID ${id} eliminado.`);
                if (callback) callback();
                Result.loadResults(); // Recargar la lista de resultados
            },
            error: (error) => {
                console.error(`Error al eliminar el resultado con ID ${id}:`, error);
            }
        });
    }
}