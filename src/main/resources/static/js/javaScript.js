document.getElementById("dropdownMenu").addEventListener("click", function (event) {
    window.location.href = "highlights.html";
});

document.addEventListener("DOMContentLoaded", () => {
    const carousel = document.querySelector(".awards-carousel");
    const itemsWrapper = document.querySelector(".awards-items-wrapper");
    const items = Array.from(document.querySelectorAll(".awards-item"));

    // Función para duplicar elementos y garantizar desplazamiento continuo
    function duplicateItems() {
        const carouselWidth = carousel.offsetWidth;

        while (itemsWrapper.scrollWidth < carouselWidth * 10) {
            items.forEach(item => {
                const clone = item.cloneNode(true);
                itemsWrapper.appendChild(clone);
            });
        }
    }

    // Llama a la función para garantizar suficientes elementos
    duplicateItems();

    let scrollSpeed = 1; // Ajusta la velocidad de desplazamiento

    function scrollCarousel() {
        carousel.scrollLeft += scrollSpeed;

        // Si el primer conjunto de elementos sale completamente de la vista, se reposiciona
        if (carousel.scrollLeft >= itemsWrapper.scrollWidth / 2) {
            carousel.scrollLeft -= itemsWrapper.scrollWidth / 2;
        }
    }

    // Inicia el desplazamiento continuo
    setInterval(scrollCarousel, 80);
});

