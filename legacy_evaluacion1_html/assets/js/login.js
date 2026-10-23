/**
 * ==============================================================================
 * HUERTOHOGAR - SCRIPT DE INICIO DE SESIÓN (login.js)
 * ==============================================================================
 * Este archivo maneja el formulario de login:
 * 1. Lee lo que escribe el usuario en correo y contraseña.
 * 2. Busca en el localStorage si la cuenta existe.
 * 3. Identifica con exactitud el origen del error:
 *    - Si el correo no existe: "No existe una cuenta registrada con este correo electrónico."
 *    - Si el correo existe pero la clave no coincide: "La contraseña ingresada es incorrecta."
 * 4. Si los datos son correctos, guarda la sesión en localStorage y redirige a la portada.
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', function() {
  const formLogin = document.getElementById('form-login');
  if (!formLogin) return;

  // Si el usuario acaba de registrarse con éxito en registro.html, le mostramos un aviso
  if (sessionStorage.getItem('registro_exitoso') === 'true') {
    mostrarToast('¡Cuenta creada con éxito! Por favor inicia sesión.', 'success');
    sessionStorage.removeItem('registro_exitoso');
  }

  // Si es la primera vez que se abre la página, creamos un usuario de prueba para el profesor
  crearUsuarioDemoSiEstaVacio();

  // Obtenemos los elementos HTML de los campos y de los mensajes de error
  const inputCorreo = document.getElementById('login-correo');
  const inputPassword = document.getElementById('login-password');
  const spanErrorCorreo = document.getElementById('error-login-correo');
  const spanErrorPassword = document.getElementById('error-login-password');

  // Cuando el usuario empieza a escribir, limpiamos los errores previos
  inputCorreo.addEventListener('input', function() {
    inputCorreo.classList.remove('is-invalid');
    spanErrorCorreo.classList.remove('visible');
    spanErrorCorreo.textContent = '';
  });

  inputPassword.addEventListener('input', function() {
    inputPassword.classList.remove('is-invalid');
    spanErrorPassword.classList.remove('visible');
    spanErrorPassword.textContent = '';
  });

  // Cuando el usuario hace clic en "Iniciar sesión" (evento submit)
  formLogin.addEventListener('submit', function(evento) {
    // 1. Evitamos que el formulario se envíe de forma tradicional y recargue la página
    evento.preventDefault();

    // 2. Obtenemos el texto ingresado y le quitamos espacios extra con .trim()
    const correoIngresado = inputCorreo.value.trim().toLowerCase();
    const passwordIngresada = inputPassword.value;

    let hayError = false;

    // Validación básica: verificar que no estén vacíos
    if (correoIngresado === '') {
      mostrarErrorEnCampo(inputCorreo, spanErrorCorreo, 'El correo electrónico es obligatorio.');
      hayError = true;
    }

    if (passwordIngresada === '') {
      mostrarErrorEnCampo(inputPassword, spanErrorPassword, 'La contraseña es obligatoria.');
      hayError = true;
    }

    // Si algún campo está vacío, nos detenemos aquí
    if (hayError === true) {
      return;
    }

    // 3. Leemos la lista de usuarios guardados en localStorage
    let listaUsuarios = [];
    const textoUsuarios = localStorage.getItem('huerto_usuarios');
    if (textoUsuarios !== null) {
      listaUsuarios = JSON.parse(textoUsuarios);
    }

    // 4. Buscamos si existe algún usuario con ese correo usando un ciclo for tradicional
    let usuarioEncontrado = null;
    for (let i = 0; i < listaUsuarios.length; i++) {
      if (listaUsuarios[i].correo.toLowerCase() === correoIngresado) {
        usuarioEncontrado = listaUsuarios[i];
        break; // Detenemos la búsqueda porque ya lo encontramos
      }
    }

    // DISCRIMINACIÓN DE ERROR 1: La cuenta no existe
    if (usuarioEncontrado === null) {
      mostrarErrorEnCampo(inputCorreo, spanErrorCorreo, 'No existe una cuenta registrada con este correo electrónico.');
      inputCorreo.focus();
      return;
    }

    // DISCRIMINACIÓN DE ERROR 2: La cuenta existe, pero la contraseña no coincide
    if (usuarioEncontrado.password !== passwordIngresada) {
      mostrarErrorEnCampo(inputPassword, spanErrorPassword, 'La contraseña ingresada es incorrecta.');
      inputPassword.focus();
      return;
    }

    // Si llegamos hasta aquí, las credenciales son 100% correctas:
    // Guardamos la sesión en el localStorage bajo la clave 'huerto_usuario_activo'
    const datosSesion = {
      nombre: usuarioEncontrado.nombre,
      correo: usuarioEncontrado.correo,
      region: usuarioEncontrado.region,
      comuna: usuarioEncontrado.comuna
    };

    localStorage.setItem('huerto_usuario_activo', JSON.stringify(datosSesion));

    mostrarToast('¡Bienvenido/a, ' + usuarioEncontrado.nombre + '!', 'success');

    // Redirección inteligente: si ya tiene productos en el carrito, lo enviamos al carrito para continuar su compra; si no, al inicio
    const carritoGuardado = localStorage.getItem('huerto_carrito');
    let tieneProductos = false;
    if (carritoGuardado !== null) {
      const lista = JSON.parse(carritoGuardado);
      if (lista.length > 0) {
        tieneProductos = true;
      }
    }

    setTimeout(function() {
      if (tieneProductos === true) {
        window.location.href = 'carrito.html';
      } else {
        window.location.href = 'index.html';
      }
    }, 1000);
  });
});

/**
 * Función auxiliar para pintar el campo en rojo y mostrar el mensaje de error junto al campo
 */
function mostrarErrorEnCampo(input, spanError, mensaje) {
  input.classList.add('is-invalid');
  spanError.textContent = mensaje;
  spanError.classList.add('visible');
}

/**
 * Función que inserta un usuario de demostración si el localStorage está vacío,
 * permitiendo al docente probar el inicio de sesión inmediatamente.
 */
function crearUsuarioDemoSiEstaVacio() {
  const texto = localStorage.getItem('huerto_usuarios');
  if (texto === null) {
    const usuarioDemo = [
      {
        nombre: 'Camila Silva',
        correo: 'cliente@huertohogar.cl',
        password: 'Password2026*',
        telefono: '+56 9 8765 4321',
        region: 'Región Metropolitana',
        comuna: 'Santiago'
      }
    ];
    localStorage.setItem('huerto_usuarios', JSON.stringify(usuarioDemo));
  }
}
