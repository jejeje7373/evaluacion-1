# Informe de Pruebas Unitarias y Concepto de DOM — HuertoHogar

> **Asignatura:** Desarrollo de Software Web (DSY1104)  
> **Institución:** Duoc UC — Escuela de Informática y Telecomunicaciones  
> **Frameworks:** React 18, Bootstrap 5, Jasmine & Karma  
> **Resultado de Ejecución:** `38 of 38 SUCCESS (100% Exitoso)`

---

## 1. ¿Qué significa el DOM? (Document Object Model)

### 1.1. Definición Simple y Clara
**DOM** son las siglas de **Document Object Model** (*Modelo de Objetos del Documento*).

Cuando un navegador web (Google Chrome, Firefox, Edge) lee un archivo HTML, no lo muestra como un texto plano. En su lugar, el navegador toma todo el código y crea un **árbol de objetos en memoria**.

Cada etiqueta HTML (`<div>`, `<h1>`, `<button>`, `<input>`, `<table>`, `<tr>`) se transforma en un **nodo u objeto** con propiedades (`textContent`, `value`, `className`, `disabled`) y métodos (`click()`, `addEventListener()`).

### 1.2. ¿Por qué es tan importante en React y el Frontend?
1. **Representación Visual Viva:** El DOM es la estructura que el usuario ve e interactúa en pantalla.
2. **Manipulación Dinámica:** Mediante React y JavaScript, se modifica el DOM en tiempo real sin recargar la página:
   - Modificar texto de precios y subtotales.
   - Mostrar y ocultar alertas de validación de formularios.
   - Insertar o eliminar filas `<tr>` en la tabla de productos del panel de administración.
   - Habilitar o deshabilitar botones según las reglas de negocio (ej. límite de stock disponible).
3. **¿Qué significa "Verificar la manipulación del DOM" en las pruebas unitarias?**
   Significa que las pruebas unitarias no solo revisan variables internas de código, sino que comprueban que los elementos HTML realmente cambien en la pantalla:
   - *Ejemplo:* Si el usuario presiona el botón `+` de cantidad, la prueba busca el elemento `<input>` en el DOM y comprueba que su atributo `value` cambió de `"1"` a `"2"`.
   - *Ejemplo:* Si el usuario intenta enviar un formulario sin completar los datos requeridos, la prueba comprueba que en el DOM se haya insertado un elemento con la clase `.invalid-feedback`.

---

## 2. Explicación de los Resultados del Testeo (Karma & Jasmine)

Al ejecutar `npm test`, la terminal reporta:
```text
Chrome Headless 154.0.0.0 (Linux 0.0.0): Executed 38 of 38 SUCCESS (1.794 secs)
TOTAL: 38 SUCCESS (0 FAILED)
```

### 2.1. ¿Qué significan estas líneas?
- **`Chrome Headless`**: Es una instancia real del navegador Google Chrome ejecutándose sin entorno gráfico (modo headless). Esto asegura que los componentes se prueban en un motor de navegación real con soporte completo de HTML5, CSS y eventos del DOM.
- **`Executed 38 of 38 SUCCESS`**: Se ejecutaron 38 casos de prueba distintos y el 100% de ellos fue aprobado.
- **`0 FAILED`**: Ningún componente arrojó errores de lógica, cálculo o manipulación del DOM.
- **`1.794 secs`**: Todas las 38 pruebas se completaron en menos de 2 segundos.

---

## 3. Desglose Suite por Suite: ¿Qué valida cada prueba?

### Suite 1: Componente `AdminProducts` (8 pruebas - CRUD Completo)
Verifica la gestión administrativa de los productos:
1. **`[READ] Renderizado de tabla`:** Comprueba que los productos registrados se dibujen en filas `<tr>` del DOM con sus nombres, precios y stock.
2. **`[CREATE] Validación de campos vacíos`:** Intenta enviar el formulario vacío; comprueba que el DOM muestre mensajes de error en rojo y no agregue el producto.
3. **`[CREATE] Rechazo de códigos duplicados`:** Si se ingresa un código existente (ej. `FR001`), el DOM informa el error impidiendo la duplicación.
4. **`[CREATE] Creación exitosa`:** Rellena campos válidos, pulsa "Guardar Nuevo Producto" y valida que se invoque la función `onAddProduct` con todos los datos.
5. **`[UPDATE] Edición y actualización`:** Al pulsar "Editar", el formulario se precarga en el DOM; al cambiar datos y guardar, se invoca `onUpdateProduct`.
6. **`[DELETE] Eliminación con confirmación`:** Pulsa "Borrar", intercepta el diálogo de confirmación (`window.confirm`) y verifica que se llame a `onDeleteProduct`.
7. **`[FILTER / SEARCH] Búsqueda en tiempo real`:** Escribe un término en el buscador y comprueba que las filas del DOM que no coincidan se oculten dinámicamente.
8. **`Restablecer Catálogo`:** Valida que el botón de restaurar ejecute `onResetDefaults` para devolver los productos originales.

