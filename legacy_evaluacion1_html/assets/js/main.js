/**
 * ==============================================================================
 * HUERTOHOGAR - SCRIPT PRINCIPAL Y COMPARTIDO (main.js)
 * ==============================================================================
 * Este archivo contiene las funciones que se utilizan en TODAS las páginas:
 * 1. La lista (catálogo) de los 8 productos oficiales.
 * 2. Las funciones para leer y guardar en el localStorage.
 * 3. La función que cuenta cuántos productos hay en el carrito y actualiza el botón Cart (n).
 * 4. La función para agregar productos al carrito.
 * 5. La función para mostrar avisos en pantalla (Toast).
 * 6. La verificación de si el usuario ha iniciado sesión.
 * ==============================================================================
 */

// 1. CATÁLOGO MAESTRO: Una lista (Array) con los 8 productos de HuertoHogar.
// Cada producto es un "Objeto" con llaves { } que guarda sus datos.
const CATALOGO_PRODUCTOS = [
  {
    codigo: 'FR001',
    nombre: 'Manzanas Fuji',
    categoria: 'Frutas Frescas',
    precio: 1200,
    unidad: 'kilo',
    stock: '150 kilos',
    atributo: 'Valle del Maule',
    descripcion: 'Manzanas Fuji crujientes y dulces, cultivadas en el Valle del Maule. Perfectas para meriendas saludables o repostería natural.',
    imagen: 'assets/img/manzanas.svg'
  },
  {
    codigo: 'FR002',
    nombre: 'Naranjas Valencia',
    categoria: 'Frutas Frescas',
    precio: 1000,
    unidad: 'kilo',
    stock: '200 kilos',
    atributo: 'Ricas en Vitamina C',
    descripcion: 'Jugosas y aromáticas, estas naranjas Valencia son ideales para zumos frescos matutinos. Cosechadas en el punto óptimo de madurez.',
    imagen: 'assets/img/naranjas.svg'
  },
  {
    codigo: 'FR003',
    nombre: 'Plátanos Cavendish',
    categoria: 'Frutas Frescas',
    precio: 800,
    unidad: 'kilo',
    stock: '250 kilos',
    atributo: 'Ricos en Potasio',
    descripcion: 'Plátanos maduros y dulces, perfectos para el desayuno, batidos o como snack energético para deportistas y niños.',
    imagen: 'assets/img/platanos.svg'
  },
  {
    codigo: 'VR001',
    nombre: 'Zanahorias Orgánicas',
    categoria: 'Verduras Orgánicas',
    precio: 900,
    unidad: 'kilo',
    stock: '100 kilos',
    atributo: 'Región de O\'Higgins',
    descripcion: 'Zanahorias crujientes cultivadas sin pesticidas en los fértiles suelos de O\'Higgins. Excelente fuente de betacarotenos y fibra.',
    imagen: 'assets/img/zanahorias.svg'
  },
  {
    codigo: 'VR002',
    nombre: 'Espinacas Frescas',
    categoria: 'Verduras Orgánicas',
    precio: 700,
    unidad: 'bolsa de 500g',
    stock: '80 bolsas',
    atributo: 'Cultivo 100% Orgánico',
    descripcion: 'Espinacas de hoja tierna y vibrante, perfectas para ensaladas frescas, salteados y batidos verdes détox. Sin aditivos.',
    imagen: 'assets/img/espinacas.svg'
  },
  {
    codigo: 'VR003',
    nombre: 'Pimientos Tricolores',
    categoria: 'Verduras Orgánicas',
    precio: 1500,
    unidad: 'kilo',
    stock: '120 kilos',
    atributo: 'Rojo, Amarillo y Verde',
    descripcion: 'Selección de pimientos carnosos y aromáticos. Llenan de color y nutrientes tus platos, salteados y ensaladas mediterráneas.',
    imagen: 'assets/img/pimientos.svg'
  },
  {
    codigo: 'PO001',
    nombre: 'Miel Orgánica',
    categoria: 'Productos Orgánicos',
    precio: 5000,
    unidad: 'frasco de 500g',
    stock: '50 frascos',
    atributo: 'Apicultores Locales',
    descripcion: 'Miel pura de bosque nativo recolectada por apicultores locales. Sin preservantes ni azúcares añadidos, dulce y saludable.',
    imagen: 'assets/img/miel.svg'
  },
  {
    codigo: 'PO003',
    nombre: 'Quinua Orgánica',
    categoria: 'Productos Orgánicos',
    precio: 3200,
    unidad: 'kilo',
    stock: '70 kilos',
    atributo: 'Grano Andino Seleccionado',
    descripcion: 'Superalimento libre de gluten, rico en proteínas vegetales completas y minerales. Versátil para ensaladas, risottos y postres.',
    imagen: 'assets/img/quinua.svg'
  }
];

