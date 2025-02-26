async function fetchCryptoData(ticker) {
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

async function loadCryptoInfo(cryptoFinal) {
    try {
        const crypto = await History.getLatestHistoryByCurrencyId(cryptoFinal.currencyId);
        return crypto;
    } catch (error) {
        console.error("Error fetching data from API:", error);
        return null;
    }
}

async function loadHistoryByCurrency(cryptoFinal) {
    console.log(cryptoFinal);
    if (!cryptoFinal) {
        throw new Error("cryptoFinal is undefined or null");
    }
    try {
        const histories = await History.getLatestHistoryByCurrency(cryptoFinal.currencyId);
        return histories;
    } catch (error) {
        console.error("Error fetching data from API:", error);
        return null;
    }
}

async function showCharts(histories) {
    console.log(histories);

    // Gráfico de las últimas 24 horas (Precio)
    let last24HoursPriceData = histories
        .filter(history => {
            const date = new Date(history.lastUpdated);
            const now = new Date();
            return Math.abs(now - date) <= 24 * 60 * 60 * 1000; // 24 horas en milisegundos
        })
        .map(history => [new Date(history.lastUpdated).getTime(), history.currentPrice]);

    let last24HoursVolumeData = histories
        .filter(history => {
            const date = new Date(history.lastUpdated);
            const now = new Date();
            return Math.abs(now - date) <= 24 * 60 * 60 * 1000; // 24 horas en milisegundos
        })
        .map(history => [new Date(history.lastUpdated).getTime(), history.totalVolume]);

    let last24HoursPriceOption = {
        tooltip: {
            trigger: 'axis',
            position: function (pt) {
                return [pt[0], '10%'];
            }
        },
        title: {
            left: 'center',
            text: 'Crypto Price Chart (Last 24 Hours)'
        },
        toolbox: {
            feature: {
                restore: {},
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'time',
            boundaryGap: false
        },
        yAxis: {
            type: 'value',
            boundaryGap: [0, '100%']
        },
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100
            },
            {
                start: 0,
                end: 100
            }
        ],
        series: [
            {
                name: 'Crypto Price',
                type: 'line',
                smooth: true,
                symbol: 'none',
                areaStyle: {},
                data: last24HoursPriceData
            }
        ]
    };

    let last24HoursVolumeOption = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'time',
            boundaryGap: false
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: 'Volume',
                type: 'bar',
                barWidth: '60%',
                data: last24HoursVolumeData.map(item => item[1])
            }
        ]
    };

    // Gráfico diario (Precio)
    let dailyDataMap = new Map();
    histories.forEach(history => {
        let date = new Date(history.lastUpdated).toISOString().split('T')[0];
        if (!dailyDataMap.has(date) || new Date(history.lastUpdated) > new Date(dailyDataMap.get(date)[0])) {
            dailyDataMap.set(date, [new Date(history.lastUpdated).getTime(), history.currentPrice]);
        }
    });

    let dailyPriceData = Array.from(dailyDataMap.values());

    let dailyPriceOption = {
        tooltip: {
            trigger: 'axis',
            position: function (pt) {
                return [pt[0], '10%'];
            }
        },
        title: {
            left: 'center',
            text: 'Crypto Price Chart (Daily)'
        },
        toolbox: {
            feature: {
                restore: {},
                saveAsImage: {}
            }
        },
        xAxis: {
            type: 'time',
            boundaryGap: false
        },
        yAxis: {
            type: 'value',
            boundaryGap: [0, '100%']
        },
        dataZoom: [
            {
                type: 'inside',
                start: 0,
                end: 100
            },
            {
                start: 0,
                end: 100
            }
        ],
        series: [
            {
                name: 'Crypto Price',
                type: 'line',
                smooth: true,
                symbol: 'none',
                areaStyle: {},
                data: dailyPriceData
            }
        ]
    };

    // Gráfico diario (Volumen)
    let dailyVolumeDataMap = new Map();
    histories.forEach(history => {
        let date = new Date(history.lastUpdated).toISOString().split('T')[0];
        if (!dailyVolumeDataMap.has(date) || new Date(history.lastUpdated) > new Date(dailyVolumeDataMap.get(date)[0])) {
            dailyVolumeDataMap.set(date, [new Date(history.lastUpdated).getTime(), history.totalVolume]);
        }
    });

    let dailyVolumeData = Array.from(dailyVolumeDataMap.values());

    let dailyVolumeOption = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: dailyVolumeData.map(item => new Date(item[0]).toISOString().split('T')[0]),
            axisTick: {
                alignWithLabel: true
            }
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: 'Volume',
                type: 'bar',
                barWidth: '60%',
                data: dailyVolumeData.map(item => item[1])
            }
        ]
    };

    // Inicializar los gráficos con ECharts
    const last24HoursPriceChartDom = document.getElementById('last24HoursChart');
    const dailyPriceChartDom = document.getElementById('dailyPriceChart');
    const last24HoursVolumeChartDom = document.getElementById('volume-chart-value');
    const dailyVolumeChartDom = document.getElementById('dailyChartVolume');

    if (last24HoursPriceChartDom) {
        const last24HoursPriceChart = echarts.init(last24HoursPriceChartDom);
        last24HoursPriceChart.setOption(last24HoursPriceOption);
    } else {
        console.error("Element with id 'last24HoursChart' not found.");
    }

    if (dailyPriceChartDom) {
        const dailyPriceChart = echarts.init(dailyPriceChartDom);
        dailyPriceChart.setOption(dailyPriceOption);
    } else {
        console.error("Element with id 'dailyPriceChart' not found.");
    }

    if (last24HoursVolumeChartDom) {
        const last24HoursVolumeChart = echarts.init(last24HoursVolumeChartDom);
        last24HoursVolumeChart.setOption(last24HoursVolumeOption);
    } else {
        console.error("Element with id 'volume-chart-value' not found.");
    }

    if (dailyVolumeChartDom) {
        const dailyVolumeChart = echarts.init(dailyVolumeChartDom);
        dailyVolumeChart.setOption(dailyVolumeOption);
    } else {
        console.error("Element with id 'dailyChartVolume' not found.");
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const ticker = urlParams.get('ticker');

    let cryptoFinal = await fetchCryptoData(ticker);
    const crypto = await loadCryptoInfo(cryptoFinal);
    let histories = await loadHistoryByCurrency(cryptoFinal);
    showCharts(histories);

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
    document.getElementById("price-change").classList.add(crypto.priceChangePercentage24h > 0 ? "text-success" : "text-danger", "price-change");
    document.getElementById("price-change").innerText = crypto.priceChangePercentage24h > 0 ? "▲ " + crypto.priceChangePercentage24h.toFixed(2) + "%" : "▼ " + crypto.priceChangePercentage24h.toFixed(2) + "%";

    async function recommended() {
        try {
            const coins = await Currency.getRecommendations();
            let history = [];

            history = await Promise.all(coins.map(async (coin) => {
                return await History.getLatestHistoryByCurrencyId(coin.currencyId);
            }));

            const top3Coins = history.slice(0, 3);
            return top3Coins;

        } catch (error) {
            console.error(error);
        }
    }

    const cryptoData = await recommended();
    console.log(cryptoData);

    const container = document.getElementById("cryptoContainer");

    cryptoData.forEach(item => {
        const colDiv = document.createElement("div");
        colDiv.classList.add("col");

        colDiv.innerHTML = `
            <div class="card p-4 text-center rounded-4 shadow-sm bg-white">
                <div class="card-body d-flex flex-column justify-content-center text-center">
                    <h5 class="fw-bold">${item.currency.name}</h5>
                    <div class="d-flex align-items-center me-3 text-center justify-content-center">
                        <img src="${item.currency.image}" alt="Logo de criptomoneda ${item.currency.name}" class="img-fluid me-3" style="max-height: 40px;">
                        <h4 class="fw-bold text-dark">${item.currentPrice}</h4>
                    </div>
                    <div class="text-center ${item.priceChangePercentage24h < 0 ? 'text-danger' : 'text-success'} fw-bold">
                        ${item.priceChangePercentage24h.toLocaleString()}%
                    </div>
                </div>
                <a href="infoCrypto.html?ticker=${item.currency.ticker}" class="btn btn-sell btn-sm w-100 mt-3 rounded-5">See More</a>
            </div>
        `;
        container.appendChild(colDiv);
    });
});

