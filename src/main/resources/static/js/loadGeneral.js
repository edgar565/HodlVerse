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

    async function fetchInfo() {
        try {
            const totalMarket = await History.getTotalMarketCap();
            const totalVolume = await History.getTotalVolume();

            // Seleccionamos todos los elementos con la clase "marketCapValue"
            const marketCapElements = document.querySelectorAll(".marketCapValue");
            if (marketCapElements.length > 0) {
                marketCapElements.forEach(el => {
                    el.innerHTML = totalMarket.toLocaleString() + "$";
                });
            } else {
                console.warn('⚠️ Elemento(s) con clase "marketCapValue" no encontrado(s) en el DOM');
            }

            // Seleccionamos todos los elementos con la clase "trendingCoinsValue"
            const trendingCoinsElements = document.querySelectorAll(".trendingCoinsValue");
            if (trendingCoinsElements.length > 0) {
                trendingCoinsElements.forEach(el => {
                    el.innerHTML = totalVolume.toLocaleString() + "$";
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
async function search(name){
    try{
        const data = await Currency.search(name);
        return data;
    } catch (error) {
        console.error('❌ Error al obtener los valores:', error);
        return []; // Devuelve un array vacío en caso de error
    }
}
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.querySelector('.search input[type="search"]');
    const searchResultsDropdown = document.getElementById('searchResultsDropdown');

    searchInput.addEventListener('input', async function () {
        const searchTerm = searchInput.value.trim();
        if (searchTerm.length > 0) {
            const results = await search(searchTerm);
            displaySearchResults(results);
        } else {
            searchResultsDropdown.classList.remove('show');
            searchResultsDropdown.innerHTML = ''; // Limpiar resultados si el input está vacío
        }
    });

    searchInput.addEventListener('focus', function () {
        if (searchInput.value.trim().length > 0) {
            searchResultsDropdown.classList.add('show');
        }
    });

    searchInput.addEventListener('blur', function () {
        setTimeout(() => {
            searchResultsDropdown.classList.remove('show');
        }, 200);
    });

    function displaySearchResults(currencies) {
        searchResultsDropdown.innerHTML = ''; // Limpiar resultados anteriores
        if (currencies.length === 0) {
            searchResultsDropdown.innerHTML = '<div class="dropdown-item">No results found.</div>';
            return;
        }

        currencies.forEach(currency => {
            const item = document.createElement('div');
            item.classList.add('dropdown-item');
            item.innerHTML = `
                <img src="${currency.image}" alt="${currency.name}" height="20">
                <span>${currency.name} (${currency.ticker})</span>
            `;
            item.addEventListener('click', function () {
                // Redirigir a una página específica, por ejemplo, a una página de detalles de la criptomoneda
                window.location.href = `infoCrypto.html?ticker=${currency.ticker}`; // Ajusta la URL según tu estructura
            });
            searchResultsDropdown.appendChild(item);
        });

        searchResultsDropdown.classList.add('show');
    }
});