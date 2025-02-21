document.addEventListener("DOMContentLoaded", async function () {
    const toggleSwitch = document.getElementById("toggleRankingSwitch");

    if (!toggleSwitch) {
        console.error("No se encontró el switch.");
        return;
    }

    toggleSwitch.addEventListener("click", function () {
        console.log("Switch clicked!"); // Para comprobar que el evento funciona
        const rankingSection = document.getElementById("rankingCards");

        if (!rankingSection) {
            console.error("No se encontró la sección de rankings.");
            return;
        }

        // Si el switch está activado, se muestra la sección; si no, se oculta.
        if (this.checked) {
            rankingSection.classList.remove("d-none");
            this.nextElementSibling.textContent = "Hide Rankings";
        } else {
            rankingSection.classList.add("d-none");
            this.nextElementSibling.textContent = "Show Rankings";
        }
    });

    function listas(lista, value) {
        lista.innerHTML = "";
        value.forEach(coin => {
            let li = document.createElement("li");
            li.classList.add("row", "py-1", "mt-2", "mb-2", "card-item");
            li.innerHTML = `
                <div class="col-6" onclick="window.location.href='infoCrypto.html?ticker=${coin.currency.ticker}'" style="cursor:pointer;">
                    <img src="${coin.currency.image}" alt="Logo de ${coin.currency.name}" height="24" class="me-2">${coin.currency.name}
                </div>
                <div class="col-3 text-end">${coin.currentPrice.toLocaleString()}$</div>
                <div class="col-3 text-end ${coin.priceChangePercentage24h < 0 ? 'text-danger' : 'text-success'} fw-bold">${coin.priceChangePercentage24h.toLocaleString()}%</div>
                `;
            lista.appendChild(li);
        });
    }

    async function trendingCoins() {
        try {
            const coins = await History.getTrendingCoins();
            const top5Coins = coins.slice(0, 5);
            console.log(top5Coins);
            let lista = document.getElementById("top-trending-list");
            listas(lista, top5Coins);
        } catch (error) {
            console.error(error);
        }
    }

    trendingCoins();

    async function topLosers() {
        try {
            const coins = await History.getTopLosers();
            const top5Coins = coins.slice(0, 5);
            console.log(top5Coins);
            let lista = document.getElementById("top-losers-list");
            listas(lista, top5Coins);
        } catch (error) {
            console.error(error);
        }
    }

    topLosers();

    async function topWinners() {
        try {
            const coins = await History.getTopWinners();
            const top5Coins = coins.slice(0, 5);
            console.log(top5Coins);
            let lista = document.getElementById("top-winners-list");
            listas(lista, top5Coins);
        } catch (error) {
            console.error(error);
        }
    }

    topWinners();

    async function highestVolume() {
        try {
            const coins = await History.getHighestVolume();
            const top5Coins = coins.slice(0, 5); // Tomar solo las 5 con mayor volumen
            console.log(top5Coins);

            let lista = document.getElementById("highest-volume-list");
            lista.innerHTML = ""; // Limpiar la lista antes de agregar nuevos elementos

            top5Coins.forEach(coin => {
                let li = document.createElement("li");
                li.classList.add("row", "py-1", "mt-2", "mb-2", "card-item");

                li.innerHTML = `
                <div class="col-6 d-flex align-items-center" onclick="window.location.href='infoCrypto.html?ticker=${coin.currency.ticker}'" style="cursor:pointer;">
                    <img src="${coin.currency.image}" alt="Logo de ${coin.currency.name}" height="24" class="me-2">
                    <span>${coin.currency.name} (${coin.currency.ticker.toUpperCase()})</span>
                </div>
                <div class="col-6 text-end fw-bold">
                    ${coin.totalVolume.toLocaleString()}$
                </div>
            `;

                lista.appendChild(li);
            });

        } catch (error) {
            console.error("Error al obtener las criptomonedas con mayor volumen:", error);
        }
    }

    highestVolume();



    // ================================
    // TABLA DE CRIPTOMONEDAS
    // ================================

    async function fetchCryptoData() {
        try {
            const cryptos = await Currency.loadCurrencies();
            console.log(cryptos);
            return cryptos;
        } catch (error) {
            console.error("Error fetching data from API:", error);
            return null;
        }
    }

    const cryptos = await fetchCryptoData();

    async function fechtCryptoHistory() {
        try {
            let history = [];
            for (const crypto of cryptos) {
                history.push(await History.getLatestHistoryByCurrencyId(crypto.currencyId));
            }
            console.log(history);
            return history;
        } catch (error) {
            console.error("Error fetching data from API:", error);
            return null;
        }
    }

    const history = await fechtCryptoHistory();

    async function updateCryptoTable() {
        try {
            let tableBody = document.getElementById("cryptoTableBody");
            tableBody.innerHTML = ""; // Limpiar la tabla antes de actualizarla

            let contador = 1;
            // Iterar sobre cada criptomoneda
            for (const coin of history) {

                // Construir la fila de la tabla con los datos calculados
                let row = `
                <tr>
                    <td class="sticky-col start-0 text-end">${contador}</td>
                    <td class="sticky-col start-0 text-start" style="cursor:pointer;"><div onclick="window.location.href='infoCrypto.html?ticker=${coin.currency.ticker}'"><img src="${coin.currency.image}" height="24" alt="Icono de " ${coin.currency.name}> ${coin.currency.name} (${coin.currency.ticker.toUpperCase()})</div></td>
                    <td class="text-end">${coin.currentPrice.toLocaleString()}$</td>
                    <td class="text-end fw-bold ${coin.priceChangePercentage24h < 0 ? 'text-danger' : 'text-success'}">${coin.priceChangePercentage24h.toLocaleString()}%</td>
                    <td class="text-end">${coin.totalVolume.toLocaleString()}$</td>
                    <td class="text-end">${coin.marketCap.toLocaleString()}$</td>
                </tr>
            `;
                tableBody.innerHTML += row;
                contador++;
            }

        } catch (error) {
            console.error("Error al obtener datos:", error);
        }
    }

    updateCryptoTable();
    setInterval(updateCryptoTable, 300000); // Actualiza cada 5 min

});
document.getElementById("trendingCoins").addEventListener("click" , function () {
    window.location.href = "rankings.html?nameRanking=trendingCoins";
});
document.getElementById("topLosers").addEventListener("click" , function () {
    window.location.href = "rankings.html?nameRanking=topLosers";
});
document.getElementById("topWinners").addEventListener("click" , function () {
    window.location.href = "rankings.html?nameRanking=topWinners";
});
document.getElementById("highestVolume").addEventListener("click" , function () {
    window.location.href = "rankings.html?nameRanking=highestVolume";
});