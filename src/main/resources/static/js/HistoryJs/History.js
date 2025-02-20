class History {
    constructor(historyId, currentPrice, marketCap, marketCapRank, totalVolume, high24h, low24h, priceChange24h, priceChangePercentage24h, marketCapChange24h, marketCapChangePercentage24h, totalSupply, lastUpdated, currency) {
        // Validar los datos antes de inicializar el objeto
        History.validateHistoryData({
            historyId,
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
            lastUpdated,
            currency
        });

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

    // 🔄 Cargar todas las entradas del historial desde la API
    static async loadHistories() {
        try {
            const response = await $.ajax({
                url: '/history',
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener el usuario:', error);
            return null;
        }
    }

    // 🔍 Obtener una entrada de historial por su ID desde la API
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
            console.error('Error al obtener el usuario:', error);
            return null;
        }
    }

    // ➕ Crear una nueva entrada de historial en la API
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

    // 🔄 Actualizar una entrada de historial en la API
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

    // ❌ Eliminar una entrada de historial de la API
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

    // 📊 Obtener la suma total del Market Cap de todas las monedas
    static async getTotalMarketCap() {
        try {
            const response = await $.ajax({
                url: '/history/total-market-cap',
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener el usuario:', error);
            return null;
        }
    }

    // 🔊 Obtener la suma total del volumen de todas las monedas
    static async getTotalVolume() {
        try {
            const response = await $.ajax({
                url: '/history/total-volume',
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener el usuario:', error);
            return null;
        }
    }

    // *** NUEVA FUNCIÓN PARA OBTENER LA ÚLTIMA ENTRADA DE HISTORY ***
    static async getLatestHistory() {
        try {
            const response = await $.ajax({
                url: '/history/latest', // Endpoint para obtener la última entrada de History
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener el usuario:', error);
            return null;
        }
    }

    // 📊 Obtener las mejores monedas (ordenadas por priceChangePercentage24h descendente)
    static async getTopWinners() {
        try {
            const response = await $.ajax({
                url: '/history/topWinners',
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener el usuario:', error);
            return null; // Retorna null en caso de error
        }
    }

    // 🔻 Obtener las peores monedas (ordenadas por priceChangePercentage24h ascendente)
    static async getTopLosers() {
        try {
            const response = await $.ajax({
                url: '/history/topLosers',
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener el usuario:', error);
            return null; // Retorna null en caso de error
        }
    }

    // 🔥 Obtener monedas tendencia (ordenadas por marketCapRank ascendente)
    static async getTrendingCoins() {
        try {
            const response = await $.ajax({
                url: '/history/trending-coins',
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener el usuario:', error);
            return null; // Retorna null en caso de error
        }
    }
    // 🔥 Obtener monedas tendencia (ordenadas por marketCapRank ascendente)
    static async getHighestVolume() {
        try {
            const response = await $.ajax({
                url: '/highest-volume',
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener el usuario:', error);
            return null; // Retorna null en caso de error
        }
    }
    // 🔄 Obtener la última entrada de historial por currencyId
    static async getLatestHistoryByCurrencyId(currencyId) {
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
            console.error('Error al obtener el usuario:', error);
            return null; // Retorna null en caso de error
        }
    }
}

window.History = History;