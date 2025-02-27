class History {
    /**
     * Constructor de la clase History.
     * @param {number} historyId - El identificador único de la entrada de historial.
     * @param {number} currentPrice - El precio actual de la moneda.
     * @param {number} marketCap - La capitalización de mercado de la moneda.
     * @param {number} marketCapRank - El rango de capitalización de mercado de la moneda.
     * @param {number} totalVolume - El volumen total de la moneda.
     * @param {number} high24h - El precio más alto en las últimas 24 horas.
     * @param {number} low24h - El precio más bajo en las últimas 24 horas.
     * @param {number} priceChange24h - El cambio de precio en las últimas 24 horas.
     * @param {number} priceChangePercentage24h - El porcentaje de cambio de precio en las últimas 24 horas.
     * @param {number} marketCapChange24h - El cambio de capitalización de mercado en las últimas 24 horas.
     * @param {number} marketCapChangePercentage24h - El porcentaje de cambio de capitalización de mercado en las últimas 24 horas.
     * @param {number} totalSupply - El suministro total de la moneda.
     * @param {Date} lastUpdated - La fecha y hora de la última actualización.
     * @param {Currency} currency - La moneda asociada a la entrada de historial.
     */
    constructor(historyId, currentPrice, marketCap, marketCapRank, totalVolume, high24h, low24h, priceChange24h, priceChangePercentage24h, marketCapChange24h, marketCapChangePercentage24h, totalSupply, lastUpdated, currency) {
        this.historyId = historyId;
        this.currentPrice = currentPrice;
        this.marketCap = marketCap;
        this.marketCapRank = marketCapRank;
        this.totalVolume = totalVolume;
        this.high24h = high24h;
        this.low24h = low24h;
        this.priceChange24h = priceChange24h;
        this.priceChangePercentage24h = priceChangePercentage24h;
        this.marketCapChange24h = marketCapChange24h;
        this.marketCapChangePercentage24h = marketCapChangePercentage24h;
        this.totalSupply = totalSupply;
        this.lastUpdated = lastUpdated;
        this.currency = currency;
    }

    /**
     * Valida los datos de la entrada de historial.
     * @param {Object} historyData - Los datos de la entrada de historial a validar.
     * @throws {Error} Si los datos no son válidos.
     */
    static validateHistoryData(historyData) {
        // Validar historyId
        if (typeof historyData.historyId !== 'number' || isNaN(historyData.historyId)) {
            throw new Error('historyId debe ser un número válido.');
        }

        // Validar currentPrice
        if (typeof historyData.currentPrice !== 'number' || isNaN(historyData.currentPrice)) {
            throw new Error('currentPrice debe ser un número válido.');
        }

        // Validar marketCap
        if (typeof historyData.marketCap !== 'number' || isNaN(historyData.marketCap)) {
            throw new Error('marketCap debe ser un número válido.');
        }

        // Validar marketCapRank
        if (typeof historyData.marketCapRank !== 'number' || isNaN(historyData.marketCapRank)) {
            throw new Error('marketCapRank debe ser un número válido.');
        }

        // Validar totalVolume
        if (typeof historyData.totalVolume !== 'number' || isNaN(historyData.totalVolume)) {
            throw new Error('totalVolume debe ser un número válido.');
        }

        // Validar high24h
        if (typeof historyData.high24h !== 'number' || isNaN(historyData.high24h)) {
            throw new Error('high24h debe ser un número válido.');
        }

        // Validar low24h
        if (typeof historyData.low24h !== 'number' || isNaN(historyData.low24h)) {
            throw new Error('low24h debe ser un número válido.');
        }

        // Validar priceChange24h
        if (typeof historyData.priceChange24h !== 'number' || isNaN(historyData.priceChange24h)) {
            throw new Error('priceChange24h debe ser un número válido.');
        }

        // Validar priceChangePercentage24h
        if (typeof historyData.priceChangePercentage24h !== 'number' || isNaN(historyData.priceChangePercentage24h)) {
            throw new Error('priceChangePercentage24h debe ser un número válido.');
        }

        // Validar marketCapChange24h
        if (typeof historyData.marketCapChange24h !== 'number' || isNaN(historyData.marketCapChange24h)) {
            throw new Error('marketCapChange24h debe ser un número válido.');
        }

        // Validar marketCapChangePercentage24h
        if (typeof historyData.marketCapChangePercentage24h !== 'number' || isNaN(historyData.marketCapChangePercentage24h)) {
            throw new Error('marketCapChangePercentage24h debe ser un número válido.');
        }

        // Validar totalSupply
        if (typeof historyData.totalSupply !== 'number' || isNaN(historyData.totalSupply)) {
            throw new Error('totalSupply debe ser un número válido.');
        }

        // Validar lastUpdated
        if (!(historyData.lastUpdated instanceof Date)) {
            throw new Error('lastUpdated debe ser una instancia de Date.');
        }

        // Validar currency
        if (!(historyData.currency instanceof Currency)) {
            throw new Error('currency debe ser una instancia de Currency.');
        }
    }

    // Lista donde se almacenan todas las entradas de historial
    static histories = [];

    /**
     * Carga todas las entradas del historial desde la API.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con los datos de las entradas de historial o null en caso de error.
     */
    static async loadHistories() {
        try {
            const response = await $.ajax({
                url: '/history',
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener las entradas de historial:', error);
            return null;
        }
    }

    /**
     * Obtiene una entrada de historial por su ID desde la API.
     * @param {number} historyId - El ID de la entrada de historial.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con los datos de la entrada de historial o null en caso de error.
     */
    static async getHistoryById(historyId) {
        if (typeof historyId !== 'number' || isNaN(historyId)) {
            console.error('El ID de la entrada de historial debe ser un número válido.');
            return;
        }
        try {
            const response = await $.ajax({
                url: `/history/${historyId}`,
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener la entrada de historial:', error);
            return null;
        }
    }

    /**
     * Crea una nueva entrada de historial en la API.
     * @param {number} currentPrice - El precio actual de la moneda.
     * @param {number} marketCap - La capitalización de mercado de la moneda.
     * @param {number} marketCapRank - El rango de capitalización de mercado de la moneda.
     * @param {number} totalVolume - El volumen total de la moneda.
     * @param {number} high24h - El precio más alto en las últimas 24 horas.
     * @param {number} low24h - El precio más bajo en las últimas 24 horas.
     * @param {number} priceChange24h - El cambio de precio en las últimas 24 horas.
     * @param {number} priceChangePercentage24h - El porcentaje de cambio de precio en las últimas 24 horas.
     * @param {number} marketCapChange24h - El cambio de capitalización de mercado en las últimas 24 horas.
     * @param {number} marketCapChangePercentage24h - El porcentaje de cambio de capitalización de mercado en las últimas 24 horas.
     * @param {number} totalSupply - El suministro total de la moneda.
     * @param {Date} lastUpdated - La fecha y hora de la última actualización.
     * @param {Currency} currency - La moneda asociada a la entrada de historial.
     * @param {Function} callback - Función a ejecutar después de crear la entrada de historial.
     */
    static createHistory(currentPrice, marketCap, marketCapRank, totalVolume, high24h, low24h, priceChange24h, priceChangePercentage24h, marketCapChange24h, marketCapChangePercentage24h, totalSupply, lastUpdated, currency, callback) {
        let newHistory = {
            currentPrice,
            marketCap,
            marketCapRank,
            totalVolume,
            high24h,
            low24h,
            priceChange24h,
            priceChangePercentage24h,
            marketCapChange24h,
            marketCapChangePercentage24h,
            totalSupply,
            lastUpdated: lastUpdated.toISOString(),
            currency: currency
        };

        try {
            History.validateHistoryData(newHistory);
            $.ajax({
                url: '/history',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(newHistory),
                success: (data) => {
                    try {
                        History.validateHistoryData(data);
                        let history = new History(
                            data.historyId,
                            data.currentPrice,
                            data.marketCap,
                            data.marketCapRank,
                            data.totalVolume,
                            data.high24h,
                            data.low24h,
                            data.priceChange24h,
                            data.priceChangePercentage24h,
                            data.marketCapChange24h,
                            data.marketCapChangePercentage24h,
                            data.totalSupply,
                            new Date(data.lastUpdated),
                            new Currency(data.currency)
                        );
                        History.histories.push(history);
                        console.log('Nueva entrada de historial creada:', history);
                        if (callback) callback(history);
                    } catch (error) {
                        console.error('Error al validar la nueva entrada de historial:', error.message);
                    }
                },
                error: (error) => {
                    console.error('Error al crear la entrada de historial:', error);
                }
            });
        } catch (error) {
            console.error('Datos inválidos para crear la entrada de historial:', error.message);
        }
    }

    /**
     * Actualiza una entrada de historial en la API.
     * @param {number} historyId - El ID de la entrada de historial.
     * @param {Object} updatedData - Los datos actualizados de la entrada de historial.
     * @param {Function} callback - Función a ejecutar después de actualizar la entrada de historial.
     */
    static updateHistory(historyId, updatedData, callback) {
        if (typeof historyId !== 'number' || isNaN(historyId)) {
            console.error('El ID de la entrada de historial debe ser un número válido.');
            return;
        }

        try {
            History.validateHistoryData({ ...updatedData, historyId });
            $.ajax({
                url: `/history/${historyId}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(updatedData),
                success: (data) => {
                    try {
                        History.validateHistoryData(data);
                        let index = History.histories.findIndex(h => h.historyId === historyId);
                        if (index !== -1) {
                            History.histories[index] = new History(
                                data.historyId,
                                data.currentPrice,
                                data.marketCap,
                                data.marketCapRank,
                                data.totalVolume,
                                data.high24h,
                                data.low24h,
                                data.priceChange24h,
                                data.priceChangePercentage24h,
                                data.marketCapChange24h,
                                data.marketCapChangePercentage24h,
                                data.totalSupply,
                                new Date(data.lastUpdated),
                                new Currency(data.currency)
                            );
                            console.log('Entrada de historial actualizada:', History.histories[index]);
                        }
                        if (callback) callback(data);
                    } catch (error) {
                        console.error('Error al validar la entrada de historial actualizada:', error.message);
                    }
                },
                error: (error) => {
                    console.error('Error al actualizar la entrada de historial:', error);
                }
            });
        } catch (error) {
            console.error('Datos inválidos para actualizar la entrada de historial:', error.message);
        }
    }

    /**
     * Elimina una entrada de historial de la API.
     * @param {number} historyId - El ID de la entrada de historial.
     * @param {Function} callback - Función a ejecutar después de eliminar la entrada de historial.
     */
    static deleteHistory(historyId, callback) {
        if (typeof historyId !== 'number' || isNaN(historyId)) {
            console.error('El ID de la entrada de historial debe ser un número válido.');
            return;
        }

        $.ajax({
            url: `/history/${historyId}`,
            type: 'DELETE',
            success: () => {
                History.histories = History.histories.filter(h => h.historyId !== historyId);
                console.log(`Entrada de historial con ID ${historyId} eliminada.`);
                if (callback) callback();
            },
            error: (error) => {
                console.error('Error al eliminar la entrada de historial:', error);
            }
        });
    }

    /**
     * Obtiene la suma total del Market Cap de todas las monedas.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con la suma total del Market Cap o null en caso de error.
     */
    static async getTotalMarketCap() {
        try {
            const response = await $.ajax({
                url: '/history/total-market-cap',
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener la suma total del Market Cap:', error);
            return null;
        }
    }

    /**
     * Obtiene la suma total del volumen de todas las monedas.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con la suma total del volumen o null en caso de error.
     */
    static async getTotalVolume() {
        try {
            const response = await $.ajax({
                url: '/history/total-volume',
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener la suma total del volumen:', error);
            return null;
        }
    }

    /**
     * Obtiene la última entrada de historial.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con la última entrada de historial o null en caso de error.
     */
    static async getLatestHistory() {
        try {
            const response = await $.ajax({
                url: '/history/latest', // Endpoint para obtener la última entrada de History
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener la última entrada de historial:', error);
            return null;
        }
    }

    /**
     * Obtiene las mejores monedas ordenadas por priceChangePercentage24h descendente.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con las mejores monedas o null en caso de error.
     */
    static async getTopWinners() {
        try {
            const response = await $.ajax({
                url: '/history/topWinners',
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener las mejores monedas:', error);
            return null;
        }
    }

    /**
     * Obtiene las peores monedas ordenadas por priceChangePercentage24h ascendente.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con las peores monedas o null en caso de error.
     */
    static async getTopLosers() {
        try {
            const response = await $.ajax({
                url: '/history/topLosers',
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener las peores monedas:', error);
            return null;
        }
    }

    /**
     * Obtiene las monedas tendencia ordenadas por marketCapRank ascendente.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con las monedas tendencia o null en caso de error.
     */
    static async getTrendingCoins() {
        try {
            const response = await $.ajax({
                url: '/history/trending-coins',
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener las monedas tendencia:', error);
            return null;
        }
    }

    /**
     * Obtiene las monedas con el mayor volumen.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con las monedas con el mayor volumen o null en caso de error.
     */
    static async getHighestVolume() {
        try {
            const response = await $.ajax({
                url: '/history/highest-volume',
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener las monedas con el mayor volumen:', error);
            return null;
        }
    }

    /**
     * Obtiene la última entrada de historial por currencyId.
     * @param {number} currencyId - El ID de la moneda.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con la última entrada de historial o null en caso de error.
     */
    static async getLatestHistoryByCurrencyId(currencyId) {
        console.log("currencyId", currencyId);
        if (typeof currencyId !== 'number' || isNaN(currencyId)) {
            console.error('El ID de la moneda debe ser un número válido.');
            return;
        }
        try {
            const response = await $.ajax({
                url: `/history/latest/${currencyId}`, // Endpoint para obtener la última entrada de History por currencyId
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener la última entrada de historial por currencyId:', error);
            return null;
        }
    }

    /**
     * Obtiene todas las entradas de historial por currencyId.
     * @param {number} currencyId - El ID de la moneda.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con todas las entradas de historial o null en caso de error.
     */
    static async getLatestHistoryByCurrency(currencyId) {
        if (typeof currencyId !== 'number' || isNaN(currencyId)) {
            console.error('El ID de la moneda debe ser un número válido.');
            return;
        }
        try {
            const response = await $.ajax({
                url: `/history/currency/${currencyId}/all`, // Endpoint para obtener todas las entradas de History por currencyId
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener todas las entradas de historial por currencyId:', error);
            return null;
        }
    }
}

window.History = History;
