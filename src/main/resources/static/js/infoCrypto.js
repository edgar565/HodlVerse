document.addEventListener('DOMContentLoaded', async function () {
    // ================================
    // OBTENER DATOS DE LA CRYPTO
    // ================================
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

    // ================================
    // CARGAR DATOS DE LA CRYPTO
    // ================================
    console.log(crypto);
    document.getElementById('icon').src = crypto.currency.image;
    document.getElementById('icon').alt = "Icono de " + crypto.currency.name;
    let currencyName = document.querySelectorAll('.cryptoName');
    currencyName.forEach(el => {
        el.innerHTML = crypto.currency.name;
    });
    let currencyPrice = document.querySelectorAll('.crypto-price');
    currencyPrice.forEach(el => {
        el.innerHTML = crypto.currentPrice.toLocaleString() + "$";
    });
    document.getElementById("market-cap-rank").innerText = crypto.marketCapRank;
    document.getElementById("market-cap").innerText = crypto.marketCap.toLocaleString() + "$";
    document.getElementById("volume").innerText = crypto.totalVolume.toLocaleString() + "$";
    document.getElementById("total-supply").innerText = crypto.totalSupply.toLocaleString() + "$";
    document.getElementById("change-24h").innerText = crypto.priceChange24h.toLocaleString() + "$";
    document.getElementById("change-24h-percentage").innerText = crypto.priceChangePercentage24h + "%";
    document.getElementById("high-24").innerText = crypto.high24h.toLocaleString() + "$";
    document.getElementById("low-24").innerText = crypto.low24h.toLocaleString() + "$";
    document.getElementById("price-change").classList.add(crypto.priceChangePercentage24h > 0 ? "text-success" : "text-danger", "price-change")
    document.getElementById("price-change").innerText = crypto.priceChangePercentage24h > 0 ? "▲ " + crypto.priceChangePercentage24h.toFixed(2) + "%" : "▼ " + crypto.priceChangePercentage24h.toFixed(2) + "%";

    document.querySelectorAll('.buy-sell button').forEach(button => {
        button.addEventListener('click', async function () {
            console.log("Button clicked");
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

            let user = null;
            async function getUserId() {
                try {
                    const userId = await User.getUserId();
                    console.log(userId);
                    user = await User.getUserById(userId);
                    return userId
                } catch (error) {
                    console.error('❌ Error al obtener el usuario:', error);
                    return null; // Devuelve un array vacío en caso de error
                }
            }
            let userId = await getUserId();
            console.log(user);
            if (userId) {
                const queryString = window.location.search;
                const urlParams = new URLSearchParams(queryString);
                const ticker = urlParams.get('ticker');
                console.log(ticker);
                /*  BUY/SELL CRYPTO EVENT */
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

                document.getElementById('confirm-buy').addEventListener('click', async function () {
                    let user = await getUser();
                    const transactionData = {
                        transactionType: 'buy',
                        originTransactionAmount: crypto.currentPrice * parseFloat(document.getElementById("buy-amount").value) || 0,
                        destinationTransactionAmount: parseFloat(document.getElementById("buy-amount").value) || 0,
                        originUnitPrice: 1,
                        destinationUnitPrice: crypto.currentPrice,
                        transactionDate: new Date().toISOString().split('T')[0],
                        user: user,
                        originCurrency: {
                            currencyId: 3
                        },
                        destinationCurrency: {
                            currencyId: cryptoFinal.currencyId
                        }
                    };
                    transactionData.transactionDate = new Date(transactionData.transactionDate);
                    await Transaction.createTransaction(transactionData);
                    console.log("Transacción creada correctamente.");
                    buyModal.hide();
                });

                document.getElementById('confirm-sell').addEventListener('click', async function () {
                    let user = await getUser();
                    const transactionData = {
                        transactionType: 'sell',
                        originTransactionAmount: crypto.currentPrice * parseFloat(document.getElementById("sell-amount").value) || 0,
                        destinationTransactionAmount: parseFloat(document.getElementById("sell-amount").value) || 0,
                        originUnitPrice: 1,
                        destinationUnitPrice: crypto.currentPrice,
                        transactionDate: new Date().toISOString().split('T')[0],
                        user: user,
                        originCurrency: {
                            currencyId: cryptoFinal.currencyId
                        },
                        destinationCurrency: {
                            currencyId: 3
                        }
                    };
                    transactionData.transactionDate = new Date(transactionData.transactionDate);
                    await Transaction.createTransaction(transactionData);
                    console.log("Transacción creada correctamente.");
                    sellModal.hide();
                });

                async function getUser() {
                    try {
                        const userId = await User.getUserId();
                        const user = await User.getUserById(userId);
                        console.log(userId);
                        return user;
                    } catch (error) {
                        console.error('❌ Error al obtener el usuario:', error);
                        return null;
                    }
                }
            }
        });
    });
});



