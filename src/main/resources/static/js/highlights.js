document.addEventListener("DOMContentLoaded", function () {
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
                <div class="col-6" onclick="window.location.href='infoCrypto.html?ticker=${coin.currency.ticker}'">
                    <img src="${coin.currency.image}" alt="Logo de ${coin.currency.name}" height="24" class="me-2">${coin.currency.name}
                </div>
                <div class="col-4 text-end">$${coin.currentPrice}</div>
                <div class="col-2 text-end ${coin.priceChangePercentage24h < 0 ? 'text-danger' : 'text-success'} fw-bold">${coin.priceChangePercentage24h.toFixed(1)}%</div>
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
            dominance(top5Coins);
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
            const top5Coins = coins.slice(0, 5);
            console.log(top5Coins);
            let lista = document.getElementById("highest-volume-list");
            listas(lista, top5Coins);
        } catch (error) {
            console.error(error);
        }
    }

    highestVolume();

});

// Event handling
function addListeners() {
    if (!('ontouchstart' in window)) {
        window.addEventListener('mousemove', mouseMove);
    }
    window.addEventListener('scroll', scrollCheck);
    window.addEventListener('resize', resize);
}

function mouseMove(e) {
    target.x = e.clientX || (e.touches && e.touches[0].clientX);
    target.y = e.clientY || (e.touches && e.touches[0].clientY);
}


function scrollCheck() {
    if (document.body.scrollTop > height) animateHeader = false;
    else animateHeader = true;
}

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    largeHeader.style.height = height + 'px';
    canvas.width = width;
    canvas.height = height;
}

// animation
function initAnimation() {
    animate();
    for (let i in points) {
        shiftPoint(points[i]);
    }
}

function animate() {
    if (animateHeader) {
        ctx.clearRect(0, 0, width, height);
        for (let i in points) {
            // detect points in range
            if (Math.abs(getDistance(target, points[i])) < 4000) {
                points[i].active = 0.3;
                points[i].circle.active = 0.6;
            } else if (Math.abs(getDistance(target, points[i])) < 20000) {
                points[i].active = 0.1;
                points[i].circle.active = 0.3;
            } else if (Math.abs(getDistance(target, points[i])) < 40000) {
                points[i].active = 0.02;
                points[i].circle.active = 0.1;
            } else {
                points[i].active = 0;
                points[i].circle.active = 0;
            }

            drawLines(points[i]);
            points[i].circle.draw();
        }
    }
    requestAnimationFrame(animate);
}

function shiftPoint(p) {
    TweenLite.to(p, 1 + 1 * Math.random(), {
        x: p.originX - 50 + Math.random() * 100,
        y: p.originY - 50 + Math.random() * 100, ease: Circ.easeInOut,
        onComplete: function () {
            shiftPoint(p);
        }
    });
}

// Canvas manipulation
function drawLines(p) {
    if (!p.active) return;
    for (let i in p.closest) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.closest[i].x, p.closest[i].y);
        ctx.strokeStyle = 'rgba(156,217,249,' + p.active + ')';
        ctx.stroke();
    }
}

function Circle(pos, rad, color) {
    let _this = this;

    // constructor
    (function () {
        _this.pos = pos || null;
        _this.radius = rad || null;
        _this.color = color || null;
    })();

    this.draw = function () {
        if (!_this.active) return;
        ctx.beginPath();
        ctx.arc(_this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'rgba(156,217,249,' + _this.active + ')';
        ctx.fill();
    };
}

// Util
function getDistance(p1, p2) {
    return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
}