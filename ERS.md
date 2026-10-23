# ESPECIFICACIÓN DE REQUISITOS DE SOFTWARE (ERS)
## Sistema de Comercio Electrónico "HuertoHogar"

- **Asignatura:** Desarrollo de Software Web (DSY1104)
- **Evaluación:** Evaluación Formativa N.° 1 — Creando mi primera tienda web
- **Institución:** Duoc UC — Escuela de Informática y Telecomunicaciones
- **Caso:** Forma A — HuertoHogar
- **Versión:** 1.0.0
- **Fecha:** Septiembre 2026

---

## 1. INTRODUCCIÓN

### 1.1. Propósito
El presente documento describe la Especificación de Requisitos de Software (ERS) para el desarrollo de la plataforma web de la tienda en línea **HuertoHogar**, especializada en la comercialización y distribución de productos agrícolas frescos y sostenibles directamente desde productores locales chilenos hasta el consumidor final.

### 1.2. Alcance del Proyecto
La aplicación consta de cuatro vistas web interconectadas (`index.html`, `registro.html`, `login.html`, `carrito.html`), desarrolladas bajo estándares modernos de desarrollo frontend sin servidor (arquitectura estática cliente-servidor simulada):
- Uso estricto de HTML5 semántico.
- Hoja de estilo CSS única, centralizada y adaptativa (responsive design).
- Validaciones en el cliente mediante JavaScript nativo (vanilla JS).
- Persistencia integral de estado, sesiones y compras en `localStorage`.

---

## 2. DESCRIPCIÓN GENERAL

### 2.1. Perspectiva del Producto
HuertoHogar opera de forma autónoma en el navegador del cliente. Al no existir servidor backend en esta etapa inicial del proyecto, todas las operaciones de registro de usuarios, autenticación, gestión del catálogo y almacenamiento del carrito se ejecutan en el entorno de ejecución del cliente utilizando las APIs de almacenamiento web (`localStorage` y `sessionStorage`).

### 2.2. Características de los Usuarios
- **Visitante / Comprador:** Usuario que navega por el catálogo de productos agrícolas, visualiza información de origen, agrega productos al carro, aplica cupones de descuento y simula el pago de su orden.
- **Usuario Registrado:** Usuario que dispone de una cuenta con sus datos geográficos de despacho (región y comuna) y credenciales de acceso seguras.

### 2.3. Restricciones Técnicas
1. **HTML5 Semántico:** Obligación de usar `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>` sin reemplazarlos por contenedores genéricos (`<div>`).
2. **Estilos Centralizados:** Todo el diseño debe residir en un único archivo `assets/css/estilos.css`. Prohibido el uso de estilos en línea en el conjunto del sitio.
3. **Persistencia:** Cuentas, sesión y carrito deben sobrevivir a recargas del navegador mediante `localStorage`.
4. **Validaciones Específicas:** Errores informados junto al campo respectivo y no mediante alertas genéricas.
5. **Entorno de Red:** La solución es completamente funcional de manera local o alojada en cualquier servidor estático (GitHub Pages / Live Server).

---

## 3. REQUISITOS ESPECÍFICOS

### 3.1. Requisitos Funcionales (RF)

| Código | Módulo | Descripción del Requisito Funcional |
| :--- | :--- | :--- |
| **RF-01** | Global | El encabezado de ancho completo debe desplegar el logotipo de HuertoHogar, navegación principal y el indicador `Cart (n)` actualizado en tiempo real según el contenido de `localStorage`. |
| **RF-02** | Global | La barra superior debe mostrar los accesos de "Iniciar sesión" y "Registrar usuario", o bien el saludo al usuario activo con opción de "Cerrar sesión". |
| **RF-03** | Inicio | La portada (Hero) debe estructurarse a dos columnas con título, texto de valor, botón hacia el catálogo e imagen representativa con atributo `alt` descriptivo. |
| **RF-04** | Inicio | El catálogo debe renderizar los ocho (8) productos oficiales del caso en elementos semánticos `<article>`, mostrando código, imagen, nombre, atributo, precio en CLP y botón de adición al carro. |
| **RF-05** | Inicio | Debe incluirse una sección con video embebido (`<video>` o `iframe`) capaz de reproducirse correctamente en el navegador. |
| **RF-06** | Inicio | El pie de página (`<footer>`) debe incluir el nombre de la tienda, tres categorías, mención a medios de pago chilenos y un formulario de boletín funcional. |
| **RF-07** | Registro | El formulario de registro debe validar obligatoriedad, letras y espacios en Nombre completo (máx. 50 caracteres). |
| **RF-08** | Registro | El formulario de registro debe verificar el formato de correo electrónico y validar su unicidad respecto a cuentas previas en `localStorage`. |
| **RF-09** | Registro | El formulario de registro debe exigir confirmación exacta de correo electrónico y contraseña. |
| **RF-10** | Registro | La contraseña debe exigir mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula, 1 número y 1 símbolo especial (`@#$%!.*`). |
| **RF-11** | Registro | El teléfono debe ser opcional, pero de ingresarse, validar formato de móvil chileno (`+56 9 XXXX XXXX` o `9XXXXXXXX`). |
| **RF-12** | Registro | El selector de regiones debe contener mínimo 3 regiones y actualizar dinámicamente el selector de comunas asociadas (mínimo 2 por región). |
| **RF-13** | Login | El login debe discriminar y reportar el origen exacto del error: si la cuenta no existe o si la contraseña es incorrecta (no error genérico). |
| **RF-14** | Carrito | La vista de carrito debe listar cada producto en un `<article>` con imagen, precio unitario, controles `[-]`, `[cantidad]`, `[+]` y eliminar automáticamente el producto si la cantidad llega a cero. |
| **RF-15** | Carrito | El resumen debe recalcular subtotales y total en tiempo real, admitir cupones válidos (`HUERTO10`) con descuento porcentual, y simular el checkout con comprobante de orden y vaciado de carro. |
| **RF-16** | Carrito | Si el carrito está vacío, debe informar claramente el estado con botón directo de retorno al catálogo sin dejar la vista en blanco. |

