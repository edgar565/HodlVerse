class Currency {
    /**
     * Constructor de la clase Currency.
     * @param {number} currencyId - El identificador único de la moneda.
     * @param {string} name - El nombre de la moneda.
     * @param {string} ticker - El símbolo de la moneda.
     * @param {string} image - La URL de la imagen de la moneda.
     */
    constructor(currencyId, name, ticker, image) {
        this.currencyId = currencyId;
        this.name = name;
        this.ticker = ticker;
        this.image = image;
    }

    /**
     * Valida los datos de la moneda.
     * @param {Object} currencyData - Los datos de la moneda a validar.
     * @throws {Error} Si los datos no son válidos.
     */
    static validateCurrencyData(currencyData) {
        // Validar que currencyId sea un número válido
        if (typeof currencyData.currencyId !== 'number' || isNaN(currencyData.currencyId)) {
            throw new Error('currencyId debe ser un número válido.');
        }

        // Validar que name sea una cadena no vacía
        if (typeof currencyData.name !== 'string' || currencyData.name.trim() === '') {
            throw new Error('name debe ser una cadena no vacía.');
        }

        // Validar que ticker sea una cadena no vacía
        if (typeof currencyData.ticker !== 'string' || currencyData.ticker.trim() === '') {
            throw new Error('ticker debe ser una cadena no vacía.');
        }

        // Validar que image sea una URL válida
        if (typeof currencyData.image !== 'string' || !Currency.isValidUrl(currencyData.image)) {
            throw new Error('image debe ser una URL válida.');
        }
    }

    /**
     * Verifica si una URL es válida.
     * @param {string} url - La URL a verificar.
     * @returns {boolean} True si la URL es válida, false en caso contrario.
     */
    static isValidUrl(url) {
        try {
            new URL(url); // Intenta crear un objeto URL
            return true;
        } catch (e) {
            return false; // No es una URL válida
        }
    }

    /**
     * Obtiene una moneda por su ticker desde la API.
     * @param {string} ticker - El símbolo de la moneda.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con los datos de la moneda o null en caso de error.
     */
    static async getCurrencyByTicker(ticker) {
        try {
            return await $.ajax({
                url: `/currencies/ticker/${ticker}`,
                type: 'GET'
            });
        } catch (error) {
            console.error(`Error al obtener la moneda con ticker ${ticker}:`, error);
            return null;
        }
    }

    /**
     * Lista donde se almacenan todas las monedas.
     * @type {Currency[]}
     */
    static currencies = [];

    /**
     * Carga todas las monedas desde la API y limpia la lista antes.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con los datos de las monedas o null en caso de error.
     */
    static async loadCurrencies() {
        try {
            const response = await $.ajax({
                url: '/currencies',
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener las monedas:', error);
            return null; // Retorna null en caso de error
        }
    }

    /**
     * Obtiene una moneda por su ID desde la API.
     * @param {number} currencyId - El identificador de la moneda.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con los datos de la moneda o null en caso de error.
     */
    static async getCurrencyById(currencyId) {
        try {
            const response = await $.ajax({
                url: `/currencies/${currencyId}`,
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error(`Error al obtener la moneda con ID ${currencyId}:`, error);
            return null; // Retorna null en caso de error
        }
    }

    /**
     * Crea una nueva moneda en la API.
     * @param {string} name - El nombre de la moneda.
     * @param {string} ticker - El símbolo de la moneda.
     * @param {string} image - La URL de la imagen de la moneda.
     * @param {Function} callback - Función a ejecutar después de crear la moneda.
     */
    static createCurrency(name, ticker, image, callback) {
        let newCurrency = { name, ticker, image };

        try {
            Currency.validateCurrencyData({ currencyId: null, name, ticker, image }); // Validar antes de enviar
            $.ajax({
                url: '/currencies',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(newCurrency),
                success: (data) => {
                    try {
                        Currency.validateCurrencyData(data);
                        let currency = new Currency(data.currencyId, data.name, data.ticker, data.image);
                        Currency.currencies.push(currency);
                        console.log('Moneda creada y almacenada:', currency);
                        if (callback) callback(currency);
                    } catch (error) {
                        console.error('Error al validar la moneda creada:', error.message);
                    }
                },
                error: (error) => {
                    console.error('Error al crear la moneda:', error);
                }
            });
        } catch (error) {
            console.error('Datos inválidos para crear la moneda:', error.message);
        }
    }

    /**
     * Actualiza una moneda en la API.
     * @param {number} currencyId - El identificador de la moneda.
     * @param {string} name - El nuevo nombre de la moneda.
     * @param {string} ticker - El nuevo símbolo de la moneda.
     * @param {string} image - La nueva URL de la imagen de la moneda.
     * @param {Function} callback - Función a ejecutar después de actualizar la moneda.
     */
    static updateCurrency(currencyId, name, ticker, image, callback) {
        let updatedCurrency = { name, ticker, image };

        try {
            Currency.validateCurrencyData({ currencyId, name, ticker, image }); // Validar antes de enviar
            $.ajax({
                url: `/currencies/${currencyId}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(updatedCurrency),
                success: (data) => {
                    try {
                        Currency.validateCurrencyData(data);
                        let index = Currency.currencies.findIndex(c => c.currencyId === currencyId);
                        if (index !== -1) {
                            Currency.currencies[index] = new Currency(data.currencyId, data.name, data.ticker, data.image);
                            console.log('Moneda actualizada:', Currency.currencies[index]);
                        }
                        if (callback) callback(data);
                    } catch (error) {
                        console.error('Error al validar la moneda actualizada:', error.message);
                    }
                },
                error: (error) => {
                    console.error('Error al actualizar la moneda:', error);
                }
            });
        } catch (error) {
            console.error('Datos inválidos para actualizar la moneda:', error.message);
        }
    }

    /**
     * Elimina una moneda de la API.
     * @param {number} currencyId - El identificador de la moneda.
     * @param {Function} callback - Función a ejecutar después de eliminar la moneda.
     */
    static deleteCurrency(currencyId, callback) {
        $.ajax({
            url: `/currencies/${currencyId}`,
            type: 'DELETE',
            success: () => {
                Currency.currencies = Currency.currencies.filter(c => c.currencyId !== currencyId);
                console.log(`Moneda con ID ${currencyId} eliminada.`);
                if (callback) callback();
            },
            error: (error) => {
                console.error('Error al eliminar la moneda:', error);
            }
        });
    }

    /**
     * Obtiene las monedas recomendadas desde la API.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con las monedas recomendadas o null en caso de error.
     */
    static async getRecommendations() {
        try {
            const response = await $.ajax({
                url: '/currencies/random',
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener las monedas recomendadas:', error);
            return null; // Retorna null en caso de error
        }
    }

    /**
     * Obtiene las monedas más vistas desde la API.
     * @returns {Promise<Object|null>} Una promesa que se resuelve con las monedas más vistas o null en caso de error.
     */
    static async getMostViewed() {
        try {
            const response = await $.ajax({
                url: '/currencies/random',
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener las monedas más vistas:', error);
            return null; // Retorna null en caso de error
        }
    }

    static async search(name) {
        try {
            const response = await $.ajax({
                url: `/currencies/search/${name}` ,
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener las monedas más vistas:', error);
            return null; // Retorna null en caso de error
        }
    }
}

window.Currency = Currency;