// Nombres de las "cajas" (claves) donde guardamos información en el localStorage del navegador
const CLAVE_CARRITO = 'huerto_carrito';
const CLAVE_USUARIOS = 'huerto_usuarios';
const CLAVE_USUARIO_ACTIVO = 'huerto_usuario_activo';

/**
 * Función para leer el carrito desde el localStorage.
 * Si no hay nada guardado todavía, devuelve una lista vacía [].
 */
function obtenerCarrito() {
  // localStorage.getItem busca el texto guardado con la clave 'huerto_carrito'
  const textoGuardado = localStorage.getItem(CLAVE_CARRITO);
  
  if (textoGuardado === null) {
    return []; // Si está vacío, retornamos una lista vacía
  }
  
  // JSON.parse convierte el texto JSON nuevamente a una lista de objetos JavaScript
  return JSON.parse(textoGuardado);
}

/**
 * Función para guardar la lista del carrito en el localStorage.
 * Convierte la lista en texto con JSON.stringify.
 */
function guardarCarrito(carrito) {
  // JSON.stringify transforma el array en texto plano para que el navegador lo pueda guardar
  const textoParaGuardar = JSON.stringify(carrito);
  localStorage.setItem(CLAVE_CARRITO, textoParaGuardar);
}

/**
 * Función sencilla para mostrar un precio en formato chileno.
 * Ejemplo: si recibe 1200, devuelve "$1.200 CLP"
 */
function formatearCLP(monto) {
  return '$' + monto.toLocaleString('es-CL') + ' CLP';
}

/**
 * Función que cuenta cuántas unidades en total hay en el carrito
 * y actualiza el número en el botón del encabezado "Cart (n)".
 * Utiliza un ciclo for tradicional fácil de entender y explicar.
 */
function actualizarContadorCarrito() {
  const carrito = obtenerCarrito();
  let totalUnidades = 0;

  // Recorremos cada producto del carrito y sumamos su cantidad
  for (let i = 0; i < carrito.length; i++) {
    totalUnidades = totalUnidades + carrito[i].cantidad;
  }

  // Buscamos todas las etiquetas con la clase 'cart-badge' y les ponemos el total
  const elementosBadge = document.querySelectorAll('.cart-badge');
  for (let j = 0; j < elementosBadge.length; j++) {
    elementosBadge[j].textContent = totalUnidades;
  }
}

/**
 * Función que se ejecuta cuando el usuario hace clic en "Agregar al carrito".
 * Recibe el código del producto (por ejemplo 'FR001').
 */
