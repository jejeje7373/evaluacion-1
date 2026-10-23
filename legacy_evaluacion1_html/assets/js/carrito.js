/**
 * ==============================================================================
 * HUERTOHOGAR - SCRIPT DEL CARRITO DE COMPRAS (carrito.js)
 * ==============================================================================
 * Este archivo gestiona la página del carrito:
 * 1. Dibuja los productos que el usuario ha agregado en la pantalla.
 * 2. Permite aumentar (+) o disminuir (-) las cantidades de cada producto.
 * 3. Si la cantidad de un producto llega a 0, lo elimina de la lista.
 * 4. Recalcula el subtotal y el total a pagar automáticamente.
 * 5. Permite ingresar cupones de descuento (ej: HUERTO10).
 * 6. Simula el pago de la orden y vacía el carrito al finalizar.
 * 7. Si no hay productos, muestra la vista amigable de "Carrito vacío".
 * ==============================================================================
 */

// Variable global para recordar si se aplicó un cupón (porcentaje de descuento)
let porcentajeDescuento = 0;
let nombreCupon = '';

// Al cargar la página de carrito.html
document.addEventListener('DOMContentLoaded', function() {
  renderizarCarrito();
  configurarCupon();
  configurarBotonPagar();
});

/**
 * Función principal que lee el localStorage y dibuja los productos en el HTML
 */
function renderizarCarrito() {
  const carrito = obtenerCarrito();

  // Obtenemos los contenedores del HTML
  const contenedorItems = document.getElementById('carrito-items-container');
  const contenedorVacio = document.getElementById('carrito-vacio-container');
  const contenedorLayout = document.getElementById('carrito-layout-wrapper');

  if (!contenedorItems || !contenedorVacio || !contenedorLayout) return;

  // CASO 1: El carrito está vacío (0 productos)
  if (carrito.length === 0) {
    contenedorLayout.style.display = 'none'; // Ocultamos la tabla y el resumen
    contenedorVacio.style.display = 'block'; // Mostramos el mensaje de carrito vacío
    actualizarContadorCarrito();
    return;
  }

  // CASO 2: Hay productos en el carrito
  contenedorLayout.style.display = 'grid'; // Mostramos las dos columnas
  contenedorVacio.style.display = 'none';  // Ocultamos el mensaje de vacío
  contenedorItems.innerHTML = '';          // Limpiamos la lista antes de volver a dibujarla

  // Recorremos cada producto del carrito con un ciclo for tradicional
  for (let i = 0; i < carrito.length; i++) {
    const producto = carrito[i];
    const subtotalProducto = producto.precio * producto.cantidad;

    // Creamos la tarjeta del producto como un elemento semántico <article>
    const articulo = document.createElement('article');
    articulo.className = 'cart-item';

    articulo.innerHTML = 
      '<div class="cart-item-img">' +
        '<img src="' + producto.imagen + '" alt="' + producto.nombre + '" />' +
      '</div>' +
      '<div class="cart-item-details">' +
        '<h4>' + producto.nombre + '</h4>' +
        '<p class="cart-item-desc">' + producto.descripcion + '</p>' +
        '<span class="cart-item-unit-price">' + formatearCLP(producto.precio) + ' por ' + producto.unidad + '</span>' +
      '</div>' +
      '<div class="cart-item-controls">' +
        // Botón menos (-)
        '<button type="button" class="qty-btn" onclick="cambiarCantidad(\'' + producto.codigo + '\', -1)">−</button>' +
        // Cantidad actual
        '<span class="qty-display">' + producto.cantidad + '</span>' +
        // Botón más (+)
        '<button type="button" class="qty-btn" onclick="cambiarCantidad(\'' + producto.codigo + '\', 1)">+</button>' +
      '</div>' +
      '<div class="cart-item-subtotal">' +
        '<div class="subtotal-val">' + formatearCLP(subtotalProducto) + '</div>' +
        // Botón de basurero para eliminar el producto directamente
        '<button type="button" class="btn-remove-item" onclick="eliminarProducto(\'' + producto.codigo + '\')" title="Eliminar producto">' +
          '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>' +
        '</button>' +
      '</div>';

    contenedorItems.appendChild(articulo);
  }

  // Recalculamos el total de dinero a pagar y el contador del menú
  recalcularTotales();
  actualizarContadorCarrito();
}

