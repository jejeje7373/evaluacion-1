# Informe de Pruebas Unitarias, Seguridad y Cobertura — HuertoHogar

> **Asignatura:** Desarrollo de Software Web (DSY1104)  
> **Institución:** Duoc UC — Escuela de Informática y Telecomunicaciones  
> **Stack Frontend:** React 18, Vite 5, Axios, Bootstrap 5, Jasmine 5, Karma 6, Istanbul Coverage  
> **Stack Backend:** Spring Boot 3.4.3 (Java 21), Spring Security + JWT + BCrypt, MySQL / H2 (tests)  
> **Resultado de Ejecución Frontend:** `64 of 64 SUCCESS (100% Exitoso, 0 FAILED)`

---

## 1. Arquitectura de Seguridad e Integración Full-Stack

- **Autenticación y Roles (`ADMIN` / `VENDEDOR` / `CLIENTE`):**
  - Login (`POST /api/auth/login`) y registro (`POST /api/auth/register`) reales en `ms-usuarios` con hash **BCrypt** y emisión de **JWT**. Permite registrar cuentas `CLIENTE` o `VENDEDOR` desde el frontend (nunca `ADMIN`).
  - `GET /api/auth/me` valida la sesión al recargar la app (sin credenciales quemadas ni `localStorage`).
  - Rutas protegidas en React (`App.jsx`) bloquean `#admin` para usuarios no autenticados (`401`) y para usuarios `CLIENTE` (`403 Acceso Denegado`), habilitando el panel para `ADMIN` (gestión completa) y `VENDEDOR` (publicación V Región, estadísticas de ventas, visualizaciones y descarga detallada).
- **Autorización y Reglas de Negocio en Microservicios Spring Boot:**
  - Endpoints de usuarios (`/api/users/**`), categorías, eliminación/restauración de productos (`DELETE`/`/reset`), edición/borrado de órdenes y edición/borrado de reportes protegidos para `ADMIN` (`401` / `403`).
  - Publicación y edición de productos (`POST`/`PUT /api/products`) permitida para `ADMIN` y `VENDEDOR`, validando en backend que el origen pertenezca a la **V Región de Valparaíso** (`400 Bad Request` en caso contrario), y seguimiento persistente de visualizaciones (`POST /api/products/{codigo}/visualizacion`).
- **Capa de Servicios y Variables de Entorno (`src/services/api.js`):**
  - URLs base configuradas mediante `import.meta.env.VITE_API_*` (`.env` / `.env.example`), sin `localhost` fijo en `src/`.
  - Interceptores Axios inyectan `Authorization: Bearer <token>` y gestionan expiración `401`.

---

## 2. Cobertura de Código Frontend (Karma + `karma-coverage` + Istanbul)

Al ejecutar `npm test` (`karma start karma.conf.cjs --single-run`), Chrome Headless genera el reporte HTML/LCOV en `coverage/` con las siguientes métricas:

```text
Chrome Headless 154.0.0.0 (Linux 0.0.0): Executed 64 of 64 SUCCESS (2.167 secs / 2.083 secs)
TOTAL: 64 SUCCESS

=============================== Coverage summary ===============================
Statements   : 52.06% ( 795/1527 )
Branches     : 44.39% ( 554/1248 )
Functions    : 38.58% ( 164/425 )
Lines        : 54.71% ( 754/1378 )
================================================================================
```

Reportes generados en disco:
- `coverage/index.html` (reporte interactivo por archivo)
- `coverage/lcov.info` (formato LCOV)

---

## 3. Desglose Suite por Suite (64 Pruebas Frontend)

| Archivo de Prueba | Pruebas | Qué Valida |
|---|---:|---|
| `tests/AdminProducts.spec.jsx` | 12 | CRUD de productos, validación estricta V Región, búsqueda reactiva, CRUD de usuarios (`ADMIN`/`VENDEDOR`/`CLIENTE`), estadísticas de visualizaciones totales, desglose por producto y descarga CSV detallada. |
| `tests/api.spec.jsx` | 11 | Variables de entorno en `API_ENDPOINTS`, sesión JWT en `sessionStorage` (cero `localStorage`), normalización de roles, interceptores `Authorization` y `401`, CRUD de productos, usuarios, `PATCH /estado`, `POST /visualizacion` y errores `400/401/403/404`. |
| `tests/Cart.spec.jsx` | 7 | Estado vacío, subtotales CLP, incremento/decremento de stock, eliminación, cupones `HOGAR10`/`FRESCO15`, rechazo de cupón inválido y checkout. |
| `tests/Navbar.spec.jsx` | 7 | Badge del carrito, vista invitado vs autenticado, cierre de sesión, cambio de vista, menú colapsable móvil y visibilidad de Panel Admin/Vendedor. |
| `tests/RegisterForm.spec.jsx` | 7 | Renderizado de campos, select dependiente Región/Comuna (incluyendo comunas de V Región), coincidencia de contraseñas, términos obligatorios, registro como `CLIENTE` o `VENDEDOR` y manejo de error `400`. |
| `tests/LoginForm.spec.jsx` | 6 | Renderizado sin credenciales quemadas, validación de campos vacíos/email, autenticación asíncrona `ADMIN`, manejo de errores HTTP `401/403` y navegación a registro. |
| `tests/AppSecurity.spec.jsx` | 5 | Protección de ruta `#admin` ante invitados (`401`) y `CLIENTE` (`403`), acceso a `ADMIN` y `VENDEDOR` (sin exponer `/users`), y estados de carga/error con botón Reintentar. |
| `tests/ProductCard.spec.jsx` | 5 | Datos del producto, control de cantidad, tope de stock, callback de agregado al carrito y feedback visual en DOM. |
| `tests/ProductDetail.spec.jsx` | 3 | Detalle técnico completo del producto, navegación de retorno y agregado múltiple al carrito. |
| **Total Frontend** | **64** | **64 SUCCESS / 0 FAILED** |

---

## 4. Pruebas de Integración y Seguridad Backend (`mvn test`)

- **`ms-usuarios` (`UsuariosSecurityIntegrationTest` — 4 tests):**
  - Login exitoso (`200`) sin exponer el campo `password` en el JSON.
  - Rechazo de credenciales inválidas (`401`).
  - Registro público (`201`) de `CLIENTE` y `VENDEDOR` con contraseña hasheada con BCrypt (`$2...`) y bloqueo `403` en `/api/users`.
  - Validación RBAC en `/api/users`: `401` anónimo, `403` rol `CLIENTE`/`VENDEDOR`, `201/200/204/404` rol `ADMIN`, desactivación vía `PATCH /estado` y bloqueo `403` en login inactivo.
- **`ms-productos` (`ProductosSecurityCrudTest` — 3 tests):**
  - Lectura pública (`200`) y recurso inexistente (`404`).
  - Seguridad RBAC y validaciones en CRUD: `401` anónimo, `403` rol `CLIENTE`, `400` entrada inválida, `201/200/204/404` rol `ADMIN`.
  - Validación rol `VENDEDOR`: `400` si origen está fuera de la 5ª Región, `201` dentro de la 5ª Región, conteo persistente en `POST /{codigo}/visualizacion` y `403` al intentar `/reset`.
- **`ms-categorias`, `ms-ventas`, `ms-reportes`:** compilación y contexto de pruebas verificados con `mvn test` (`BUILD SUCCESS`).
