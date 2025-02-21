class Currency {
    constructor(currencyId, name, ticker, image) {
        // Validar los datos antes de inicializar el objeto
        Currency.validateCurrencyData({ currencyId, name, ticker, image });
        this.currencyId = currencyId;
        this.name = name;
        this.ticker = ticker;
        this.image = image;
    }

    static validateCurrencyData(currencyData) {
        // Validar currencyId
        if (typeof currencyData.currencyId !== 'number' || isNaN(currencyData.currencyId)) {
            throw new Error('currencyId debe ser un número válido.');
        }

        // Validar name
        if (typeof currencyData.name !== 'string' || currencyData.name.trim() === '') {
            throw new Error('name debe ser una cadena no vacía.');
        }

        // Validar ticker
        if (typeof currencyData.ticker !== 'string' || currencyData.ticker.trim() === '') {
            throw new Error('ticker debe ser una cadena no vacía.');
        }

        // Validar image (debe ser una URL válida)
        if (typeof currencyData.image !== 'string' || !Currency.isValidUrl(currencyData.image)) {
            throw new Error('image debe ser una URL válida.');
        }
    }

    static isValidUrl(url) {
        try {
            new URL(url); // Intenta crear un objeto URL
            return true;
        } catch (e) {
            return false; // No es una URL válida
        }
    }

    // Lista donde se almacenan todas las monedas
    static currencies = [];

    // 🔄 Cargar todas las monedas desde la API (limpia la lista antes)
    static async loadCurrencies() {
        try {
            const response = await $.ajax({
                url: '/currencies',
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener el ID del usuario:', error);
            return null; // Retorna null en caso de error
        }
    }

    // 🔍 Obtener una moneda por su ID desde la API
    static async getCurrencyById(currencyId) {
        try {
            const response = await $.ajax({
                url: `/currencies/${currencyId}`,
                type: 'GET'
            });
            return response;
        } catch (error) {
            console.error('Error al obtener el ID del usuario:', error);
            return null; // Retorna null en caso de error
        }
    }

    // ➕ Crear una nueva moneda en la API
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

    // 🔄 Actualizar una moneda en la API
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

    // ❌ Eliminar una moneda de la API
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
}

window.Currency = Currency;