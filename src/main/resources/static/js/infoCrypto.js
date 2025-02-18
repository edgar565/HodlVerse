 async function confirmBuy(){
     const queryString = window.location.search;
     const urlParams = new URLSearchParams(queryString);
     const ticker = urlParams.get('ticker');

     async function fetchCryptoData() {
         let cryptoFinal;
         try {
             const cryptos = await Currency.loadCurrencies();
             console.log(cryptos);
             cryptos.forEach(crypto => {
                 if (crypto.ticker === ticker) {
                     cryptoFinal = crypto;
                 }
             });
             return cryptoFinal;
         } catch (error) {
             console.error("Error fetching data from API:", error);
             return null;
         }
     }
     let cryptoFinal = await fetchCryptoData();

     async function loadCryptoInfo() {
         try {
             const crypto = await History.getLatestHistoryByCurrencyId(cryptoFinal.currencyId);
             return crypto;
         } catch (error) {
             console.error("Error fetching data from API:", error);
             return null;
         }
     }
     const crypto = await loadCryptoInfo();

     async function getUser() {
         try {
             const userId = await User.getUserId();
             console.log(userId);
             return userId
         } catch (error) {
             console.error('❌ Error al obtener el usuario:', error);
             return null; // Devuelve un array vacío en caso de error
         }
     }
     let userId = await getUser();
     // Ejemplo de cómo construir los datos de una transacción:
     const transactionData = {
         transactionId: 85,
         transactionType: 'buy', // Puede ser "buy", "sell" o "exchange"
         originTransactionAmount: crypto.currentPrice,        // Usar string para evitar problemas de precisión en BigDecimal
         destinationTransactionAmount: parseFloat(document.getElementById("buy-amount").value) || 0,
         originUnitPrice: 1,
         destinationUnitPrice: crypto.currentPrice,
         transactionDate: new Date().toISOString().split('T')[0], // Formato "YYYY-MM-DD"
         user: {
             userId: userId // ID del usuario (asegúrate de tener este valor)
         },
         originCurrency: {
             currencyId: 3 // ID de la moneda de origen
         },
         destinationCurrency: {
             currencyId: cryptoFinal.currencyId // ID de la moneda de destino
         }
     };

// Luego, puedes enviar estos datos utilizando la función createTransaction
     Transaction.createTransaction(transactionData, (data) => {
         console.log("Transacción creada:", data);
     });

    Transaction = new Transaction();
 }
    /*  BUY/SELL CRYPTO EVENT */
document.addEventListener('DOMContentLoaded', function () {
    let actionType = '';
    const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
    const buyModal = new bootstrap.Modal(document.getElementById('buyModal'));
    const sellModal = new bootstrap.Modal(document.getElementById('sellModal'));

    document.getElementById('buy-btn').addEventListener('click', function () {
        actionType = 'buy';
        confirmationModal.show();
    });

    document.getElementById('sell-btn').addEventListener('click', function () {
        actionType = 'sell';
        confirmationModal.show();
    });

    document.getElementById('confirm-action').addEventListener('click', function () {
        confirmationModal.hide();
        setTimeout(() => {
            if (actionType === 'buy') {
                buyModal.show();
            } else if (actionType === 'sell') {
                sellModal.show();
            }
        }, 300);
    });

    // Function to update the estimated total based on the input amount and current price
    function updateTotal(inputId, outputId) {
        const amount = parseFloat(document.getElementById(inputId).value) || 0;
        const currentPrice = parseFloat(document.getElementById('currentPriceBuy').innerText.replace('$', '')) || 0;
        const total = amount * currentPrice;
        document.getElementById(outputId).innerText = `$${total.toFixed(2)}`;
    }

    document.getElementById('buy-amount').addEventListener('input', function () {
        updateTotal('buy-amount', 'buy-total-price');
    });

    document.getElementById('sell-amount').addEventListener('input', function () {
        updateTotal('sell-amount', 'sell-total-price');
    });

    document.getElementById('confirm-buy').addEventListener('click', function () {
        // Aquí iría la lógica real de compra
        alert('Purchase confirmed!');

        buyModal.hide();
    });

    document.getElementById('confirm-sell').addEventListener('click', function () {
        // Aquí iría la lógica real de venta
        alert('Sale confirmed!');
        sellModal.hide();
    });
});

/*TOOLTIP INFO */
// Inicializar tooltips
let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
let tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
});

