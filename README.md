# 🌿 HuertoHogar — Tienda Web de Productos del Campo

> **Evaluación Formativa N.° 1 — Creando mi primera tienda web**  
> **Asignatura:** Desarrollo de Software Web (DSY1104)  
> **Institución:** Duoc UC — Escuela de Informática y Telecomunicaciones  
> **Caso Seleccionado:** FORMA A — Caso HuertoHogar  

---

## 📌 1. Descripción del Proyecto

**HuertoHogar** es una tienda online chilena con más de 6 años de trayectoria dedicada a conectar a las familias con la frescura, calidad y sostenibilidad de los productos del campo. Operamos en más de 9 puntos clave del país (Santiago, Viña del Mar, Valparaíso, Concepción, Nacimiento, Villarrica, Puerto Montt, entre otros).

Esta solución web implementa una arquitectura frontend basada estrictamente en **HTML5 semántico**, estilos centralizados mediante **CSS3 moderno y responsive** (`assets/css/estilos.css`), validación de formularios en tiempo real con **JavaScript nativo**, y persistencia total de usuarios, sesiones y carrito de compras a través de **`localStorage`**.

---

## 📂 2. Estructura del Repositorio

```text
evualuacion1/
├── index.html                    # Vista 1: Inicio (Hero 2 columnas, catálogo 8 artículos, video, cobertura, footer)
├── registro.html                 # Vista 2: Registro de usuarios con validaciones y select dependiente
├── login.html                    # Vista 3: Inicio de sesión con discriminación de errores específicos
├── carrito.html                  # Vista 4: Carrito de compras, cupones, recálculo reactivo y pago simulado
├── README.md                     # Guía del proyecto e instrucciones de ejecución
├── ERS.md                        # Especificación de Requisitos de Software (IEEE 830 adaptado)
└── assets/
    ├── css/
    │   └── estilos.css           # Única hoja de estilos externa para todo el sitio web
    ├── js/
    │   ├── main.js               # Catálogo maestro, contador Cart (n), barra de sesión y utilitarios
    │   ├── registro.js           # Validaciones en cliente, regiones/comunas de Chile y persistencia
    │   ├── login.js              # Validación de credenciales y discriminación de causa de error
    │   └── carrito.js            # Controles de cantidad (+/-), cupones, totales y orden simulada
    └── img/
        ├── logo.svg              # Logotipo vectorial oficial de HuertoHogar
        ├── hero-campo.svg        # Portada ilustrada del campo chileno y canasta de cosecha
        ├── manzanas.svg          # FR001 - Manzanas Fuji
        ├── naranjas.svg          # FR002 - Naranjas Valencia
        ├── platanos.svg          # FR003 - Plátanos Cavendish
        ├── zanahorias.svg        # VR001 - Zanahorias Orgánicas
        ├── espinacas.svg         # VR002 - Espinacas Frescas
        ├── pimientos.svg         # VR003 - Pimientos Tricolores
        ├── miel.svg              # PO001 - Miel Orgánica
        └── quinua.svg            # PO003 - Quinua Orgánica
```

---

## 🚀 3. Instrucciones para Abrir y Probar el Sitio

### Opción A: Directamente desde el Navegador (Sin instalación)
1. Descarga o clona este repositorio en tu computadora.
2. Navega hasta la carpeta del proyecto.
3. Haz doble clic sobre el archivo `index.html` (se abrirá en Google Chrome, Microsoft Edge, Mozilla Firefox o Safari).

### Opción B: Con Visual Studio Code (Live Server)
1. Abre la carpeta del proyecto en **VS Code**.
2. Instala la extensión **Live Server** (de Ritwick Dey).
3. Haz clic derecho en `index.html` y selecciona **"Open with Live Server"**.
4. El sitio se desplegará localmente en `http://127.0.0.1:5500`.

---

## 🔑 4. Datos y Credenciales de Prueba

Para facilitar la revisión docente y pruebas inmediatas, el sistema incluye datos preconfigurados:

### Usuario de Prueba (Pre-cargado en `localStorage`)
- **Correo:** `cliente@huertohogar.cl`
- **Contraseña:** `Password2026*`
*(También puedes crear un nuevo usuario en `registro.html` y este se guardará automáticamente en el navegador).*

### Cupones de Descuento Válidos (para probar en `carrito.html`)
- `HUERTO10`: **10% de descuento** sobre el total de la compra.
- `FRESCURA20`: **20% de descuento** sobre el total de la compra.
- `CAMPO15`: **15% de descuento** sobre el total de la compra.
*(Cualquier otro cupón ingresado mostrará el mensaje de error correspondiente).*

---

## 📋 5. Cumplimiento de Resultados Esperados (DSY1104)

1. **Estructura semántica HTML5:** Se utilizan elementos nativos `<header>`, `<nav>`, `<main>`, `<section>`, `<article>` y `<footer>` en todas las páginas sin sustitución por `<div>` genéricos.
2. **Hoja de estilos externa única:** Ubicada en `assets/css/estilos.css`, sin estilos en línea en el cuerpo del sitio, con reset `box-sizing: border-box`, fuentes Google Fonts (*Montserrat* y *Playfair Display*) y paleta oficial de HuertoHogar.
3. **Validaciones en JavaScript:** Detección en tiempo real y en submit con mensajes de error individuales junto al control respectivo (nombre solo letras, correo válido y único, confirmaciones idénticas, contraseña compleja con símbolos, teléfono móvil chileno, select dependiente región/comuna).
4. **Persistencia en `localStorage`:** Almacenamiento no volátil de cuentas de usuario, sesión activa y productos del carrito; el indicador `Cart (n)` se sincroniza en las cuatro vistas.
5. **Discriminación de errores en Login:** Mensaje específico si la cuenta no existe versus si la contraseña es errónea.
6. **Diseño Responsive:** Media query en `@media (max-width: 768px)` que adapta la portada a una sola columna y reorganiza el catálogo de productos fluidamente sin comprimirlo.
7. **Documentación:** Especificación de Requisitos de Software formal en [`ERS.md`](ERS.md) adjunta según pauta.

---

## 👨‍💻 Autor y Asignatura
- **Proyecto:** Evaluación Formativa N.° 1 — DSY1104
- **Carrera:** Informática / Analista Programador — Duoc UC