---

### 3.2. Requisitos No Funcionales (RNF)

| Código | Dimensión | Descripción del Requisito No Funcional |
| :--- | :--- | :--- |
| **RNF-01** | Semántica | El marcado HTML debe ajustarse a las directrices de accesibilidad y semántica HTML5 sin anidar contenedores genéricos sustitutos. |
| **RNF-02** | Diseño Visual | Se debe implementar la paleta oficial de HuertoHogar: Blanco Suave (`#F7F7F7`), Verde Esmeralda (`#2E8B57`), Amarillo Mostaza (`#FFD700`), Marrón Claro (`#8B4513`), Gris Oscuro (`#333333`) y Gris Medio (`#666666`). |
| **RNF-03** | Tipografía | Se deben cargar tipografías limpias vía Google Fonts: *Montserrat* para cuerpo de texto y *Playfair Display* para encabezados. |
| **RNF-04** | Responsive | El diseño debe implementar `@media (max-width: 768px)` donde la portada pase a 1 columna y el catálogo no se comprima a 4 columnas. |
| **RNF-05** | Unidades | El código CSS debe utilizar al menos dos unidades de medida distintas (`rem` para textos y espaciados, `px` para bordes y radios). |
| **RNF-06** | Usabilidad | Cada campo de formulario debe contar con etiquetas `<label for="...">` asociadas, sugerencia de formato visible y mensajes de error junto al campo. |
| **RNF-07** | Rendimiento | Carga ultra rápida sin dependencias pesadas ni frameworks, ejecutando JavaScript nativo optimizado. |
| **RNF-08** | Versionamiento | El proyecto debe gestionarse con Git con commits descriptivos en español. |

---

## 4. MODELO DE DATOS EN `localStorage`

### 4.1. Estructura de Usuarios (`huerto_usuarios`)
```json
[
  {
    "nombre": "Camila Silva",
    "correo": "cliente@huertohogar.cl",
    "password": "Password2026*",
    "telefono": "+56 9 8765 4321",
    "region": "Región Metropolitana",
    "comuna": "Santiago",
    "fechaRegistro": "2026-09-08T04:30:00.000Z"
  }
]
```

### 4.2. Estructura de Sesión Activa (`huerto_usuario_activo`)
```json
{
  "nombre": "Camila Silva",
  "correo": "cliente@huertohogar.cl",
  "region": "Región Metropolitana",
  "comuna": "Santiago",
  "loginTimestamp": "2026-09-08T04:35:00.000Z"
}
```

### 4.3. Estructura de Carrito de Compras (`huerto_carrito`)
```json
[
  {
    "codigo": "FR001",
    "nombre": "Manzanas Fuji",
    "precio": 1200,
    "unidad": "kilo",
    "descripcion": "Manzanas Fuji crujientes y dulces...",
    "imagen": "assets/img/manzanas.svg",
    "cantidad": 3
  },
  {
    "codigo": "PO001",
    "nombre": "Miel Orgánica",
    "precio": 5000,
    "unidad": "frasco de 500g",
    "descripcion": "Miel pura y orgánica producida...",
    "imagen": "assets/img/miel.svg",
    "cantidad": 1
  }
]
```

---

## 5. CATÁLOGO MAESTRO DE PRODUCTOS (8 ÍTEMS)

1. **FR001 - Manzanas Fuji:** $1.200 CLP/kilo. Stock: 150 kilos. Origen: Valle del Maule.
2. **FR002 - Naranjas Valencia:** $1.000 CLP/kilo. Stock: 200 kilos. Atributo: Ricas en Vitamina C.
3. **FR003 - Plátanos Cavendish:** $800 CLP/kilo. Stock: 250 kilos. Atributo: Ricos en Potasio.
4. **VR001 - Zanahorias Orgánicas:** $900 CLP/kilo. Stock: 100 kilos. Origen: Región de O'Higgins.
5. **VR002 - Espinacas Frescas:** $700 CLP/bolsa 500g. Stock: 80 bolsas. Atributo: Cultivo Orgánico.
6. **VR003 - Pimientos Tricolores:** $1.500 CLP/kilo. Stock: 120 kilos. Atributo: Mix Rojo, Amarillo y Verde.
7. **PO001 - Miel Orgánica:** $5.000 CLP/frasco 500g. Stock: 50 frascos. Atributo: Apicultores Locales.
8. **PO003 - Quinua Orgánica:** $3.200 CLP/kilo. Stock: 70 kilos. Atributo: Grano Andino Seleccionado.

---

## 6. CONCLUSIÓN
El sistema satisface al 100% las exigencias de la Evaluación Formativa N.° 1 de la asignatura DSY1104, ofreciendo una experiencia visual y funcional robusta, moderna y pedagógicamente justificable.

