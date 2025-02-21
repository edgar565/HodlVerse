document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('toggleDarkMode');
    const body = document.body;

    // Función para establecer una cookie
    function setCookie(name, value, days) {
        let expires = "";
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    // Función para obtener una cookie
    function getCookie(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    // Verificar la preferencia guardada en la cookie
    const darkModePreference = getCookie('darkMode');
    if (darkModePreference === 'enabled') {
        body.classList.add('dark-mode');
    }

    // Alternar el modo oscuro y guardar la preferencia en la cookie
    toggleButton.addEventListener('click', function () {
        body.classList.toggle('dark-mode');
        if (body.classList.contains('dark-mode')) {
            setCookie('darkMode', 'enabled', 365);
        } else {
            setCookie('darkMode', 'disabled', 365);
        }
    });
});