document.addEventListener("DOMContentLoaded", () => {
    const offcanvas = document.querySelector("#offcanvasRight");

    // Escuchar el evento `show.bs.collapse` para detectar cuándo se abre un dropdown
    offcanvas.addEventListener("show.bs.collapse", (event) => {
        // Seleccionar todas las secciones colapsables dentro del offcanvas
        const dropdowns = offcanvas.querySelectorAll(".collapse");

        // Cerrar todas las secciones excepto la que se está abriendo
        dropdowns.forEach((dropdown) => {
            if (dropdown !== event.target) {
                bootstrap.Collapse.getOrCreateInstance(dropdown).hide();
            }
        });
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const button = document.getElementById("dropdownButton");
    const menu = document.getElementById("dashboard-collapse");

    button.addEventListener("mouseenter", function () {
        menu.classList.add("show"); // Abre el menú
    });

    menu.addEventListener("mouseleave", function () {
        menu.classList.remove("show"); // Cierra el menú al salir
    });

    // Opcional: Cerrar el menú si el mouse sale del botón y menú
    button.addEventListener("mouseleave", function () {
        setTimeout(() => {
            if (!menu.matches(":hover")) {
                menu.classList.remove("show");
            }
        }, 200);
    });

    function formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    async function fetchInfo() {
        try {
            const totalMarket = await History.getTotalMarketCap();
            const totalVolume = await History.getTotalVolume();

            // Seleccionamos todos los elementos con la clase "marketCapValue"
            const marketCapElements = document.querySelectorAll(".marketCapValue");
            if (marketCapElements.length > 0) {
                marketCapElements.forEach(el => {
                    el.innerHTML = formatCurrency(totalMarket);
                });
            } else {
                console.warn('⚠️ Elemento(s) con clase "marketCapValue" no encontrado(s) en el DOM');
            }

            // Seleccionamos todos los elementos con la clase "trendingCoinsValue"
            const trendingCoinsElements = document.querySelectorAll(".trendingCoinsValue");
            if (trendingCoinsElements.length > 0) {
                trendingCoinsElements.forEach(el => {
                    el.innerHTML = formatCurrency(totalVolume);
                });
            } else {
                console.warn('⚠️ Elemento(s) con clase "trendingCoinsValue" no encontrado(s) en el DOM');
            }

        } catch (error) {
            console.error('❌ Error en fetchInfo:', error);
        }
    }

    fetchInfo();

    function dominance(coins) {
        let topCoins = coins.slice(0, 2);
        let text = "";
        let text2 = "";

        topCoins.forEach((coin, index) => {
            // Obtenemos el valor numérico del porcentaje
            let percentageValue = coin.priceChangePercentage24h;
            // Dependiendo del valor, asignamos la clase CSS adecuada
            let percentageClass = percentageValue < 0 ? 'text-danger' : 'text-success';
            // Creamos el HTML que incluye el span con la clase correspondiente y el símbolo %
            let percentageDisplay = `<span class="${percentageClass}">${percentageValue.toFixed(1)}%</span>`;

            if (index === 0) {
                text = coin.currency.ticker.toUpperCase() + " " + percentageDisplay;
            } else {
                text2 = coin.currency.ticker.toUpperCase() + " " + percentageDisplay;
            }
        });

        let textFinal = text + " / " + text2;
        const dominanceElements = document.querySelectorAll(".dominance");
        dominanceElements.forEach(el => {
            el.innerHTML = textFinal;
        });
    }

    async function trendingCoins() {
        try {
            const coins = await History.getTrendingCoins();
            const top5Coins = coins.slice(0, 5);
            dominance(top5Coins);
        } catch (error) {
            console.error(error);
        }
    }
    trendingCoins();

});
let currentPage = 1; // Página actual

function getDateSevenDaysAgo() {
    let date = new Date();
    date.setDate(date.getDate() - 7);  // Restar 7 días
    let day = ("0" + date.getDate()).slice(-2);
    let month = ("0" + (date.getMonth() + 1)).slice(-2); // Los meses empiezan desde 0
    let year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

async function fetchCryptoData7Days(coin) {
    // Obtener los datos históricos de la moneda en los últimos 7 días
    let historicalData = await fetch(`https://api.coingecko.com/api/v3/coins/${coin.id}/history?date=${getDateSevenDaysAgo()}&localization=false&x_cg_demo_api_key=CG-znytHBgZBqGquS3aSyJMhuHA`);
    let historicalPriceData = await historicalData.json();
    return historicalPriceData;
}

async function fetchCryptoData() {
    try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=40&page=${currentPage}&x_cg_demo_api_key=CG-znytHBgZBqGquS3aSyJMhuHA`);
        const data = await response.json();

        console.log("Datos obtenidos:", data); // Para depuración

        let tableBody = document.getElementById("cryptoTableBody");
        tableBody.innerHTML = ""; // Limpiar la tabla antes de actualizarla

        // Iterar sobre cada criptomoneda
        for (const coin of data) {
            // Obtener los datos históricos de la moneda (cambio en 7 días)
            let historicalPriceData = await fetchCryptoData7Days(coin);

            // Calcular cambio en 1 hora manualmente
            let price1hAgo = coin.current_price / (1 + coin.price_change_percentage_24h / 100);
            let change1h = ((coin.current_price - price1hAgo) / price1hAgo) * 100;

            // Calcular cambio en 24 horas
            let change24h = coin.price_change_percentage_24h?.toFixed(1) ?? "N/A";
            let class1h = change1h < 0 ? 'text-danger' : 'text-success';
            let class24h = change24h < 0 ? 'text-danger' : 'text-success';

            // Calcular cambio en 7 días (usando los datos históricos)
            let price7dAgo = historicalPriceData.market_data?.current_price?.usd;
            let change7d = price7dAgo ? ((coin.current_price - price7dAgo) / price7dAgo) * 100 : 0;
            let class7d = change7d < 0 ? 'text-danger' : 'text-success';

            // Construir la fila de la tabla con los datos calculados
            let row = `
                <tr>
                    <td class="text-end">${coin.market_cap_rank}</td>
                    <td class="sticky-col start-0 text-start"><img src="${coin.image}" height="24"> ${coin.name} (${coin.symbol.toUpperCase()})</td>
                    <td class="text-end">${coin.current_price.toLocaleString()} $</td>
                    <td class="${class1h}">${change1h.toFixed(1)}%</td>
                    <td class="${class24h}">${change24h}%</td>
                    <td class="${class7d}">${change7d.toFixed(1)}%</td>
                    <td class="text-end">${coin.total_volume.toLocaleString()} $</td>
                    <td class="text-end">${coin.market_cap.toLocaleString()} $</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        }

        // Actualizar número de página
        document.getElementById("currentPage").innerText = currentPage;

    } catch (error) {
        console.error("Error al obtener datos:", error);
    }
}

function changePage(direction) {
    if (direction === -1 && currentPage > 1) {
        currentPage--; // Retroceder página
    } else if (direction === 1) {
        currentPage++; // Avanzar página
    }
    fetchCryptoData(); // Recargar datos con la nueva página
}

fetchCryptoData();
setInterval(fetchCryptoData, 60000); // Actualiza cada 60s