/**
 * Función para aumentar o disminuir la cantidad de un producto.
 * Si recibe +1, aumenta. Si recibe -1, disminuye.
 * Si la cantidad llega a 0, se elimina del carrito automáticamente.
 */
function cambiarCantidad(codigo, cambio) {
  let carrito = obtenerCarrito();

  for (let i = 0; i < carrito.length; i++) {
    if (carrito[i].codigo === codigo) {
      // Modificamos la cantidad
      carrito[i].cantidad = carrito[i].cantidad + cambio;

      // Si llegó a cero o menos, lo eliminamos de la lista usando .splice()
      if (carrito[i].cantidad <= 0) {
        const nombreEliminado = carrito[i].nombre;
        carrito.splice(i, 1);
        mostrarToast(nombreEliminado + ' eliminado del carrito', 'info');
      }
      break;
    }
  }

  // Guardamos en el localStorage y volvemos a dibujar
  guardarCarrito(carrito);
  renderizarCarrito();
}

/**
 * Función para borrar un producto por completo al presionar el botón de basurero
 */
function eliminarProducto(codigo) {
  let carrito = obtenerCarrito();

  for (let i = 0; i < carrito.length; i++) {
    if (carrito[i].codigo === codigo) {
      const nombre = carrito[i].nombre;
      carrito.splice(i, 1); // Quitar el elemento en la posición i
      mostrarToast(nombre + ' eliminado del carrito', 'info');
      break;
    }
  }

  guardarCarrito(carrito);
  renderizarCarrito();
}

/**
 * Función que suma todos los precios del carrito y calcula el total final con descuento
 */
function recalcularTotales() {
  const carrito = obtenerCarrito();
  let subtotal = 0;

  // Sumamos el valor de cada producto multiplicado por su cantidad
  for (let i = 0; i < carrito.length; i++) {
    subtotal = subtotal + (carrito[i].precio * carrito[i].cantidad);
  }

  // Si hay un cupón activo, calculamos el monto del descuento
  let montoDescuento = 0;
  if (porcentajeDescuento > 0) {
    montoDescuento = Math.round(subtotal * (porcentajeDescuento / 100));
  }

  // El total final es la resta entre subtotal y descuento
  const totalFinal = subtotal - montoDescuento;

  // Actualizamos los textos en la pantalla
  const elSubtotal = document.getElementById('resumen-subtotal');
  const elFilaDescuento = document.getElementById('resumen-descuento-row');
  const elMontoDescuento = document.getElementById('resumen-descuento-monto');
  const elTotal = document.getElementById('resumen-total');

  if (elSubtotal) elSubtotal.textContent = formatearCLP(subtotal);

  if (elFilaDescuento && elMontoDescuento) {
    if (montoDescuento > 0) {
      elFilaDescuento.style.display = 'flex';
      elMontoDescuento.textContent = '-' + formatearCLP(montoDescuento) + ' (' + porcentajeDescuento + '%)';
    } else {
      elFilaDescuento.style.display = 'none';
    }
  }

  if (elTotal) elTotal.textContent = formatearCLP(totalFinal);
}

/**
 * Función para validar y aplicar cupones de descuento
 */