//     // ================================
//     // GRÁFICO DE EVOLUCIÓN DE PRECIOS
//     // ================================
//
//     async function loadHistory() {
//         try {
//             const history = await History.loadHistories();
//             return history;
//         } catch (error) {
//             console.error("Error fetching data from API:", error);
//             return null;
//         }
//     }
//
//     const histories = await loadHistory();
//     console.log(histories);
//
//
//     if (!histories) {
//         throw new Error("No se pudieron cargar los datos de historial.");
//     }
//
//     function loadPriceLabels() {
//         let priceLabels = [];
//         for (const history of histories) {
//             if (crypto.currencyId === history.currency.currencyId) {
//                 priceLabels.push(history.lastUpdated)
//             }
//         }
//         return priceLabels;
//     }
//     let priceLabels = await loadPriceLabels();
//
//
//     // Cargar datos para el gráfico
//     function loadInfo() {
//         let prices = [];
//         for (const history of histories) {
//             if (history.currency.currencyId === crypto.currencyId) {
//                 // Convertimos la fecha en timestamp para ECharts
//                 prices.push(history.currentPrice);
//             }
//         }
//         return prices;
//     }
//
//     let prices = await loadInfo();
//     console.log(priceLabels);
//     console.log(prices);
//
//     // Configurar gráfico con ECharts
//     const chartDom = document.getElementById('crypto-chart');
//     if (!chartDom) {
//         console.error("No se encontró el elemento #crypto-chart");
//         return;
//     }
//
//     const myChart = echarts.init(chartDom);
//
//     // Configurar opciones de ECharts
//     const option = {
//         tooltip: {
//             trigger: 'axis',
//             backgroundColor: 'rgba(255,255,255,0.9)',
//             borderColor: '#ddd',
//             borderWidth: 1,
//             textStyle: {color: '#000'},
//             formatter: function (params) {
//                 let date = new Date(params[0].data[0]).toLocaleDateString();
//                 let price = params[0].data[1].toLocaleString();
//                 return `<strong>Date:</strong> ${date}<br><strong>Price:</strong> $${price}`;
//             }
//         },
//         title: {
//             left: 'center',
//             text: 'Crypto Price Evolution',
//             textStyle: {color: 'rgb(6, 20, 40)'}
//         },
//         toolbox: {
//             feature: {
//                 restore: {},
//                 saveAsImage: {}
//             }
//         },
//         xAxis: {
//             type: 'time',
//             boundaryGap: false,
//             axisLabel: {color: 'rgb(6, 20, 40)'}
//         },
//         yAxis: {
//             type: 'value',
//             boundaryGap: [0, '100%'],
//             axisLabel: {
//                 formatter: function (value) {
//                     return `${value.toLocaleString()}$`;
//                 },
//                 color: 'rgb(6, 20, 40)'
//             }
//         },
//         dataZoom: [
//             {type: 'inside', start: 0, end: 20},
//             {start: 0, end: 20}
//         ],
//         series: [
//             {
//                 name: 'Crypto Price ($)',
//                 type: 'line',
//                 smooth: true,
//                 symbol: 'none',
//                 areaStyle: {color: 'rgba(6, 20, 40, 0.2)'},
//                 lineStyle: {color: 'rgb(6, 20, 40)', width: 2},
//                 itemStyle: {color: 'rgb(6, 20, 40)'},
//                 data: priceLabels.map((time, index) => [time, prices[index]])
//             }
//         ]
//     };
//
//     // Aplicar opciones al gráfico
//     myChart.setOption(option);
//     window.addEventListener('resize', () => myChart.resize());
//
// // ================================
// // GRÁFICO DE EVOLUCIÓN DE VOLUMEN
// // ================================
//
// // Obtenemos el contexto 2D del canvas para el gráfico de volumen.
//     const ctxVolume = document.getElementById('volume-chart-value').getContext('2d');
// // Usamos las mismas etiquetas (meses) para el eje X.
//     const volumeLabels = priceLabels;
// // Datos de volumen correspondientes a cada mes.
//     const volumes = [50000, 55000, 60000, 65000, 70000, 75000, 80000, 75000, 85000];
//
// // Creamos el gráfico de barras para el volumen.
//     new Chart(ctxVolume, {
//         type: 'bar', // Tipo de gráfico: 'bar' para barras.
//         data: {
//             labels: volumeLabels,
//             datasets: [{
//                 label: crypto.currency.name + 'Volume',                        // Etiqueta para la leyenda.
//                 data: volumes,                          // Datos del volumen.
//                 backgroundColor: 'rgba(6, 20, 40, 0.7)',  // Color de las barras.
//                 borderColor: 'rgb(6, 20, 40)',            // Color del borde de las barras.
//                 borderWidth: 1                          // Grosor del borde.
//             }]
//         },
//         options: {
//             responsive: true,
//             maintainAspectRatio: false,
//             scales: {
//                 x: {
//                     title: {display: true, text: 'Months'},
//                     ticks: {
//                         maxRotation: 45,
//                         minRotation: 30,
//                         autoSkip: true,
//                         maxTicksLimit: 8
//                     }
//                 },
//                 y: {
//                     title: {display: true, text: 'Volume'},
//                     beginAtZero: true,                       // El eje Y empieza en 0.
//                     ticks: {
//                         callback: function (value) {
//                             return value.toLocaleString();       // Formatea los números para mejor legibilidad.
//                         }
//                     }
//                 }
//             },
//             plugins: {
//                 tooltip: {
//                     enabled: true,
//                     backgroundColor: 'rgba(255,255,255,0.9)',
//                     titleColor: '#000',
//                     bodyColor: '#000',
//                     borderColor: '#ddd',
//                     borderWidth: 1
//                     // En este gráfico de volumen, no se han personalizado los callbacks, pero se pueden agregar de manera similar.
//                 }
//             }
//         }
//     });
//
//     async function recommended() {
//         try {
//             const coins = await Currency.getRecommendations();
//             let history = [];
//
//             // Usamos Promise.all para manejar múltiples llamadas async
//             history = await Promise.all(coins.map(async (coin) => {
//                 return await History.getLatestHistoryByCurrencyId(coin.currencyId);
//             }));
//
//             const top3Coins = history.slice(0, 3);
//             return top3Coins;
//
//         } catch (error) {
//             console.error(error);
//         }
//     }
//
//     const cryptoData = await recommended();
//     console.log(cryptoData);
//
//     // Seleccionamos el contenedor donde se insertarán las tarjetas
//     const container = document.getElementById("cryptoContainer");
//
//     // Iteramos sobre cada elemento del arreglo para generar las tarjetas
//     cryptoData.forEach(item => {
//         // Creamos un div que contendrá cada tarjeta
//         const colDiv = document.createElement("div");
//         colDiv.classList.add("col");
//
//         // Generamos el HTML interno usando template literals
//         colDiv.innerHTML = `
//     <div class="card p-4 text-center rounded-4 shadow-sm bg-white">
//         <div class="card-body d-flex flex-column justify-content-center text-center">
//             <h5 class="fw-bold">${item.currency.name}</h5>
//             <div class="d-flex align-items-center me-3 text-center justify-content-center">
//                 <img src="${item.currency.image}" alt="Logo de criptomoneda ${item.currency.name}" class="img-fluid me-3" style="max-height: 40px;">
//                 <h4 class="fw-bold text-dark">${item.currentPrice}</h4>
//             </div>
//             <div class="text-center ${item.priceChangePercentage24h < 0 ? 'text-danger' : 'text-success'} fw-bold">
//                 ${item.priceChangePercentage24h.toLocaleString()}%
//             </div>
//         </div>
//         <a href="infoCrypto.html?ticker=${item.currency.ticker}" class="btn btn-sell btn-sm w-100 mt-3 rounded-5">See More</a>
//     </div>
// `;
//         // Insertamos la tarjeta en el contenedor
//         container.appendChild(colDiv);
//     });