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

document.getElementById("playNow").addEventListener("click", function () {
    document.querySelectorAll(".formRegLog").forEach((form) => {
        form.reset();
    });
    document.querySelectorAll(".error").forEach((error) => {
       error.innerHTML = "";
    });
});
document.querySelectorAll(".btn-changeLogin").forEach((btn) => {
    btn.addEventListener("click", function () {
        document.querySelectorAll(".formRegLog").forEach((form) => {
            form.reset();
        });
        document.querySelectorAll(".error").forEach((error) => {
            error.innerHTML = "";
        });
    });
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

async function loadUsers() {
    try {
        const users = await User.loadUsers();
        console.log("Usuarios cargados:", users);
    } catch (error) {
        console.error("Error al cargar los usuarios:", error);
    }
}

function registerUser(event) {
    event.preventDefault(); // Evita que se recargue la página

    const name = document.getElementById("floatingNameSignup").value;
    const email = document.getElementById("floatingInput").value;
    const password = document.getElementById("floatingPassword").value;

    // Validaciones antes de intentar registrar al usuario
    const emailError = checkEmail(email);
    const passwordError = checkPassword(password);

    // Mostrar mensajes de error en la interfaz si existen
    document.getElementById("errorMessageSignup").innerHTML = emailError;
    document.getElementById("errorMessagePasswordSignup").innerHTML = passwordError;

    // Si hay errores, detener el registro
    if (emailError || passwordError) {
        console.log("Registro detenido debido a errores en los campos.");
        return;
    }

    try {
        // Llamada a la función para crear el usuario si todo está correcto
        User.createUser(name, email, password);
        console.log("Usuario registrado correctamente.");
        window.document.location.href = "createGame.html";
    } catch (error) {
        console.error("Error al registrar el usuario:", error);
    }
}

async function loginUser(event) {
    event.preventDefault(); // Evita recarga de la página

    const email = document.getElementById("floatingInputLogin").value;
    const password = document.getElementById("floatingPasswordLogin").value;

    // Validación de email
    const emailError = checkEmail(email);
    document.getElementById("errorMessageLogin").innerHTML = emailError;

    if (emailError) return; // No continuar si hay errores

    try {
        const users = await User.loadUsers(); // Esperar carga de usuarios
        console.log("Usuarios cargados:", users);

        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            console.log("✅ Usuario autenticado correctamente.");
            window.location.href = "dashboard.html"; // Redirigir al dashboard
        } else {
            document.getElementById("errorMessageLogin").innerHTML = "❌ Correo o contraseña incorrectos.";
        }
    } catch (error) {
        console.error("Error al iniciar sesión:", error);
        document.getElementById("errorMessageLogin").innerHTML = "❌ Error al conectar con el servidor.";
    }
}