// /* API CAROUSEL NEWS */
//
// async function loadCryptoNews() {
//     try {
//         // Realizamos la solicitud a la API de CryptoPanic con el token de autenticación
//         const response = await fetch("https://cryptopanic.com/api/v1/posts/?auth_token=a4c7721b1d6af749de0f98cd0412b15e62d326a3", {
//             method: "GET",
//             headers: {
//                 "Content-Type": "application/json",
//             },
//         });
//
//         // Esperamos la respuesta en formato JSON
//         const data = await response.json();
//
//         // Verificamos si la respuesta tiene los resultados
//         if (data.results) {
//             // Llamamos a la función para mostrar las noticias en el carrusel
//             displayNewsCarousel(data.results);
//         } else {
//             console.log("No news available.");
//         }
//     } catch (error) {
//         console.error("Error fetching news:", error);
//     }
// }
//
// function displayNewsCarousel(news) {
//     // Seleccionamos el contenedor del carrusel
//     const carouselInner = document.querySelector("#cryptoNewsCarousel .carousel-inner");
//
//     // Limpiamos cualquier contenido anterior en el carrusel
//     carouselInner.innerHTML = "";
//
//     // Iteramos sobre las noticias y añadimos los elementos al carrusel
//     news.slice(0, 5).forEach((article, index) => {
//         // Establecemos el primer artículo como activo
//         const isActive = index === 0 ? "active" : "";
//
//         // Construimos el HTML para cada artículo
//         const newsItem = `
//             <div class="carousel-item ${isActive}">
//                 <img src="${article.thumbnail || 'placeholder.jpg'}" class="d-block w-100" alt="${article.title}">
//                 <div class="carousel-caption d-none d-md-block">
//                     <h5>${article.title}</h5>
//                     <p>${article.text || "No description available."}</p>
//                     <a href="${article.url}" class="btn btn-primary" target="_blank">Read More</a>
//                 </div>
//             </div>
//         `;
//
//         // Añadimos el artículo al carrusel
//         carouselInner.innerHTML += newsItem;
//     });
// }
//
// // Llamamos a la función loadCryptoNews cuando el contenido de la página se haya cargado completamente
// document.addEventListener("DOMContentLoaded", loadCryptoNews);

 document.addEventListener("DOMContentLoaded", async function () {
     const queryString = window.location.search;
     const urlParams = new URLSearchParams(queryString);
     const ticker = urlParams.get('ticker');

     async function fetchCryptoData() {
         let cryptoFinal;
         try {
             const cryptos = await Currency.loadCurrencies();
             console.log(cryptos);
             cryptos.forEach(crypto => {
                 if (crypto.ticker === ticker) {
                     cryptoFinal = crypto;
                 }
             });
             return cryptoFinal;
         } catch (error) {
             console.error("Error fetching data from API:", error);
             return null;
         }
     }
     let cryptoFinal = await fetchCryptoData();

     async function loadCryptoInfo() {
         try {
             const crypto = await History.getLatestHistoryByCurrencyId(cryptoFinal.currencyId);
             return crypto;
         } catch (error) {
             console.error("Error fetching data from API:", error);
             return null;
         }
     }
     const crypto = await loadCryptoInfo();
     console.log(crypto);
     document.getElementById('icon').src = crypto.currency.image;
     document.getElementById('icon').alt = "Icono de " + crypto.currency.name;
     let currencyName = document.querySelectorAll('.cryptoName');
     currencyName.forEach(el => {
         el.innerHTML = crypto.currency.name;
     });
     let currencyPrice = document.querySelectorAll('.crypto-price');
     currencyPrice.forEach(el => {
         el.innerHTML = "$" + crypto.currentPrice;
     });
     document.getElementById("market-cap-rank").innerText = crypto.marketCapRank;
     document.getElementById("market-cap").innerText = "$" + crypto.marketCap;
     document.getElementById("volume").innerText = "$" + crypto.totalVolume;
     document.getElementById("total-supply").innerText = "$" + crypto.totalSupply;
     document.getElementById("change-24h").innerText = "$" + crypto.priceChange24h;
     document.getElementById("change-24h-percentage").innerText = crypto.priceChangePercentage24h + "%";
     document.getElementById("high-24").innerText = "$" + crypto.high24h;
     document.getElementById("low-24").innerText = "$" + crypto.low24h;

     // ================================
     // GRÁFICO DE EVOLUCIÓN DE PRECIOS
     // ================================

     // Obtenemos el contexto 2D del canvas donde se dibujará el gráfico.
     const ctxPrice = document.getElementById('crypto-chart').getContext('2d');

     // Creamos un gradiente vertical para el fondo de la línea.
     const gradientPrice = ctxPrice.createLinearGradient(0, 0, 0, 400);
     gradientPrice.addColorStop(0, 'rgba(6, 20, 40, 0.9)'); // Color superior (más opaco)
     gradientPrice.addColorStop(1, 'rgba(6, 20, 40, 0.2)'); // Color inferior (más transparente)

     // Etiquetas para el eje X (en este ejemplo, los meses).
     const priceLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
     // Datos de precio (uno por cada etiqueta).
     const prices = [680, 700, 650, 720, 800, 750, 820, 780, 850];

     // Creamos el gráfico usando Chart.js.
     new Chart(ctxPrice, {
         // Tipo de gráfico: 'line' (gráfico de líneas).
         type: 'line',
         data: {
             // Las etiquetas se usan en el eje X.
             labels: priceLabels,
             // Configuración de los datasets (en este caso, un solo dataset).
             datasets: [{
                 label: crypto.currency.name + ' Price ($)',         // Etiqueta que se mostrará en la leyenda y tooltips.
                 data: prices,                         // Datos del gráfico.
                 fill: true,                           // Rellenar el área debajo de la línea.
                 backgroundColor: gradientPrice,       // Fondo con el gradiente creado.
                 borderColor: 'rgb(6, 20, 40)',         // Color de la línea.
                 borderWidth: 2,                       // Grosor de la línea.
                 pointRadius: 5,                       // Tamaño de los puntos de datos.
                 pointBackgroundColor: 'rgb(6, 20, 40)',// Color de los puntos.
                 tension: 0.3                          // Curvatura de la línea (0: recta, 1: muy curvada).
             }]
         },
         options: {
             responsive: true,                       // Se adapta al tamaño del contenedor.
             maintainAspectRatio: false,             // Permite que la altura sea flexible.
             scales: {
                 y: {
                     title: {display: true, text: 'Price ($)'}, // Título del eje Y.
                     beginAtZero: false,                           // El eje Y no empieza en 0.
                     ticks: {
                         // Formatea las etiquetas del eje Y para que se vean como precios.
                         callback: function (value) {
                             return '$' + value.toLocaleString();
                         }
                     }
                 }
             },
             plugins: {
                 legend: {
                     display: true,                        // Muestra la leyenda.
                     position: 'top',                      // Ubicación de la leyenda.
                     labels: {
                         color: 'rgb(6, 20, 40)'             // Color del texto de la leyenda.
                     }
                 },
                 tooltip: {
                     enabled: true,                        // Activa los tooltips.
                     mode: 'nearest',                      // Muestra el tooltip del punto más cercano.
                     intersect: false,                     // Aparece incluso si no intersecta exactamente el punto.
                     backgroundColor: 'rgba(255,255,255,0.9)', // Fondo claro para el tooltip.
                     titleColor: '#000',                   // Color del título en el tooltip.
                     bodyColor: '#000',                    // Color del contenido.
                     borderColor: '#ddd',                  // Color del borde del tooltip.
                     borderWidth: 1,                       // Grosor del borde.
                     callbacks: {
                         // Función para el título del tooltip.
                         title: function (tooltipItems) {
                             // Muestra el mes (la etiqueta) como título.
                             return 'Date: ' + tooltipItems[0].label;
                         },
                         // Función para el contenido (etiqueta) del tooltip.
                         label: function (context) {
                             const price = context.parsed.y;  // Precio del punto.
                             return 'Price: $' + price.toLocaleString();
                         }
                     }
                 }
             }
         }
     });
     // ================================
     // GRÁFICO DE EVOLUCIÓN DE VOLUMEN
     // ================================

     // Obtenemos el contexto 2D del canvas para el gráfico de volumen.
     const ctxVolume = document.getElementById('volume-chart-value').getContext('2d');
     // Usamos las mismas etiquetas (meses) para el eje X.
     const volumeLabels = priceLabels;
     // Datos de volumen correspondientes a cada mes.
     const volumes = [50000, 55000, 60000, 65000, 70000, 75000, 80000, 75000, 85000];

     // Creamos el gráfico de barras para el volumen.
     new Chart(ctxVolume, {
         type: 'bar', // Tipo de gráfico: 'bar' para barras.
         data: {
             labels: volumeLabels,
             datasets: [{
                 label: 'Volume',                        // Etiqueta para la leyenda.
                 data: volumes,                          // Datos del volumen.
                 backgroundColor: 'rgba(6, 20, 40, 0.7)',  // Color de las barras.
                 borderColor: 'rgb(6, 20, 40)',            // Color del borde de las barras.
                 borderWidth: 1                          // Grosor del borde.
             }]
         },
         options: {
             responsive: true,
             maintainAspectRatio: false,
             scales: {
                 x: {
                     title: {display: true, text: 'Months'},
                     ticks: {
                         maxRotation: 45,
                         minRotation: 30,
                         autoSkip: true,
                         maxTicksLimit: 8
                     }
                 },
                 y: {
                     title: {display: true, text: 'Volume'},
                     beginAtZero: true,                       // El eje Y empieza en 0.
                     ticks: {
                         callback: function (value) {
                             return value.toLocaleString();       // Formatea los números para mejor legibilidad.
                         }
                     }
                 }
             },
             plugins: {
                 tooltip: {
                     enabled: true,
                     backgroundColor: 'rgba(255,255,255,0.9)',
                     titleColor: '#000',
                     bodyColor: '#000',
                     borderColor: '#ddd',
                     borderWidth: 1
                     // En este gráfico de volumen, no se han personalizado los callbacks, pero se pueden agregar de manera similar.
                 }
             }
         }
     });
 });