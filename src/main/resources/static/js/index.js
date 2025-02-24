function registerUser(event) {
    event.preventDefault(); // Evita que se recargue la página

    const email = document.getElementById("floatingInput").value;
    const password = document.getElementById("floatingPassword").value;

    fetch('/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({email, password})
    })
        .then(response => {
            if (response.ok) {
                alert("Usuario registrado con éxito!");
                window.location.href = "/dashboard";
            } else {
                response.text().then(errorMessage => alert("Error: " + errorMessage));
            }
        })
        .catch(error => console.error("Error en la petición:", error));
}




