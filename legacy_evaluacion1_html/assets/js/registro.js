/**
 * ==============================================================================
 * HUERTOHOGAR - SCRIPT DE REGISTRO DE USUARIOS (registro.js)
 * ==============================================================================
 * Este archivo se encarga de validar que todos los datos ingresados en el 
 * formulario de registro sean correctos antes de guardarlos:
 * 1. Llena dinámicamente las Regiones y Comunas de Chile.
 * 2. Valida cada campo por separado mostrando el error junto a dicho campo:
 *    - Nombre: obligatorio, solo letras y espacios, máx 50 caracteres.
 *    - Correo: formato válido y que NO esté repetido en el localStorage.
 *    - Confirmar correo: que sea igual al correo.
 *    - Contraseña: mín 8 caracteres, mayúscula, minúscula, número y símbolo (@#$%!.*).
 *    - Confirmar contraseña: que sea igual a la contraseña.
 *    - Teléfono: opcional, formato chileno (+56 9 XXXX XXXX o 9XXXXXXXX).
 *    - Región y Comuna: obligatorias.
 * 3. Si todo es válido, guarda el nuevo usuario en localStorage y va a login.html.
 * ==============================================================================
 */

// Objeto con las Regiones y sus Comunas correspondientes en Chile
const REGIONES_CHILE = {
  'Región Metropolitana': ['Santiago', 'Providencia', 'Las Condes', 'Maipú', 'Puente Alto'],
  'Región de Valparaíso': ['Valparaíso', 'Viña del Mar', 'Quilpué', 'Villa Alemana', 'Concón'],
  'Región del Maule': ['Talca', 'Curicó', 'Linares', 'Molina'],
  'Región del Biobío': ['Concepción', 'Nacimiento', 'Talcahuano', 'San Pedro de la Paz'],
  'Región de La Araucanía': ['Temuco', 'Villarrica', 'Pucón', 'Angol'],
  'Región de Los Lagos': ['Puerto Montt', 'Puerto Varas', 'Osorno', 'Castro']
};

document.addEventListener('DOMContentLoaded', function() {
  const formRegistro = document.getElementById('form-registro');
  if (!formRegistro) return;

  const selectRegion = document.getElementById('region');
  const selectComuna = document.getElementById('comuna');

  // 1. CARGAR LAS REGIONES EN EL SELECT
  selectRegion.innerHTML = '<option value="">-- Selecciona una región --</option>';
  const nombresRegiones = Object.keys(REGIONES_CHILE);
  for (let i = 0; i < nombresRegiones.length; i++) {
    const opcion = document.createElement('option');
    opcion.value = nombresRegiones[i];
    opcion.textContent = nombresRegiones[i];
    selectRegion.appendChild(opcion);
  }

  // 2. CUANDO EL USUARIO CAMBIA LA REGIÓN, CARGAR SUS COMUNAS (Select dependiente)
  selectRegion.addEventListener('change', function() {
    const regionElegida = selectRegion.value;
    selectComuna.innerHTML = '<option value="">-- Selecciona una comuna --</option>';

    if (regionElegida !== '' && REGIONES_CHILE[regionElegida]) {
      selectComuna.disabled = false; // Desbloqueamos el select de comuna
      const comunas = REGIONES_CHILE[regionElegida];
      for (let j = 0; j < comunas.length; j++) {
        const opt = document.createElement('option');
        opt.value = comunas[j];
        opt.textContent = comunas[j];
        selectComuna.appendChild(opt);
      }
    } else {
      selectComuna.disabled = true; // Si no hay región, lo bloqueamos
    }

    // Validamos los campos de región y comuna
    validarUnCampo('region');
    validarUnCampo('comuna');
  });

  // 3. VALIDAR CADA CAMPO CUANDO EL USUARIO SE SALE DE ÉL (evento 'blur')
  const listaCampos = ['nombre', 'correo', 'confirmar-correo', 'password', 'confirmar-password', 'telefono', 'region', 'comuna'];
  for (let i = 0; i < listaCampos.length; i++) {
    const idCampo = listaCampos[i];
    const elementoInput = document.getElementById(idCampo);
    if (elementoInput) {
      elementoInput.addEventListener('blur', function() {
        validarUnCampo(idCampo);
      });
      // También revalidamos mientras escribe si ya tenía un error visible
      elementoInput.addEventListener('input', function() {
        const spanError = document.getElementById('error-' + idCampo);
        if (spanError && spanError.classList.contains('visible')) {
          validarUnCampo(idCampo);
        }
      });
    }
  }

  // 4. AL ENVIAR EL FORMULARIO (evento 'submit')
  formRegistro.addEventListener('submit', function(evento) {
    // Evitamos que el formulario se envíe solo
    evento.preventDefault();

    let todoValido = true;

    // Validamos todos y cada uno de los campos
    for (let i = 0; i < listaCampos.length; i++) {
      const esCorrecto = validarUnCampo(listaCampos[i]);
      if (esCorrecto === false) {
        todoValido = false;
      }
    }

    // Si hubo algún error, detenemos el envío
    if (todoValido === false) {
      mostrarToast('Corrige los campos marcados en rojo.', 'error');
      return;
    }

    // Si todos los datos son válidos, creamos el objeto de nuevo usuario
    const nuevoUsuario = {
      nombre: document.getElementById('nombre').value.trim(),
      correo: document.getElementById('correo').value.trim().toLowerCase(),
      password: document.getElementById('password').value,
      telefono: document.getElementById('telefono').value.trim(),
      region: selectRegion.value,
      comuna: selectComuna.value,
      fechaRegistro: new Date().toISOString()
    };

    // Leemos la lista de usuarios existente en localStorage
    let usuariosGuardados = [];
    const datosTexto = localStorage.getItem('huerto_usuarios');
    if (datosTexto !== null) {
      usuariosGuardados = JSON.parse(datosTexto);
    }

    // Agregamos el nuevo usuario a la lista
    usuariosGuardados.push(nuevoUsuario);

    // Guardamos la lista actualizada en el localStorage
    localStorage.setItem('huerto_usuarios', JSON.stringify(usuariosGuardados));

    // Guardamos un aviso temporal y redirigimos a login.html
    sessionStorage.setItem('registro_exitoso', 'true');
    mostrarToast('¡Usuario registrado con éxito! Redirigiendo...', 'success');

    setTimeout(function() {
      window.location.href = 'login.html';
    }, 1200);
  });
});

