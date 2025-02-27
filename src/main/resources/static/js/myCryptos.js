let user;  // Declaramos 'user' a nivel global para poder acceder a él desde cualquier parte.
let currencies;  // Definimos 'currencies' globalmente para que pueda ser utilizada en distintas funciones.
let value = [];  // Variable global para almacenar los valores de las criptos.

async function getCryptos() {
    try {
        const userId = await User.getUserId(); // Obtener ID del usuario
        user = await User.getUserById(userId);
        currencies = await Wallet.getWalletsCurrenciesById(userId); // Asignamos currencies globalmente
        console.log(currencies);
        return currencies || []; // Retorna un array vacío si es null/undefined
    } catch (error) {
        console.error('❌ Error al obtener el usuario:', error);
        return []; // Devuelve un array vacío en caso de error
    }
}

// Definir getValueFinal() para obtener los valores finales de las criptos
async function getValueFinal() {
    try {
        let value = [];
        for (let currency of currencies) {
            let currencyValue = await History.getLatestHistoryByCurrencyId(currency.currencyId);
            value.push(currencyValue.currentPrice);
        }
        console.log(value);
        return value || []; // Retorna un array vacío si es null/undefined
    } catch (error) {
        console.error('❌ Error al obtener los valores finales:', error);
        return []; // Devuelve un array vacío en caso de error
    }
}

// Definir getTotalValue() para obtener los valores totales de las criptos
async function getTotalValue() {
    try {
        let promises = currencies.map(async (currency) => {
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

// Aquí empieza tu código que se ejecuta cuando el DOM está listo
document.addEventListener("DOMContentLoaded", async function() {
    const cryptos = await getCryptos(); // Aquí usamos getCryptos() que ahora está definida globalmente.
    console.log(cryptos);

    // Obtener valores finales
    value = await getValueFinal();  // Guardamos los valores finales en la variable global 'value'

    // Obtener valores totales
    let totalValue = await getTotalValue();  // Usamos la función global getTotalValue()

    function pushData(currencies, totalValue) {
        let data = [];
        for (let i = 0; i < currencies.length; i++) {
            data.push({
                name: currencies[i].name,
                value: totalValue[i]
            });
        }
        return data;
    }

    const data = pushData(currencies, totalValue);
    console.log(data);

    // Obtener el elemento del DOM donde se renderizará el gráfico
    let chartDom = document.getElementById('cryptoPieChart');

    // Inicializar el gráfico con el elemento obtenido
    let myChart = echarts.init(chartDom);

    // Definir la configuración del gráfico
    let option;

    option = {
        tooltip: {
            trigger: 'item' // Muestra información cuando se pasa el mouse sobre un elemento del gráfico
        },
        legend: {
            top: '5%', // Posiciona la leyenda en la parte superior
            left: 'center' // Centra la leyenda horizontalmente
        },
        series: [
            {
                name: 'CryptoCoin', // Nombre de la serie de datos
                type: 'pie', // Tipo de gráfico: pastel
                radius: ['30%', '70%'], // Define el radio interno y externo del gráfico (tipo anillo)
                avoidLabelOverlap: false, // Evita que las etiquetas se solapen
                itemStyle: {
                    borderRadius: 10, // Bordes redondeados en cada segmento
                    borderColor: '#fff', // Color del borde de cada segmento
                    borderWidth: 2 // Ancho del borde
                },
                label: {
                    show: false, // Oculta las etiquetas dentro del gráfico
                    position: 'center' // Posiciona las etiquetas en el centro (si estuvieran visibles)
                },
                emphasis: {
                    label: {
                        show: true, // Muestra la etiqueta al hacer hover sobre un segmento
                        fontSize: 20, // Tamaño de fuente más grande en hover
                        fontWeight: 'bold' // Hace la fuente en negrita en hover
                    }
                },
                labelLine: {
                    show: false // Oculta las líneas de conexión entre etiquetas y segmentos
                },
                data: data
            }
        ]
    };

    // Aplicar la configuración al gráfico y renderizarlo
    myChart.setOption(option);

    // Llamar a la función para llenar la tabla
    fillCryptoTable();  // Llamamos a la función para llenar la tabla
});

// Función para llenar la tabla con los datos obtenidos
async function fillCryptoTable() {
    try {
        let tableBody = document.getElementById("cryptoHoldingsTable");

        // Verificar que el tbody existe
        if (!tableBody) {
            console.error("❌ Error: No se encontró el elemento 'cryptoHoldingsTable'.");
            return;
        }

        // Limpiar contenido previo de la tabla
        tableBody.innerHTML = "";

        // Obtener datos de la API
        const cryptos = await getCryptos();  // Usar la función global getCryptos
        const totalValues = await getTotalValue();  // Usar la función global getTotalValue()

        // Construir las filas dinámicamente
        cryptos.forEach((currency, index) => {
            let currentPrice = value[index];  // Obtener el valor de 'value' para cada moneda
            let quantity = totalValues[index];

            let row = document.createElement("tr");
            row.innerHTML = `
  <td class="d-flex gap-2 align-items-center align-middle">
    <img src="${currency.image}" alt="Icono de ${currency.name}" height="35">
    <span class="fw-bold">${currency.name}</span>
  </td>
  <td class="text-end align-middle">
    <span class="text-dark">${quantity.toFixed(2)}</span>
  </td>
  <td class="text-end align-middle">
    <span class="text-dark">$${currentPrice.toLocaleString()}</span>
  </td>
`;

            tableBody.appendChild(row);
        });


        console.log("✅ Tabla actualizada con éxito.");
    } catch (error) {
        console.error("❌ Error al llenar la tabla:", error);
    }
}

// ================================
// ANIMATION ARROW SHOW MORE INFO
// ================================

// Cambiar la dirección de la flecha cuando se haga clic en el botón "More Info"
const collapseButton = document.querySelector('[data-bs-toggle="collapse"]');
const toggleIcon = document.getElementById('toggleIcon');

collapseButton.addEventListener('click', function() {
    // Comprobar si el contenido está abierto o cerrado y cambiar la flecha
    const isExpanded = collapseButton.getAttribute('aria-expanded') === 'true';
    if (isExpanded) {
        toggleIcon.classList.remove('fa-chevron-right'); // Flecha hacia arriba
        toggleIcon.classList.add('fa-chevron-down'); // Flecha hacia abajo
    } else {
        toggleIcon.classList.remove('fa-chevron-down'); // Flecha hacia abajo
        toggleIcon.classList.add('fa-chevron-right'); // Flecha hacia arriba
    }
});

