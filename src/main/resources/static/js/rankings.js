document.addEventListener('DOMContentLoaded', async function () {
    // ================================
    // OBTENER DATOS DE LA CRYPTO
    // ================================
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const nameRanking = urlParams.get('nameRanking');

    if (nameRanking === "trendingCoins") {
        trendingCoins();
    } else if (nameRanking === "topLosers") {
        topLosers();
    } else if (nameRanking === "topWinners") {
        topWinners();
    } else if (nameRanking === "highestVolume") {
        highestVolume();
    }

    function loadTable(coins) {
        const tableBody = document.getElementById("rankingTable");
        tableBody.innerHTML = ""; // Limpiar contenido anterior
        coins.forEach((coin, index) => {
            let row = document.createElement("tr");

            row.innerHTML = `
            <td class="sticky-col start-0 text-end">${index + 1}</td>
            <td onclick="window.location.href='infoCrypto.html?ticker=${coin.currency.ticker}'" style="cursor:pointer;" class="sticky-col start-0 text-start">
                <img src="${coin.currency.image}" alt="Logo de ${coin.currency.name}" height="24" class="me-2">
                ${coin.currency.name} (${coin.currency.ticker.toUpperCase()})
            </td>
            <td class="text-end">${coin.currentPrice.toLocaleString()}$</td>
            <td class="${coin.priceChangePercentage24h < 0 ? 'text-danger' : 'text-success'} fw-bold text-end">
                ${coin.priceChangePercentage24h.toFixed(2)}%
            </td>
            <td class="text-end">${coin.marketCap.toLocaleString()}$</td>
            <td class="text-end">${coin.totalVolume.toLocaleString()}$</td>
        `;
            tableBody.appendChild(row);
        });
    }

    function loadName(name, message){
        const nameElements = document.querySelectorAll(".breadcrumbNamePage");
        nameElements.forEach(el => {
            el.innerHTML = name;
        });
        document.title = name + " - HodlVerse";
        document.getElementById("message").innerHTML = message;
    }

    async function trendingCoins() {
        let name = "Trending Coins";
        let message = "Discover the hottest cryptocurrencies trending right now, driven by market activity and user interest.";
        loadName(name, message);
        try {
            const coins = await History.getTrendingCoins();
            loadTable(coins);
        } catch (error) {
            console.error(error);
        }
    }

    async function topLosers() {
        let name = "Top Losers";
        let message = "Explore the biggest market drops of the day, highlighting cryptocurrencies with the steepest declines in value.";
        loadName(name, message);
        try {
            const coins = await History.getTopLosers();
            loadTable(coins);
        } catch (error) {
            console.error(error);
        }
    }

    async function topWinners() {
        let name = "Top Winners";
        let message = "Check out the top-performing cryptocurrencies, showcasing the biggest price surges in the market today.";
        loadName(name, message);
        try {
            const coins = await History.getTopWinners();
            loadTable(coins);
        } catch (error) {
            console.error(error);
        }
    }
    async function highestVolume() {
        let name = "Highest Volume";
        let message = "Uncover the most traded cryptocurrencies, ranked by trading volume and market liquidity.";
        loadName(name, message);
        try {
            const coins = await History.getHighestVolume();
            loadTable(coins);
        } catch (error) {
            console.error(error);
        }
    }
});