/**
 * Función que valida un campo individual según su ID
 * y coloca el mensaje de error correspondiente junto a él.
 * Devuelve true si el campo está bien, o false si tiene un error.
 */
function validarUnCampo(id) {
  const input = document.getElementById(id);
  const spanError = document.getElementById('error-' + id);
  if (!input || !spanError) return true;

  const valor = input.value.trim();
  let mensaje = '';

  // EVALUAMOS SEGÚN EL CAMPO
  if (id === 'nombre') {
    if (valor === '') {
      mensaje = 'El nombre completo es obligatorio.';
    } else if (valor.length > 50) {
      mensaje = 'El nombre no puede tener más de 50 caracteres.';
    } else {
      // Expresión regular: solo letras (mayúsculas, minúsculas, tildes) y espacios
      const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
      if (soloLetras.test(valor) === false) {
        mensaje = 'Únicamente se permiten letras y espacios.';
      }
    }
  } 
  else if (id === 'correo') {
    // Expresión regular para correo electrónico estándar
    const patronEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (valor === '') {
      mensaje = 'El correo electrónico es obligatorio.';
    } else if (patronEmail.test(valor) === false) {
      mensaje = 'Ingresa un correo electrónico válido (ej: usuario@correo.cl).';
    } else {
      // Verificamos si el correo ya está registrado en localStorage usando un ciclo for
      let lista = [];
      const data = localStorage.getItem('huerto_usuarios');
      if (data !== null) {
        lista = JSON.parse(data);
      }
      for (let i = 0; i < lista.length; i++) {
        if (lista[i].correo.toLowerCase() === valor.toLowerCase()) {
          mensaje = 'Este correo ya se encuentra registrado en el sistema.';
          break;
        }
      }
    }
  } 
  else if (id === 'confirmar-correo') {
    const correoOriginal = document.getElementById('correo').value.trim();
    if (valor === '') {
      mensaje = 'Debes confirmar tu correo electrónico.';
    } else if (valor.toLowerCase() !== correoOriginal.toLowerCase()) {
      mensaje = 'Los correos no coinciden.';
    }
  } 
  else if (id === 'password') {
    if (valor === '') {
      mensaje = 'La contraseña es obligatoria.';
    } else if (valor.length < 8) {
      mensaje = 'La contraseña debe tener mínimo 8 caracteres.';
    } else if (/[A-Z]/.test(valor) === false) {
      mensaje = 'Debe contener al menos una letra mayúscula.';
    } else if (/[a-z]/.test(valor) === false) {
      mensaje = 'Debe contener al menos una letra minúscula.';
    } else if (/[0-9]/.test(valor) === false) {
      mensaje = 'Debe contener al menos un número.';
    } else if (/[@#$%!.*]/.test(valor) === false) {
      mensaje = 'Debe contener al menos un símbolo (@#$%!.*).';
    }
  } 
  else if (id === 'confirmar-password') {
    const passwordOriginal = document.getElementById('password').value;
    if (valor === '') {
      mensaje = 'Debes confirmar tu contraseña.';
    } else if (valor !== passwordOriginal) {
      mensaje = 'Las contraseñas no coinciden.';
    }
  } 
  else if (id === 'telefono') {
    // El teléfono es opcional, pero si escribe algo lo validamos
    if (valor !== '') {
      // Admite formatos chilenos: +56 9 1234 5678, 912345678, etc.
      const patronTelefono = /^(\+?56\s?9\s?\d{4}\s?\d{4}|9\s?\d{4}\s?\d{4}|9\d{8})$/;
      if (patronTelefono.test(valor) === false) {
        mensaje = 'Ingresa un móvil chileno válido (ej: +56 9 1234 5678 o 912345678).';
      }
    }
  } 
  else if (id === 'region') {
    if (valor === '') {
      mensaje = 'Debes seleccionar una región.';
    }
  } 
  else if (id === 'comuna') {
    if (valor === '') {
      mensaje = 'Debes seleccionar una comuna.';
    }
  }

  // Si hubo mensaje de error, marcamos el campo en rojo
  if (mensaje !== '') {
    input.classList.add('is-invalid');
    input.classList.remove('is-valid');
    spanError.textContent = mensaje;
    spanError.classList.add('visible');
    return false;
  } else {
    // Si no hubo error, quitamos el rojo
    input.classList.remove('is-invalid');
    if (valor !== '' || id === 'telefono') {
      input.classList.add('is-valid');
    }
    spanError.textContent = '';
    spanError.classList.remove('visible');
    return true;
  }
}
