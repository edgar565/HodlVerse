document.addEventListener("DOMContentLoaded", async function () {
    let chartDom = document.getElementById("chart-container");
    const loadingMessageChart = document.getElementById('loadingMessageChart');
    loadingMessageChart.style.display = "flex";  // Mostrar el mensaje de carga


    if (!chartDom) {
        console.error("❌ No se encontró el contenedor del gráfico.");
        return;
    }

    let myChart = echarts.init(chartDom);

    async function fetchStartDate() {
        try {
            const userId = await User.getUserId(); // Obtener ID del usuario
            const game = await Game.getActiveGameByUserId(userId);
            return new Date(game.startDate);
        } catch (error) {
            console.error('❌ Error al obtener el usuario:', error);
            return null;
        }
    }

    function getLocalISODate(date) {
        return date.getFullYear() + '-' +
            String(date.getMonth() + 1).padStart(2, '0') + '-' +
            String(date.getDate()).padStart(2, '0');
    }

    const startDate = await fetchStartDate();
    if (!startDate) {
        console.error("❌ No se pudo obtener la fecha de inicio.");
        return;
    }

    const formattedStartDate = new Date(startDate);
    const isoDate = getLocalISODate(formattedStartDate);
    console.log("📅 Fecha de inicio:", isoDate);

    const endDate = new Date();

    function generateDateArray(start) {
        let dates = [];
        let current = new Date(start);
        while (current <= endDate) {
            dates.push(new Date(current)); // Guardamos la fecha como objeto Date
            current.setDate(current.getDate() + 1);
        }
        return dates;
    }

    const dateArray = generateDateArray(startDate);
    console.log("📅 Fechas generadas:", dateArray);

    async function fetchData() {
        try {
            const userId = await User.getUserId();

            // Usamos Promise.all() para esperar todas las promesas antes de continuar
            const data = await Promise.all(
                dateArray.map(async (date) => {
                    return await Wallet.getUserBalanceOnSpecificDate(userId, date);
                })
            );

            console.log("📊 Datos obtenidos:", data);
            return data;
        } catch (error) {
            console.error('❌ Error al obtener datos de balance:', error);
            return [];
        }
    }

    // Obtener valores de balance
    let balanceValues = await fetchData();

    if (balanceValues.length === 0) {
        console.error("❌ No se obtuvieron datos de balance.");
        return;
    }

    let data = [];

    for (let i = 0; i < dateArray.length; i++) {
        let time = dateArray[i].getTime(); // Convertimos la fecha a timestamp
        let value = balanceValues[i] ?? 0; // Si no hay valor, asignamos 0 por seguridad
        data.push([time, value]);
    }

    console.log("📊 Datos procesados para gráfico:", data);

    let option = {
        title: {
            text: 'Balance Evolution',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                let date = new Date(params[0].value[0]);
                let day = date.getDate().toString().padStart(2, '0');
                let month = (date.getMonth() + 1).toString().padStart(2, '0');
                let year = date.getFullYear();
                let value = params[0].value[1];

                return `${day}-${month}-${year} <br/> Balance: <b>$${value}</b>`;
            }
        },
        grid: {
            bottom: 95
        },
        xAxis: {
            type: 'time',
            name: 'Day',
            nameLocation: 'middle',
            nameTextStyle: {
                color: '#061428'
            },
            nameGap: 30,
            axisLabel: {
                formatter: function (value) {
                    return new Date(value).toLocaleDateString('es-ES', {day: '2-digit', month: 'short'});
                }
            }
        },
        yAxis: {
            type: 'value',
            name: 'Balance',
            nameLocation: 'middle',
            nameGap: 50,
            axisLabel: {
                formatter: function (value) {
                    return '$' + value;
                }
            }
        },
        dataZoom: [
            {type: 'inside', start: 0, end: 100},
            {start: 0, end: 100}
        ],
        series: [
            {
                type: 'line',
                symbol: 'none',
                lineStyle: {
                    color: '#061428',
                    width: 2
                },
                areaStyle: {
                    color: 'rgba(126, 172, 237, 0.3)'
                },
                data: data
            }
        ],
        toolbox: {
            show: true,
            feature: {
                restore: {},
                saveAsImage: {}
            }
        }
    };

    try {
        myChart.setOption(option);
    } catch (error) {
        console.error("❌ Error al cargar el gráfico:", error);
    }
    loadingMessageChart.style.color = 'transparent';

});


