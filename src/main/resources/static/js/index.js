document.getElementById("floatingInput").addEventListener("blur", function () {
    const email = document.getElementById("floatingInput").value;
   document.getElementById("errorMessageSignup").innerHTML = checkEmail(email);
});
document.getElementById("floatingInputLogin").addEventListener("blur", function () {
    const email = document.getElementById("floatingInputLogin").value;
    document.getElementById("errorMessageLogin").innerHTML = checkEmail(email);
});

function checkEmail(email) {
    if (!email) {
        return "El campo de correo electrónico no puede estar vacío.";
    }

    // Expresión regular simple para validar formato general de email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (!emailRegex.test(email)) {
        return "Por favor, introduce un correo electrónico válido.";
    }

    // Si tienes un validador adicional como `User.isValidEmail`, podrías usarlo aquí
    try {
        const isValid = User.isValidEmail(email); // Suponiendo que esta función retorna un valor booleano
        if (!isValid) {
            return "El correo electrónico no es válido según las reglas del sistema.";
        }
    } catch (error) {
        console.error(error);
        return "Hubo un error al validar el correo electrónico.";
    }

    return ""; // Si pasa todas las validaciones
}
document.getElementById("floatingPassword").addEventListener("blur", function () {
    const password = document.getElementById("floatingPassword").value;
    document.getElementById("errorMessagePasswordSignup").innerHTML = checkPassword(password);
});

document.getElementById("floatingPasswordLogin").addEventListener("blur", function () {
    const password = document.getElementById("floatingPasswordLogin").value;
    document.getElementById("errorMessagePasswordLogin").innerHTML = checkPassword(password);
});

function checkPassword(password) {
    let errorMessages = [];

    // Validación de vacío
    if (!password) {
        errorMessages.push("El campo de contraseña no puede estar vacío.");
    }

    // Validación de longitud
    if (password.length < 8 || password.length > 16) {
        errorMessages.push("La contraseña debe tener entre 8 y 16 caracteres.");
    }

    // Validación de mayúscula
    if (!/[A-Z]/.test(password)) {
        errorMessages.push("La contraseña debe contener al menos una letra mayúscula.");
    }

    // Validación de carácter especial
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errorMessages.push("La contraseña debe contener al menos un carácter especial (por ejemplo, !, @, #).");
    }

    // Si hay errores, devolver todos los mensajes
    return errorMessages.join("<br>");
}


function registerUser(event) {
    event.preventDefault(); // Evita que se recargue la página

    const name = document.getElementById("floatingNameSignup").value;
    const email = document.getElementById("floatingInput").value;
    const password = document.getElementById("floatingPassword").value;

    try {
        const date = new Date();
        // Llamada a la función para crear el usuario
        User.createUser(name, email, password, date, " ");

    } catch (error) {
        console.error(error);
    }


}