function configurarCupon() {
  const btnAplicar = document.getElementById('btn-aplicar-cupon');
  const inputCupon = document.getElementById('input-cupon');
  const feedback = document.getElementById('cupon-feedback');

  if (!btnAplicar || !inputCupon || !feedback) return;

  btnAplicar.addEventListener('click', function() {
    // Tomamos el código en mayúsculas y sin espacios
    const codigo = inputCupon.value.trim().toUpperCase();

    if (codigo === '') {
      feedback.textContent = 'Por favor escribe un código de cupón.';
      feedback.className = 'cupon-feedback error';
      return;
    }

    // Evaluamos si coincide con alguno de nuestros cupones válidos
    if (codigo === 'HUERTO10') {
      porcentajeDescuento = 10;
      nombreCupon = 'HUERTO10';
      feedback.textContent = '¡Cupón HUERTO10 aplicado con éxito! (10% de descuento)';
      feedback.className = 'cupon-feedback success';
      mostrarToast('¡10% de descuento aplicado!', 'success');
      recalcularTotales();
    } else if (codigo === 'FRESCURA20') {
      porcentajeDescuento = 20;
      nombreCupon = 'FRESCURA20';
      feedback.textContent = '¡Cupón FRESCURA20 aplicado con éxito! (20% de descuento)';
      feedback.className = 'cupon-feedback success';
      mostrarToast('¡20% de descuento aplicado!', 'success');
      recalcularTotales();
    } else {
      // Cupón incorrecto
      porcentajeDescuento = 0;
      nombreCupon = '';
      feedback.textContent = 'El cupón ingresado no es válido o ha expirado.';
      feedback.className = 'cupon-feedback error';
      mostrarToast('Cupón no válido', 'error');
      recalcularTotales();
    }
  });
}

/**
 * Función que maneja el botón "PAGAR PEDIDO"
 */
function configurarBotonPagar() {
  const btnPagar = document.getElementById('btn-proceder-pago');
  const modal = document.getElementById('modal-pago');
  const btnCerrarModal = document.getElementById('btn-cerrar-modal');

  if (!btnPagar) return;

  btnPagar.addEventListener('click', function() {
    const carrito = obtenerCarrito();

    // 1. Si no hay productos, informamos error y no avanzamos
    if (carrito.length === 0) {
      mostrarToast('El carrito está vacío. Agrega productos antes de pagar.', 'error');
      return;
    }

    // 2. REGLA DE NEGOCIO OBLIGATORIA: Para comprar y pagar, el usuario DEBE estar registrado e iniciar sesión
    const sesionTexto = localStorage.getItem('huerto_usuario_activo');
    if (sesionTexto === null) {
      mostrarToast('Debes iniciar sesión con tu cuenta para completar el pago.', 'error');
      setTimeout(function() {
        window.location.href = 'login.html';
      }, 1200);
      return;
    }

    // Leemos los datos del usuario activo registrado
    const u = JSON.parse(sesionTexto);
    const nombreCliente = u.nombre;
    const regionCliente = u.comuna + ' (' + u.region + ')';

    // Calculamos el monto final
    let subtotal = 0;
    for (let i = 0; i < carrito.length; i++) {
      subtotal = subtotal + (carrito[i].precio * carrito[i].cantidad);
    }
    const descuento = Math.round(subtotal * (porcentajeDescuento / 100));
    const total = subtotal - descuento;

    // Generamos un número de pedido simulado al azar
    const numeroOrden = '#HH-' + Math.floor(100000 + Math.random() * 900000);

    // Llenamos los datos en el modal de confirmación
    document.getElementById('modal-orden-num').textContent = numeroOrden;
    document.getElementById('modal-cliente-nombre').textContent = nombreCliente;
    document.getElementById('modal-despacho-destino').textContent = regionCliente;
    document.getElementById('modal-total-pagado').textContent = formatearCLP(total);

    // Mostramos la ventana modal
    if (modal) modal.classList.add('active');

    // Vacíamos el carrito en el localStorage porque la compra fue completada
    localStorage.removeItem('huerto_carrito');
    porcentajeDescuento = 0;
    actualizarContadorCarrito();
  });

  // Al cerrar el modal, volvemos a la página de inicio
  if (btnCerrarModal && modal) {
    btnCerrarModal.addEventListener('click', function() {
      modal.classList.remove('active');
      window.location.href = 'index.html';
    });
  }
}