document.addEventListener("DOMContentLoaded", async function () {
    const calendarContainer = document.getElementById("calendar");
    const daysRemainingText = document.getElementById("daysRemaining");
    const timeRemainingText = document.getElementById("timeRemaining");
    const prevMonthButton = document.getElementById("prevMonth");
    const nextMonthButton = document.getElementById("nextMonth");

    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    const loadingMessageCalendar = document.getElementById('loadingMessageCalendar');
    loadingMessageCalendar.style.display = "flex";  // Mostrar el mensaje de carga


    async function fetchEndDate() {
        try {
            const userId = await User.getUserId();
            const game = await Game.getActiveGameByUserId(userId);
            return new Date(game.endDate);
        } catch (error) {
            console.error('❌ Error al obtener el usuario:', error);
            return null;
        }
    }

    async function fetchStartDate() {
        try {
            const userId = await User.getUserId();
            const game = await Game.getActiveGameByUserId(userId);
            return new Date(game.startDate);
        } catch (error) {
            console.error('❌ Error al obtener el usuario:', error);
            return null;
        }
    }

    const endDate = await fetchEndDate();
    const startDate = await fetchStartDate();
    console.log("📈 Fecha objetivo:", endDate);

    if (startDate && endDate) {
        currentMonth = startDate.getMonth();
        currentYear = startDate.getFullYear();
    }

    function updateCalendar(year, month) {
        calendarContainer.innerHTML = ''; // Limpiar el contenido

        // Crear el contenedor con CSS Grid
        calendarContainer.style.display = "grid";
        calendarContainer.style.gridTemplateColumns = "repeat(7, 1fr)";
        calendarContainer.style.gap = "5px"; // Espacio entre celdas

        // Crear la fila de nombres de los días de la semana
        const daysOfWeek = ["L", "M", "X", "J", "V", "S", "D"];
        daysOfWeek.forEach(day => {
            const dayElement = document.createElement("div");
            dayElement.classList.add("day-name");
            dayElement.textContent = day;
            calendarContainer.appendChild(dayElement);
        });

        // Obtener información del mes
        const firstDay = new Date(year, month, 1).getDay(); // Día de la semana del primer día del mes
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date();
        const currentDay = today.getDate();
        const markedDay = endDate.getDate();

        const targetDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 0, 0, 0);
        const timeDiff = targetDate - today;

        const remainingDays = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const remainingHours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const remainingMinutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

        daysRemainingText.textContent = `${remainingDays} Days`;
        timeRemainingText.textContent = `${remainingHours} hours, ${remainingMinutes} minutes`;

        // Ajustar el primer día del mes con celdas vacías
        for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
            const emptyElement = document.createElement("div");
            emptyElement.classList.add("empty-day");
            calendarContainer.appendChild(emptyElement);
        }

        // Crear los días del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement("div");
            dayElement.classList.add("day");
            dayElement.textContent = day;

            if (day < currentDay && year === today.getFullYear() && month === today.getMonth()) {
                dayElement.classList.add("past");
            } else if (day === currentDay && year === today.getFullYear() && month === today.getMonth()) {
                dayElement.classList.add("today");
            } else if (day === markedDay) {
                dayElement.classList.add("marked");
            } else {
                dayElement.classList.add("remaining");
            }

            calendarContainer.appendChild(dayElement);
        }

    }


    prevMonthButton.addEventListener("click", () => {
        if (currentYear > startDate.getFullYear() ||
            (currentYear === startDate.getFullYear() && currentMonth > startDate.getMonth())) {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            updateCalendar(currentYear, currentMonth);
        }
    });


    nextMonthButton.addEventListener("click", () => {
        if (new Date(currentYear, currentMonth + 1) <= endDate) {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            updateCalendar(currentYear, currentMonth);
        }
    });

    updateCalendar(currentYear, currentMonth);
    loadingMessageCalendar.style.color = "transparent";

});