### Suite 2: Componente `Cart` (7 pruebas - Carrito de Compras)
1. **`Carrito vacío`:** Si no hay productos, comprueba que el DOM muestre el mensaje "Tu carrito está vacío".
2. **`Cálculo de subtotales`:** Multiplica precio por cantidad y verifica que los montos formateados en moneda chilena coincidan en la tabla.
3. **`Botones + y - de cantidad`:** Al hacer clic, comprueba la llamada a `onUpdateQuantity` con la nueva cifra.
4. **`Botón eliminar`:** Al presionar la papelera de un producto, verifica la llamada a `onRemoveItem`.
5. **`Cupón HOGAR10 (10% descuento)`:** Aplica el cupón y verifica en el DOM que aparezca el mensaje de éxito y el recálculo matemático del total.
6. **`Rechazo de cupón inválido`:** Con un cupón inexistente, el DOM muestra alerta de error.
7. **`Simulación de Pago y Vaciado`:** Al presionar "Finalizar Compra", se vacía el carrito con `onClearCart` y el DOM despliega la orden simulada.

### Suite 3: Componente `LoginForm` (6 pruebas - Autenticación)
1. **`Render de elementos`:** Verifica la presencia de los campos de correo, contraseña y botón de ingreso.
2. **`Validación de campos vacíos`:** Bloquea el envío si los campos están vacíos y despliega alerta de error en el DOM.
3. **`Regex de correo electrónico`:** Valida que correos sin formato válido sean rechazados con advertencia visual.
4. **`Login exitoso`:** Con las credenciales válidas, dispara el callback `onLoginSuccess`.
5. **`Credenciales erróneas`:** Con contraseñas incorrectas, el DOM muestra "Credenciales inválidas".
6. **`Navegación`:** El enlace a registro redirige correctamente a la vista de creación de cuenta.

### Suite 4: Componente `Navbar` (7 pruebas - Navegación, Sesión y Control de Acceso)
1. **`Badge de cantidad`:** Comprueba que el número dentro del badge amarillo coincida con la cantidad de artículos en el carro.
2. **`Vista de invitado`:** Cuando no hay usuario autenticado, muestra los botones de "Iniciar Sesión" y "Registro".
3. **`Vista de usuario conectado`:** Con sesión iniciada, muestra el saludo personalizado y el botón "Cerrar Sesión".
4. **`Cierre de sesión`:** Pulsar "Cerrar Sesión" dispara el evento `onLogout`.
5. **`Cambio de vista`:** Pulsar enlaces de navegación cambia la pantalla activa.
6. **`Menú móvil colapsable`:** Verifica que el botón toggler alterne la clase `.collapse` para abrir y cerrar el menú en móviles.
7. **`Control de Acceso Admin`:** Verifica que el botón "Panel Admin" sea invisible para invitados y clientes, y **solo aparezca** cuando el usuario tiene rol `admin`.

### Suite 5: Componente `ProductCard` (5 pruebas - Tarjeta de Producto)
1. **`Props visuales`:** Comprueba que nombre, precio CLP, categoría, stock y origen se inyecten correctamente en el HTML.
2. **`Estado de cantidad local (+/-)`:** El contador sube y baja al hacer clic, sin bajar de 1.
3. **`Límite de stock disponible`:** Impide que el usuario agregue más unidades de las disponibles (botón `+` se desactiva).
4. **`Callback de agregado`:** Al pulsar "Agregar", llama a `onAddToCart` con el producto y la cantidad elegida.
5. **`Feedback en el DOM`:** Comprueba la aparición temporal de la alerta verde de confirmación.

### Suite 6: Componente `RegisterForm` (5 pruebas - Formulario y Select Dependiente)
1. **`Render de campos`:** Nombre, email, contraseñas, región, comuna y términos.
2. **`Select dependiente (Región -> Comuna)`:** Al seleccionar una región (ej. *Región de Valparaíso*), el selector de comunas se desbloquea en el DOM y carga *Viña del Mar*, *Valparaíso*, etc.
3. **`Contraseñas desiguales`:** Comprueba que detecte la discrepancia y pinte el input con mensaje de error en el DOM.
4. **`Términos obligatorios`:** Exige marcar el checkbox de términos para poder registrarse.
5. **`Persistencia simulada`:** Con un Mock/Spy sobre `localStorage.setItem`, comprueba que el nuevo usuario quede guardado en `localStorage`.