let actionType = '';
const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
const buyModal = new bootstrap.Modal(document.getElementById('buyModal'));
const sellModal = new bootstrap.Modal(document.getElementById('sellModal'));

document.getElementById('buy-btn').addEventListener('click', function () {
    actionType = 'buy';
    checkUser(actionType);
});

document.getElementById('sell-btn').addEventListener('click', function () {
    actionType = 'sell';
    checkUser(actionType);
});

async function checkUser(actionType) {
    async function getUserId() {
        try {
            const userId = await User.getUserId();
            console.log(userId);
            user = await User.getUserById(userId);
            return userId;
        } catch (error) {
            console.error('❌ Error al obtener el usuario:', error);
            return null;
        }
    }

    let userId = await getUserId();
    console.log(user);
    if (userId) {
        confirmationModal.show();
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
            alert('Purchase confirmed!');
            buyModal.hide();
        });

        document.getElementById('confirm-sell').addEventListener('click', function () {
            alert('Sale confirmed!');
            sellModal.hide();
        });
    }
}

async function confirmBuy() {
    const query = window.location.search;
    const urlParams = new URLSearchParams(query);
    const ticker = urlParams.get('ticker');

    let cryptoFinal = await fetchCryptoData(ticker);
    const crypto = await loadCryptoInfo(cryptoFinal);

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
}