document.addEventListener("DOMContentLoaded", function () {

    async function fetchTransactionsById() {
        try {
            const userId = await User.getUserId(); // Obtener ID del usuario
            console.log('✅ ID del usuario:', userId);

            const transactions = await Transaction.getLatestTransactionsByUserId(userId); // Obtener transacciones
            console.log('✅ Transacciones del usuario:', transactions);

            // Llenar la tabla con las transacciones
            populateTransactionTable(transactions);

        } catch (error) {
            console.error('❌ Error en fetchTransactionsById:', error);
        }
    }

    async function fetchTransactionsAllById() {
        try {
            const userId = await User.getUserId(); // Obtener ID del usuario
            console.log('✅ ID del usuario:', userId);

            const transactions = await Transaction.getTransactionsByUserId(userId); // Obtener transacciones
            console.log('✅ Transacciones todas del usuario:', transactions);

            // Llenar la tabla con las transacciones
            populateTransactionTableAll(transactions);

        } catch (error) {
            console.error('❌ Error en fetchTransactionsById:', error);
        }
    }

    fetchTransactionsById();
    fetchTransactionsAllById();

    function populateTransactionTable(transactions) {
        const tableBody = document.getElementById("transactionTableBody");
        tableBody.innerHTML = ""; // Limpiar la tabla antes de agregar datos

        transactions.forEach(transaction => {
            const row = document.createElement("tr");

            let badgeClass = "";
            switch (transaction.transactionType.toLowerCase()) {
                case "buy":
                    badgeClass = "badge-buy";
                    break;
                case "sell":
                    badgeClass = "badge-sell";
                    break;
                case "exchange":
                    badgeClass = "badge-exchange";
                    break;
                default:
                    badgeClass = "badge-secondary";
            }

            row.innerHTML = `
                <td class="col-4">
                    <img src="${transaction.destinationCurrency.image}" alt="Logo de ${transaction.destinationCurrency.name}" height="24">
                        <span class="fw-bold">${transaction.destinationCurrency.name}</span>
                </td>
                <td class="col-2 text-center">
                    <span class="badge ${badgeClass}">${transaction.transactionType}</span>
                </td>
                <td class="col-3 text-end">
                     <span class="text-dark">${transaction.destinationTransactionAmount.toLocaleString()}</span>
                </td>
                <td class="col-3 text-end">
                     <span class="text-dark">$${transaction.destinationUnitPrice.toLocaleString()}</span>
                </td>
            `;


            tableBody.appendChild(row);
        });

        console.log("✅ Tabla actualizada con transacciones.");
    }

    function populateTransactionTableAll(transactions) {
        const tableBody = document.getElementById("transactionTableBodyFull");
        tableBody.innerHTML = ""; // Limpiar la tabla antes de agregar datos
        const loadingMessageTransactions = document.getElementById('loadingMessageTransactions');


        transactions.forEach(transaction => {
            const row = document.createElement("tr");

            let badgeClass = "";
            switch (transaction.transactionType.toLowerCase()) {
                case "buy":
                    badgeClass = "badge-buy";
                    break;
                case "sell":
                    badgeClass = "badge-sell";
                    break;
                case "exchange":
                    badgeClass = "badge-exchange";
                    break;
                default:
                    badgeClass = "badge-secondary";
            }

            row.innerHTML = `
                <td class="col-4">
                    <img src="${transaction.destinationCurrency.image}" alt="Logo de ${transaction.destinationCurrency.name}" height="24">
                        <span class="fw-bold">${transaction.destinationCurrency.name}</span>
                </td>
                <td class="col-2 text-center">
                    <span class="badge ${badgeClass}">${transaction.transactionType}</span>
                </td>
                <td class="col-3 text-end">
                     <span class="text-dark">${transaction.destinationTransactionAmount.toLocaleString()}</span>
                </td>
                <td class="col-3 text-end">
                     <span class="text-dark">$${transaction.destinationUnitPrice.toLocaleString()}</span>
                </td>
            `;

            tableBody.appendChild(row);
        });

        loadingMessageTransactions.style.color = "transparent";

        console.log("✅ Tabla actualizada con transacciones.");
    }


});
document.addEventListener("DOMContentLoaded", async () => {
    let user;

    async function getCryptos() {
        try {
            const userId = await User.getUserId(); // Obtener ID del usuario
            user = await User.getUserById(userId);
            let currencies = await Wallet.getWalletsCurrenciesById(user.wallet.walletId);
            console.log(currencies);
            return currencies || []; // Retorna un array vacío si es null/undefined

        } catch (error) {
            console.error('❌ Error al obtener el usuario:', error);
            return []; // Devuelve un array vacío en caso de error
        }
    }

    const cryptos = await getCryptos();
    console.log(cryptos);

    async function getTotalValue() {
        try {
            let promises = cryptos.map(async (currency) => {
                const response = await $.ajax({
                    url: `/balances/total/${user.wallet.walletId}/${currency.currencyId}`,
                    type: 'GET'
                });
                return response; // Retorna el valor de la solicitud
            });

            let totalsValue = await Promise.all(promises); // Espera a que todas las promesas se resuelvan
            console.log("📊 totalValue cargado:", totalsValue);
            return totalsValue;
        } catch (error) {
            console.error('❌ Error al obtener los valores totales:', error);
            return [];
        }
    }

    let totalValue = await getTotalValue();
    console.log(totalValue);

    async function getValueFinal() {
        try {
            // Crear un array de promesas
            const promises = cryptos.map(async (currency) => {
                const currencyValue = await History.getLatestHistoryByCurrencyId(currency.currencyId);
                return currencyValue.currentPrice;
            });

            // Esperar a que todas las promesas se resuelvan
            const value = await Promise.all(promises);

            console.log(value);
            return value;
        } catch (error) {
            console.error('❌ Error al obtener los valores:', error);
            return []; // Devuelve un array vacío en caso de error
        }
    }


    let value = await getValueFinal();
    console.log(value);

    function calculateTotalValueForCurrency(value, totalValue) {
        let total = [];
        console.log(value.length);

        for (let i = 0; i < value.length; i++) {
            let price = Number(value[i])
            console.log(price);
            let balance = Number(totalValue[i])
            console.log(balance);

            let totalValuePerCurrency = price * balance;
            total.push(totalValuePerCurrency);
            console.log(price, balance);
        }

        console.log("📊 Total calculado por moneda:", total);
        return total;
    }


    let valueFinal = calculateTotalValueForCurrency(value, totalValue);
    console.log(valueFinal);

    // Verifica que cryptos sea un array antes de iterar
    if (!Array.isArray(cryptos)) {
        console.error("❌ Error: cryptos no es un array", cryptos);
        return;
    }

    const container = document.getElementById("cryptosContainer");

    let contador = 0;

    // Genera y añade una card para cada crypto
    function formatNumber(num) {
        if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
        if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
        if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
        return num.toFixed(2);
    }
    const loadingMessageYourCryptos = document.getElementById('loadingMessageYourCryptos');

// Mostrar el mensaje de carga
    loadingMessageYourCryptos.style.display = "flex";  // Mostrar el mensaje de carga

// Asumimos que 'cryptos', 'totalValue', 'valueFinal', 'contador' y 'formatNumber' ya están definidos previamente
    cryptos.forEach(crypto => {
        const card = document.createElement("div");
        card.classList.add("card", "crypto", "shadow-sm", "mb-2");

        let amount = totalValue[contador];
        let final = valueFinal[contador];

        card.innerHTML = `
        <div class="card-body d-flex align-items-center justify-content-between">
            <div>
                <h5 class="card-title fw-bold">${crypto.name}</h5>
                <h5 class="card-title text-dark">${formatNumber(final)}</h5>
                <div class="d-flex align-items-center gap-2">
                    <h6 class="text-muted fs-6">${crypto.ticker}</h6>
                    <h6 class="text-muted fs-6">${formatNumber(amount)}</h6>
                </div>
            </div>
            <img src="${crypto.image}" alt="${crypto.name}" height="55" class="ms-3">
        </div>
    `;

        container.appendChild(card);
        contador++;
    });

    await checkGame();

// Usar setTimeout para asegurar que el mensaje de carga desaparezca después de que se terminen de agregar los datos
        loadingMessageYourCryptos.style.color = "transparent";  // Ocultar el mensaje de carga

});
async function checkGame() {
    const loadingMessage = document.getElementById("loadingMessageGame");
    loadingMessage.style.display = "flex"; // Mostrar pantalla de carga

    const userId = await User.getUserId();
    const game = await Game.getActiveGameByUserId(userId);

    if (game == null) {
        window.location.href = "createGame.html";
    } else {
        console.log("Hay un game activo.");
        loadingMessage.style.opacity = "0"; // Ocultar pantalla de carga
        loadingMessage.style.pointerEvents = "none";// Oculta el mensaje de carga solo si hay datos
    }


}