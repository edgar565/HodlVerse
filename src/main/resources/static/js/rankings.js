async function fetchCryptoData() {
    const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&sparkline=true");
    const data = await response.json();
    try {
        const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&sparkline=true");
        const data = await response.json();
        console.log(data); // Verifica que la respuesta es correcta
        const rankingData = data.map(coin => ({
            rank: coin.market_cap_rank,
            coin: coin.name,
            id: coin.id,
            logo: coin.image,
            price: `$${coin.current_price.toLocaleString()}`,
            marketCap: `$${coin.market_cap.toLocaleString()}`,
            change: `${coin.price_change_percentage_7d_in_currency.toFixed(2)}%`,
            trend: `https://www.coingecko.com/coins/${coin.id}/sparkline.svg`
        }));
        renderTable(rankingData);
    } catch (error) {
        console.error("Error fetching data from API:", error); // En caso de error
    }

    const rankingData = data.map(coin => ({
        rank: coin.market_cap_rank,
        coin: coin.name,
        id: coin.id,
        logo: coin.image,
        price: `$${coin.current_price.toLocaleString()}`,
        marketCap: `$${coin.market_cap.toLocaleString()}`,
        change: `${coin.price_change_percentage_7d_in_currency.toFixed(2)}%`,
        trend: `https://www.coingecko.com/coins/${coin.id}/sparkline.svg`
    }));

    renderTable(rankingData);
}

function renderTable(rankingData) {
    const rankingTable = document.getElementById("rankingCards");
    rankingTable.innerHTML = ''; // Limpiar tabla antes de renderizar

    rankingData.forEach(item => {
        const row = `
        <tr>
            <td>${item.rank}</td>
            <td>
                <div class="d-flex align-items-center">
                    <img src="${item.logo}" alt="${item.coin}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; margin-right: 8px;">
                    <span>${item.coin}</span>
                </div>
            </td>
            <td>${item.price}</td>
            <td>${item.marketCap}</td>
            <td class="${item.change.includes('-') ? 'text-danger' : 'text-success'}">
                ${item.change}
            </td>
            <td>
                <img src="${item.trend}" alt="trend" class="trend-chart" style="width: 50px; height: 25px;">
            </td>
        </tr>
        `;
        rankingTable.innerHTML += row;
    });
}

fetchCryptoData();