function agregarAlCarrito(codigo) {
  // 1. REGLA DE NEGOCIO: Para usar el carrito, el cliente debe estar registrado e iniciar sesión
  const sesionActiva = localStorage.getItem(CLAVE_USUARIO_ACTIVO);
  if (sesionActiva === null) {
    mostrarToast('Debes iniciar sesión o registrarte para agregar productos al carrito.', 'error');
    // Redirigimos a login.html después de mostrar el aviso
    setTimeout(function() {
      window.location.href = 'login.html';
    }, 1200);
    return;
  }

  // 2. Buscamos el producto en el catálogo
  let productoEncontrado = null;
  for (let i = 0; i < CATALOGO_PRODUCTOS.length; i++) {
    if (CATALOGO_PRODUCTOS[i].codigo === codigo) {
      productoEncontrado = CATALOGO_PRODUCTOS[i];
      break; // Ya lo encontramos, detenemos el ciclo
    }
  }

  if (productoEncontrado === null) {
    mostrarToast('Producto no encontrado', 'error');
    return;
  }

  // 2. Traemos el carrito actual
  const carrito = obtenerCarrito();

  // 3. Revisamos si el producto ya estaba en el carrito
  let yaExisteEnCarrito = false;
  for (let i = 0; i < carrito.length; i++) {
    if (carrito[i].codigo === codigo) {
      // Si ya estaba, simplemente aumentamos su cantidad en 1
      carrito[i].cantidad = carrito[i].cantidad + 1;
      yaExisteEnCarrito = true;
      break;
    }
  }

  // Si no estaba en el carrito, lo agregamos como un nuevo elemento con cantidad 1
  if (yaExisteEnCarrito === false) {
    carrito.push({
      codigo: productoEncontrado.codigo,
      nombre: productoEncontrado.nombre,
      precio: productoEncontrado.precio,
      unidad: productoEncontrado.unidad,
      descripcion: productoEncontrado.descripcion,
      imagen: productoEncontrado.imagen,
      cantidad: 1
    });
  }

  // 4. Guardamos los cambios en el localStorage
  guardarCarrito(carrito);

  // 5. Actualizamos el contador visual del menú
  actualizarContadorCarrito();

  // 6. Mostramos un aviso amigable al usuario
  mostrarToast('¡' + productoEncontrado.nombre + ' agregado al carrito!', 'success');
}

/**
 * Función para mostrar un mensaje flotante temporal (Toast) en la esquina inferior.
 */
function mostrarToast(mensaje, tipo) {
  // Buscamos si ya existe el contenedor de avisos
  let contenedor = document.querySelector('.toast-container');
  if (!contenedor) {
    contenedor = document.createElement('div');
    contenedor.className = 'toast-container';
    document.body.appendChild(contenedor);
  }

  // Creamos un nuevo div para el aviso
  const toast = document.createElement('div');
  toast.className = 'toast toast-' + tipo;
  toast.textContent = mensaje;
  contenedor.appendChild(toast);

  // A los 3 segundos lo hacemos desaparecer suavemente
  setTimeout(function() {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(function() {
      toast.remove();
    }, 300);
  }, 3000);
}

/**
 * Función que revisa si hay un usuario conectado (sesión activa).
 * Si hay sesión, muestra "Hola, [Nombre]" y un botón "Salir".
 * Si no hay sesión, muestra "Iniciar sesión | Registrar usuario".
 */
function renderizarEstadoSesion() {
  const contenedorAuth = document.getElementById('top-bar-auth-container');
  if (!contenedorAuth) return;

  const sesionTexto = localStorage.getItem(CLAVE_USUARIO_ACTIVO);

  if (sesionTexto !== null) {
    // Si hay un usuario guardado
    const usuario = JSON.parse(sesionTexto);
    const primerNombre = usuario.nombre.split(' ')[0];

    contenedorAuth.innerHTML = 
      '<span class="user-badge">Hola, <strong>' + primerNombre + '</strong></span>' +
      '<button type="button" class="btn-logout" id="btn-cerrar-sesion">Salir</button>';

    // Al hacer clic en salir, borramos la sesión y recargamos
    document.getElementById('btn-cerrar-sesion').addEventListener('click', function() {
      localStorage.removeItem(CLAVE_USUARIO_ACTIVO);
      mostrarToast('Sesión cerrada con éxito', 'info');
      setTimeout(function() {
        window.location.reload();
      }, 500);
    });
  } else {
    // Si no ha iniciado sesión
    contenedorAuth.innerHTML = 
      '<a href="login.html">Iniciar sesión</a>' +
      '<span>|</span>' +
      '<a href="registro.html">Registrar usuario</a>';
  }
}

// Cuando la página termina de cargar en el navegador, ejecutamos estas funciones
document.addEventListener('DOMContentLoaded', function() {
  actualizarContadorCarrito();
  renderizarEstadoSesion();

  // Formulario del boletín en el pie de página
  const formBoletin = document.getElementById('boletin-form');
  if (formBoletin) {
    formBoletin.addEventListener('submit', function(evento) {
      evento.preventDefault(); // Evitamos que la página se recargue sola
      const emailInput = document.getElementById('boletin-email');
      if (emailInput && emailInput.value.trim() !== '') {
        mostrarToast('¡Gracias por suscribirte al boletín de HuertoHogar!', 'success');
        emailInput.value = '';
      }
    });
  }
});
