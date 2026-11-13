import React, { useState } from 'react';
import { CATEGORIAS, UBICACIONES_ORIGEN, esOrigenValidoQuintaRegion, normalizarOrigenProducto } from '../data/products.js';
import { REGIONES_CHILE } from '../data/regiones.js';
import { obtenerMensajeError } from '../services/api.js';
import { calcularEstadisticasDetalladas, generarCsvEstadisticasDetalladas } from '../utils/estadisticas.js';

const normalizarTexto = (txt = '') =>
  txt.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const IMAGENES_DISPONIBLES = [
  { label: 'Manzanas (FR001)', value: 'assets/img/manzanas.svg' },
  { label: 'Naranjas (FR002)', value: 'assets/img/naranjas.svg' },
  { label: 'Plátanos (FR003)', value: 'assets/img/platanos.svg' },
  { label: 'Zanahorias (VR001)', value: 'assets/img/zanahorias.svg' },
  { label: 'Espinacas (VR002)', value: 'assets/img/espinacas.svg' },
  { label: 'Pimientos (VR003)', value: 'assets/img/pimientos.svg' },
  { label: 'Miel (PO001)', value: 'assets/img/miel.svg' },
  { label: 'Quinua (PO003)', value: 'assets/img/quinua.svg' }
];

/**
 * Componente AdminProducts (Panel de Administración Integral: CRUD de los 5 Microservicios)
 * 
 * Módulos CRUD conectados al Backend:
 * 1. Productos (ms-productos :8083)
 * 2. Categorías (ms-categorias :8082)
 * 3. Usuarios (ms-usuarios :8081)
 * 4. Ventas / Órdenes (ms-ventas :8084)
 * 5. Reportes y Dashboard (ms-reportes :8085)
 */
export default function AdminProducts({
  productos = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetDefaults,
  onExitAdmin,
  // Categorías CRUD (:8082)
  categoriasObj = [],
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  // Usuarios CRUD
  usuarios = [],
  onAddUser,
  onUpdateUser,
  onToggleUserStatus,
  onDeleteUser,
  // Ventas/Órdenes CRUD
  ordenes = [],
  onUpdateOrderStatus,
  onDeleteOrder,
  // Reportes CRUD
  reportes = [],
  reportesProductos = [],
  dashboardStats = null,
  onCreateReport,
  onUpdateReport,
  onDeleteReport,
  onUpdateProductReportStatus,
  onDeleteProductReport,
  onRefreshAll,
  cargandoAdmin = false,
  errorAdmin = '',
  currentUser = null
}) {
  const rolActual = (currentUser?.rol || currentUser?.role || 'ADMIN').toUpperCase();
  const esVendedor = rolActual === 'VENDEDOR';
  const esAdmin = !esVendedor;

  const [tabActiva, setTabActiva] = useState('productos');
  const [alerta, setAlerta] = useState(null);

  // Lista de nombres de categorías para el selector de productos
  const nombresCategorias = categoriasObj.length > 0
    ? ['Todas', ...categoriasObj.map(c => c.nombre)]
    : CATEGORIAS;

  const categoriasSinTodas = nombresCategorias.filter(c => c !== 'Todas');

  // ==========================================
  // 1. ESTADO Y LÓGICA CRUD PRODUCTOS (:8083)
  // ==========================================
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoEnEdicion, setProductoEnEdicion] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');

  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    categoria: 'Frutas Frescas',
    precio: '',
    unidad: 'kilo',
    stock: '',
    atributo: '',
    descripcion: '',
    imagen: 'assets/img/manzanas.svg'
  });

  const [formErrors, setFormErrors] = useState({});

  const mostrarAlerta = (tipo, mensaje) => {
    setAlerta({ tipo, mensaje });
    setTimeout(() => setAlerta(null), 3500);
  };

  const limpiarFormulario = () => {
    setFormData({
      codigo: '',
      nombre: '',
      categoria: categoriasSinTodas[0] || 'Frutas Frescas',
      precio: '',
      unidad: 'kilo',
      stock: '',
      atributo: '',
      descripcion: '',
      imagen: 'assets/img/manzanas.svg'
    });
    setFormErrors({});
    setModoEdicion(false);
    setProductoEnEdicion(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validarFormulario = () => {
    const errors = {};

    if (!formData.codigo.trim()) {
      errors.codigo = 'El código es obligatorio (ej: FR004).';
    } else if (!modoEdicion) {
      const existe = productos.some(p => p.codigo.toUpperCase() === formData.codigo.trim().toUpperCase());
      if (existe) {
        errors.codigo = 'Este código de producto ya existe en el catálogo.';
      }
    }

    if (!formData.nombre.trim() || formData.nombre.trim().length < 3) {
      errors.nombre = 'El nombre debe tener al menos 3 caracteres.';
    }

    if (!formData.precio || Number(formData.precio) <= 0) {
      errors.precio = 'El precio debe ser un número mayor a 0.';
    }

    if (formData.stock === '' || Number(formData.stock) < 0) {
      errors.stock = 'El stock debe ser un número mayor o igual a 0.';
    }

    if (!formData.atributo.trim()) {
      errors.atributo = 'Debes ingresar o seleccionar una ubicación de origen de la V Región.';
    } else if (!esOrigenValidoQuintaRegion(formData.atributo)) {
      errors.atributo = 'Ubicación inválida: solo se permiten ubicaciones de la V Región de Valparaíso. Intente de nuevo.';
      mostrarAlerta(
        'danger',
        `Ubicación inválida ("${formData.atributo}"): no se permiten orígenes de otra región o país. Intente de nuevo con una localidad de la 5ª Región.`
      );
    }

    if (!formData.descripcion.trim()) {
      errors.descripcion = 'La descripción es obligatoria.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    const productoPayload = {
      codigo: formData.codigo.trim().toUpperCase(),
      nombre: formData.nombre.trim(),
      categoria: formData.categoria,
      precio: Number(formData.precio),
      unidad: formData.unidad.trim() || 'kilo',
      stock: Number(formData.stock),
      atributo: formData.atributo.trim(),
      descripcion: formData.descripcion.trim(),
      imagen: formData.imagen.trim() || 'assets/img/manzanas.svg'
    };

    try {
      if (modoEdicion) {
        if (onUpdateProduct) {
          await onUpdateProduct(productoPayload);
        }
        mostrarAlerta('success', `Producto "${productoPayload.nombre}" actualizado con éxito.`);
      } else {
        if (onAddProduct) {
          await onAddProduct(productoPayload);
        }
        mostrarAlerta('success', `Producto "${productoPayload.nombre}" agregado exitosamente al catálogo.`);
      }
      limpiarFormulario();
    } catch (err) {
      mostrarAlerta('danger', err?.response?.data?.error || 'Error al guardar el producto en el servidor.');
    }
  };

  const handleEditarClick = (prod) => {
    const prodNormalizado = normalizarOrigenProducto(prod);
    setModoEdicion(true);
    setProductoEnEdicion(prod.codigo);
    setFormData({
      codigo: prod.codigo,
      nombre: prod.nombre,
      categoria: prod.categoria,
      precio: prod.precio,
      unidad: prod.unidad,
      stock: prod.stock,
      atributo: prodNormalizado.atributo || '',
      descripcion: prod.descripcion || '',
      imagen: prod.imagen || 'assets/img/manzanas.svg'
    });
    setFormErrors({});

    const formEl = document.getElementById('admin-form-anchor');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEliminarClick = async (codigo, nombre) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${nombre}" (${codigo})?`)) {
      try {
        if (onDeleteProduct) {
          await onDeleteProduct(codigo);
        }
        mostrarAlerta('warning', `Producto "${nombre}" eliminado del catálogo.`);
        if (modoEdicion && productoEnEdicion === codigo) {
          limpiarFormulario();
        }
      } catch (err) {
        mostrarAlerta('danger', err?.response?.data?.error || 'Error al eliminar producto.');
      }
    }
  };

  // ==========================================
  // 2. ESTADO Y LÓGICA CRUD CATEGORÍAS (:8082)
  // ==========================================
  const [catEditId, setCatEditId] = useState(null);
  const [catForm, setCatForm] = useState({ nombre: '', descripcion: '' });

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    if (!catForm.nombre.trim()) {
      mostrarAlerta('danger', 'El nombre de la categoría es obligatorio.');
      return;
    }
    try {
      if (catEditId) {
        if (onUpdateCategory) await onUpdateCategory(catEditId, catForm);
        mostrarAlerta('success', `Categoría "${catForm.nombre}" actualizada.`);
      } else {
        if (onAddCategory) await onAddCategory(catForm);
        mostrarAlerta('success', `Categoría "${catForm.nombre}" creada.`);
      }
      setCatEditId(null);
      setCatForm({ nombre: '', descripcion: '' });
    } catch (err) {
      mostrarAlerta('danger', err?.response?.data?.error || 'Error al guardar la categoría.');
    }
  };

  const handleCatDelete = async (cat) => {
    if (window.confirm(`¿Eliminar la categoría "${cat.nombre}"?`)) {
      try {
        if (onDeleteCategory) await onDeleteCategory(cat.id);
        mostrarAlerta('warning', `Categoría "${cat.nombre}" eliminada.`);
      } catch (err) {
        mostrarAlerta('danger', err?.response?.data?.error || 'Error al eliminar la categoría.');
      }
    }
  };

  // ==========================================
  // 3. ESTADO Y LÓGICA CRUD USUARIOS (:8081)
  // ==========================================
  const [userEditId, setUserEditId] = useState(null);
  const [userOriginalRole, setUserOriginalRole] = useState(null);
  const [userForm, setUserForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rut: '',
    region: 'Región Metropolitana',
    comuna: 'Santiago',
    direccion: '',
    role: 'CLIENTE',
    activo: true
  });

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!userForm.nombre.trim() || !userForm.email.trim() || (!userEditId && !userForm.password.trim())) {
      mostrarAlerta('danger', 'Completa nombre, correo y contraseña para el usuario.');
      return;
    }

    const rolRaw = (userForm.role || 'CLIENTE').toUpperCase();
    const rolElegido = rolRaw === 'ADMIN' ? 'ADMIN' : (rolRaw === 'VENDEDOR' ? 'VENDEDOR' : 'CLIENTE');

    if (userEditId && (userOriginalRole || '').toUpperCase() === 'VENDEDOR' && rolElegido === 'ADMIN') {
      mostrarAlerta(
        'danger',
        'Acción denegada: No se puede dar permiso de Administrador a un usuario Vendedor.'
      );
      return;
    }

    try {
      const payload = {
        ...userForm,
        rol: rolElegido,
        role: rolElegido,
        activo: userForm.activo !== false
      };
      if (userEditId) {
        if (onUpdateUser) await onUpdateUser(userEditId, payload);
        mostrarAlerta('success', `Usuario "${userForm.nombre}" actualizado correctamente.`);
      } else {
        if (onAddUser) await onAddUser(payload);
        mostrarAlerta(
          'success',
          `Usuario "${userForm.nombre}" creado con rol ${rolElegido}.`
        );
      }
      setUserEditId(null);
      setUserOriginalRole(null);
      setUserForm({
        nombre: '',
        email: '',
        password: '',
        rut: '',
        region: 'Región Metropolitana',
        comuna: 'Santiago',
        direccion: '',
        role: 'CLIENTE',
        activo: true
      });
    } catch (err) {
      mostrarAlerta('danger', obtenerMensajeError(err, 'Error al guardar el usuario.'));
    }
  };

  const handleGrantAdminPermission = async (u) => {
    const rolUsuario = (u.rol || u.role || 'CLIENTE').toUpperCase();
    if (rolUsuario === 'VENDEDOR') {
      mostrarAlerta(
        'danger',
        'No se puede otorgar permiso de Administrador a un Vendedor.'
      );
      return;
    }
    if (rolUsuario === 'ADMIN') {
      mostrarAlerta('info', `El usuario "${u.nombre}" ya tiene permisos de Administrador.`);
      return;
    }

    try {
      const actualizado = {
        ...u,
        role: 'ADMIN',
        rol: 'ADMIN'
      };
      if (onUpdateUser) {
        await onUpdateUser(u.id, actualizado);
      }
      mostrarAlerta('success', `¡Permiso de Administrador otorgado a "${u.nombre}"!`);
    } catch (err) {
      mostrarAlerta('danger', obtenerMensajeError(err, 'Error al otorgar permisos de administrador.'));
    }
  };

  const handleUserToggleStatus = async (u) => {
    const estadoActual = u.activo !== false;
    const nuevoEstado = !estadoActual;
    try {
      if (onToggleUserStatus) {
        await onToggleUserStatus(u.id, nuevoEstado);
      } else if (onUpdateUser) {
        await onUpdateUser(u.id, { ...u, activo: nuevoEstado });
      }
      mostrarAlerta(
        nuevoEstado ? 'success' : 'warning',
        `Usuario "${u.nombre}" ${nuevoEstado ? 'activado' : 'desactivado'}.`
      );
    } catch (err) {
      mostrarAlerta('danger', obtenerMensajeError(err, 'Error al cambiar el estado del usuario.'));
    }
  };

  const handleUserDelete = async (u) => {
    if (window.confirm(`¿Eliminar al usuario "${u.nombre}" (${u.email})?`)) {
      try {
        if (onDeleteUser) await onDeleteUser(u.id);
        mostrarAlerta('warning', `Usuario "${u.nombre}" eliminado.`);
      } catch (err) {
        mostrarAlerta('danger', obtenerMensajeError(err, 'Error al eliminar usuario.'));
      }
    }
  };

  // ==========================================
  // 4. ESTADO Y LÓGICA CRUD VENTAS (:8084)
  // ==========================================
  const handleOrderStatusChange = async (id, nuevoEstado) => {
    try {
      if (onUpdateOrderStatus) await onUpdateOrderStatus(id, nuevoEstado);
      mostrarAlerta('success', `Orden #${id} actualizada a estado: ${nuevoEstado}`);
    } catch (err) {
      mostrarAlerta('danger', err?.response?.data?.error || 'Error al actualizar estado de la orden.');
    }
  };

  const handleOrderDelete = async (id) => {
    if (window.confirm(`¿Eliminar el registro de la orden #${id}?`)) {
      try {
        if (onDeleteOrder) await onDeleteOrder(id);
        mostrarAlerta('warning', `Orden #${id} eliminada.`);
      } catch (err) {
        mostrarAlerta('danger', err?.response?.data?.error || 'Error al eliminar la orden.');
      }
    }
  };

  // ==========================================
  // 5. ESTADO Y LÓGICA CRUD REPORTES (:8085)
  // ==========================================
  const [repEditId, setRepEditId] = useState(null);
  const [repForm, setRepForm] = useState({
    titulo: '',
    periodo: new Date().toISOString().slice(0, 10),
    observaciones: ''
  });

  const handleRepSubmit = async (e) => {
    e.preventDefault();
    if (!repForm.titulo.trim()) {
      mostrarAlerta('danger', 'El título del reporte es obligatorio.');
      return;
    }
    try {
      if (repEditId) {
        if (onUpdateReport) await onUpdateReport(repEditId, repForm);
        mostrarAlerta('success', `Reporte "${repForm.titulo}" actualizado.`);
      } else {
        if (onCreateReport) await onCreateReport(repForm);
        mostrarAlerta('success', `Reporte "${repForm.titulo}" generado con estadísticas actuales.`);
      }
      setRepEditId(null);
      setRepForm({
        titulo: '',
        periodo: new Date().toISOString().slice(0, 10),
        observaciones: ''
      });
    } catch (err) {
      mostrarAlerta('danger', err?.response?.data?.error || 'Error al guardar el reporte.');
    }
  };

  const handleRepDelete = async (rep) => {
    if (window.confirm(`¿Eliminar el reporte "${rep.titulo}"?`)) {
      try {
        if (onDeleteReport) await onDeleteReport(rep.id);
        mostrarAlerta('warning', `Reporte "${rep.titulo}" eliminado.`);
      } catch (err) {
        mostrarAlerta('danger', err?.response?.data?.error || 'Error al eliminar el reporte.');
      }
    }
  };

  const formatearDinero = (monto) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(monto || 0);
  };

  // Filtrado reactivo de productos en la tabla
  const productosFiltrados = productos.filter(p => {
    const matchCat =
      filtroCategoria === 'Todas' ||
      normalizarTexto(p.categoria) === normalizarTexto(filtroCategoria);
    const busq = normalizarTexto(busqueda);
    const matchBusqueda =
      normalizarTexto(p.nombre).includes(busq) ||
      normalizarTexto(p.codigo).includes(busq) ||
      normalizarTexto(p.atributo).includes(busq);
    return matchCat && matchBusqueda;
  });

  // Cálculo reactivo de Estadísticas Detalladas (Ventas + Visualizaciones + Conversión)
  const statsVentas = calcularEstadisticasDetalladas({ productos, ordenes, dashboardStats });

  const dispararDescargaArchivo = (contenido, mimeType, nombreArchivo) => {
    const blob = new Blob([contenido], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
    mostrarAlerta('success', `Archivo "${nombreArchivo}" descargado correctamente.`);
  };

  const descargarEstadisticasCsv = () => {
    const csv = generarCsvEstadisticasDetalladas(
      statsVentas,
      currentUser?.nombre || currentUser?.email || 'Vendedor'
    );
    const fecha = new Date().toISOString().slice(0, 10);
    dispararDescargaArchivo(csv, 'text/csv;charset=utf-8;', `estadisticas_detalladas_huertohogar_${fecha}.csv`);
  };

  const descargarEstadisticasJson = () => {
    const reporteCompleto = {
      generadoPor: currentUser?.nombre || currentUser?.email || 'Vendedor',
      rol: rolActual,
      fechaEmision: new Date().toISOString(),
      resumen: {
        totalIngresos: statsVentas.totalIngresos,
        totalOrdenes: statsVentas.totalOrdenes,
        totalUnidadesVendidas: statsVentas.totalUnidadesVendidas,
        totalVisualizaciones: statsVentas.totalVisualizaciones,
        tasaConversionGlobalPorcentaje: statsVentas.tasaConversionGlobal,
        ticketPromedio: statsVentas.ticketPromedio,
        productoMasVendido: statsVentas.productoMasVendido,
        productoMasVisto: statsVentas.productoMasVisto
      },
      detallePorProducto: statsVentas.detalleProductos,
      ordenes: statsVentas.ordenesActivas
    };
    const fecha = new Date().toISOString().slice(0, 10);
    dispararDescargaArchivo(
      JSON.stringify(reporteCompleto, null, 2),
      'application/json;charset=utf-8;',
      `estadisticas_detalladas_huertohogar_${fecha}.json`
    );
  };

  return (
    <div className="container my-4" data-testid="admin-panel">
      {/* Encabezado del Panel */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 mb-4 border-bottom">
        <div>
          <h2 className="h3 fw-bold text-dark mb-0">
            {esVendedor
              ? 'Panel de Vendedor · Productos y Estadísticas de Ventas'
              : 'Panel de Administración Microservicios (CRUD)'}
          </h2>
          <small className="text-muted">
            {esVendedor
              ? 'Gestiona tu catálogo de productos agrícolas y revisa el rendimiento de tus ventas en vivo'
              : 'Conectado en tiempo real a Spring Boot (:8081 - :8085)'}
          </small>
        </div>

        <div className="d-flex flex-wrap gap-2">
          {onRefreshAll && (
            <button
              className="btn btn-outline-success btn-sm"
              onClick={onRefreshAll}
              title="Sincronizar datos desde los microservicios"
              data-testid="btn-refresh-backend"
            >
              <i className="bi bi-cloud-arrow-down me-1"></i> Sincronizar Backend
            </button>
          )}
          {esAdmin && (
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={onResetDefaults}
              title="Restablecer los 8 productos originales"
              data-testid="btn-reset-defaults"
            >
              <i className="bi bi-arrow-clockwise me-1"></i> Restablecer Catálogo
            </button>
          )}
          <button 
            className="btn btn-success btn-sm"
            onClick={onExitAdmin}
            data-testid="btn-exit-admin"
          >
            <i className="bi bi-box-arrow-left me-1"></i> Volver a la Tienda
          </button>
        </div>
      </div>

      {/* Pestañas de navegación según rol (Admin ve todas; Vendedor ve Productos, Ventas y Estadísticas/Reportes) */}
      <ul className="nav nav-pills gap-2 mb-4 bg-light p-2 rounded-3 border" data-testid="admin-tabs">
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link btn-sm fw-semibold ${tabActiva === 'productos' ? 'active bg-success text-white' : 'text-dark'}`}
            onClick={() => setTabActiva('productos')}
            data-testid="tab-productos"
          >
            <i className="bi bi-box-seam me-1"></i> Productos ({productos.length})
          </button>
        </li>
        {esAdmin && (
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link btn-sm fw-semibold ${tabActiva === 'categorias' ? 'active bg-success text-white' : 'text-dark'}`}
              onClick={() => setTabActiva('categorias')}
              data-testid="tab-categorias"
            >
              <i className="bi bi-tags me-1"></i> Categorías ({categoriasObj.length})
            </button>
          </li>
        )}
        {esAdmin && (
          <li className="nav-item">
            <button
              type="button"
              className={`nav-link btn-sm fw-semibold ${tabActiva === 'usuarios' ? 'active bg-success text-white' : 'text-dark'}`}
              onClick={() => setTabActiva('usuarios')}
              data-testid="tab-usuarios"
            >
              <i className="bi bi-people me-1"></i> Usuarios ({usuarios.length})
            </button>
          </li>
        )}
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link btn-sm fw-semibold ${tabActiva === 'ventas' ? 'active bg-success text-white' : 'text-dark'}`}
            onClick={() => setTabActiva('ventas')}
            data-testid="tab-ventas"
          >
            <i className="bi bi-graph-up-arrow me-1"></i> {esVendedor ? `Mis Ventas y Estadísticas (${ordenes.length})` : `Ventas / Órdenes (${ordenes.length})`}
          </button>
        </li>
        <li className="nav-item">
          <button
            type="button"
            className={`nav-link btn-sm fw-semibold ${tabActiva === 'reportes' ? 'active bg-success text-white' : 'text-dark'}`}
            onClick={() => setTabActiva('reportes')}
            data-testid="tab-reportes"
          >
            <i className="bi bi-bar-chart-line me-1"></i> Reportes ({reportes.length + reportesProductos.length})
          </button>
        </li>
      </ul>

      {/* Alerta flotante de retroalimentación y estados de servidor */}
      {cargandoAdmin && (
        <div className="alert alert-info d-flex align-items-center py-2 px-3 mb-3" role="status" data-testid="admin-loading">
          <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
          <span>Sincronizando datos con el servidor...</span>
        </div>
      )}
      {errorAdmin && (
        <div className="alert alert-danger py-2 px-3 mb-3" role="alert" data-testid="admin-error">
          <i className="bi bi-exclamation-octagon-fill me-2"></i>
          {errorAdmin}
        </div>
      )}
      {alerta && (
        <div className={`alert alert-${alerta.tipo} shadow-sm py-2 px-3 mb-4`} role="alert" data-testid="admin-alert">
          {alerta.mensaje}
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 1: CRUD DE PRODUCTOS (ms-productos :8083)                     */}
      {/* ================================================================= */}
      {tabActiva === 'productos' && (
        <>
          <div className="card shadow-sm border-0 mb-5" id="admin-form-anchor" data-testid="product-form-card">
            <div className="card-header bg-success text-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="card-title h6 mb-0 fw-bold">
                {modoEdicion ? (
                  <span><i className="bi bi-pencil-square me-1"></i> Editando Producto: {formData.codigo}</span>
                ) : (
                  <span><i className="bi bi-plus-circle me-1"></i> Crear Nuevo Producto Agrícola (ms-productos :8083)</span>
                )}
              </h5>
              {modoEdicion && (
                <button 
                  className="btn btn-sm btn-light text-dark"
                  onClick={limpiarFormulario}
                  data-testid="btn-cancel-edit"
                >
                  Cancelar Edición
                </button>
              )}
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit} data-testid="admin-product-form" noValidate>
                <div className="row g-3">
                  {/* Código */}
                  <div className="col-12 col-md-3">
                    <label htmlFor="prodCodigo" className="form-label small fw-semibold text-secondary">
                      Código Único *
                    </label>
                    <input 
                      type="text" 
                      id="prodCodigo"
                      name="codigo"
                      className={`form-control ${formErrors.codigo ? 'is-invalid' : ''}`}
                      placeholder="Ej: FR004"
                      value={formData.codigo}
                      onChange={handleInputChange}
                      disabled={modoEdicion}
                      data-testid="input-codigo"
                    />
                    {formErrors.codigo && <div className="invalid-feedback" data-testid="error-codigo">{formErrors.codigo}</div>}
                  </div>

                  {/* Nombre */}
                  <div className="col-12 col-md-5">
                    <label htmlFor="prodNombre" className="form-label small fw-semibold text-secondary">
                      Nombre del Producto *
                    </label>
                    <input 
                      type="text" 
                      id="prodNombre"
                      name="nombre"
                      className={`form-control ${formErrors.nombre ? 'is-invalid' : ''}`}
                      placeholder="Ej: Frutillas de San Pedro"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      data-testid="input-nombre"
                    />
                    {formErrors.nombre && <div className="invalid-feedback" data-testid="error-nombre">{formErrors.nombre}</div>}
                  </div>

                  {/* Categoría */}
                  <div className="col-12 col-md-4">
                    <label htmlFor="prodCategoria" className="form-label small fw-semibold text-secondary">
                      Categoría *
                    </label>
                    <select 
                      id="prodCategoria"
                      name="categoria"
                      className="form-select"
                      value={formData.categoria}
                      onChange={handleInputChange}
                      data-testid="select-categoria"
                    >
                      {categoriasSinTodas.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Precio */}
                  <div className="col-12 col-md-3">
                    <label htmlFor="prodPrecio" className="form-label small fw-semibold text-secondary">
                      Precio (CLP) *
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">$</span>
                      <input 
                        type="number" 
                        id="prodPrecio"
                        name="precio"
                        min="1"
                        className={`form-control ${formErrors.precio ? 'is-invalid' : ''}`}
                        placeholder="1500"
                        value={formData.precio}
                        onChange={handleInputChange}
                        data-testid="input-precio"
                      />
                      {formErrors.precio && <div className="invalid-feedback" data-testid="error-precio">{formErrors.precio}</div>}
                    </div>
                  </div>

                  {/* Unidad */}
                  <div className="col-12 col-md-3">
                    <label htmlFor="prodUnidad" className="form-label small fw-semibold text-secondary">
                      Unidad de Venta *
                    </label>
                    <input 
                      type="text" 
                      id="prodUnidad"
                      name="unidad"
                      className="form-control"
                      placeholder="Ej: kilo, bolsa 500g"
                      value={formData.unidad}
                      onChange={handleInputChange}
                      data-testid="input-unidad"
                    />
                  </div>

                  {/* Stock */}
                  <div className="col-12 col-md-3">
                    <label htmlFor="prodStock" className="form-label small fw-semibold text-secondary">
                      Stock Disponible *
                    </label>
                    <input 
                      type="number" 
                      id="prodStock"
                      name="stock"
                      min="0"
                      className={`form-control ${formErrors.stock ? 'is-invalid' : ''}`}
                      placeholder="100"
                      value={formData.stock}
                      onChange={handleInputChange}
                      data-testid="input-stock"
                    />
                    {formErrors.stock && <div className="invalid-feedback" data-testid="error-stock">{formErrors.stock}</div>}
                  </div>

                  {/* Ubicación de Origen (Exclusivo V Región de Valparaíso) */}
                  <div className="col-12 col-md-3">
                    <label htmlFor="prodAtributo" className="form-label small fw-semibold text-secondary">
                      Origen (Solo 5ª Región) *
                    </label>
                    <input
                      type="text"
                      id="prodAtributo"
                      name="atributo"
                      list="ubicaciones-quinta-region"
                      className={`form-control ${formErrors.atributo ? 'is-invalid' : ''}`}
                      placeholder="Ej: Quillota, V Región"
                      value={formData.atributo}
                      onChange={handleInputChange}
                      data-testid="input-atributo"
                    />
                    <datalist id="ubicaciones-quinta-region">
                      {UBICACIONES_ORIGEN.map(ubicacion => (
                        <option key={ubicacion} value={ubicacion} />
                      ))}
                    </datalist>
                    {formErrors.atributo ? (
                      <div className="invalid-feedback d-block" data-testid="error-atributo">
                        {formErrors.atributo}
                      </div>
                    ) : (
                      <div className="form-text small text-muted">
                        Solo comunas/valles de la V Región (ej: Quillota, Limache, Olmué, San Felipe).
                      </div>
                    )}
                  </div>

                  {/* Imagen */}
                  <div className="col-12 col-md-4">
                    <label htmlFor="prodImagen" className="form-label small fw-semibold text-secondary">
                      Imagen del Producto
                    </label>
                    <select
                      id="prodImagen"
                      name="imagen"
                      className="form-select"
                      value={formData.imagen}
                      onChange={handleInputChange}
                      data-testid="select-imagen"
                    >
                      {IMAGENES_DISPONIBLES.map(img => (
                        <option key={img.value} value={img.value}>{img.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Descripción */}
                  <div className="col-12 col-md-8">
                    <label htmlFor="prodDescripcion" className="form-label small fw-semibold text-secondary">
                      Descripción Detallada *
                    </label>
                    <textarea 
                      id="prodDescripcion"
                      name="descripcion"
                      rows="2"
                      className={`form-control ${formErrors.descripcion ? 'is-invalid' : ''}`}
                      placeholder="Describe frescura, cualidades y origen del producto..."
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      data-testid="input-descripcion"
                    ></textarea>
                    {formErrors.descripcion && <div className="invalid-feedback" data-testid="error-descripcion">{formErrors.descripcion}</div>}
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4">
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={limpiarFormulario}
                    data-testid="btn-reset-form"
                  >
                    Limpiar Campos
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-success px-4 fw-semibold shadow-sm"
                    data-testid="btn-submit-product"
                  >
                    {modoEdicion ? 'Actualizar Producto' : 'Guardar Nuevo Producto'}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Listado y Tabla Administrativa (Read) */}
          <div className="card shadow-sm border-0" data-testid="admin-table-card">
            <div className="card-body p-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-3">
                <div>
                  <h5 className="card-title fw-bold text-dark mb-1">Inventario Actual de Productos</h5>
                  <p className="text-muted small mb-0">Total: <strong>{productosFiltrados.length}</strong> de {productos.length} productos registrados</p>
                </div>

                <div className="d-flex flex-column flex-sm-row gap-2" style={{ maxWidth: '450px', width: '100%' }}>
                  <select 
                    className="form-select form-select-sm"
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    data-testid="filter-admin-categoria"
                  >
                    {nombresCategorias.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>

                  <input 
                    type="search" 
                    className="form-control form-control-sm"
                    placeholder="Buscar código, nombre, origen..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    data-testid="search-admin-input"
                  />
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" data-testid="admin-products-table">
                  <thead className="table-light">
                    <tr>
                      <th scope="col" style={{ width: '90px' }}>Código</th>
                      <th scope="col">Producto</th>
                      <th scope="col">Categoría</th>
                      <th scope="col" className="text-end">Precio</th>
                      <th scope="col" className="text-center">Stock</th>
                      <th scope="col" className="text-center">Vistas</th>
                      <th scope="col">Origen</th>
                      <th scope="col" className="text-center pe-3" style={{ width: '160px' }}>Acciones (CRUD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productosFiltrados.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4 text-muted" data-testid="no-admin-products">
                          No se encontraron productos con los criterios de búsqueda.
                        </td>
                      </tr>
                    ) : (
                      productosFiltrados.map(prod => (
                        <tr key={prod.codigo} data-testid={`admin-row-${prod.codigo}`}>
                          <td>
                            <span className="badge bg-light text-dark border fw-bold">{prod.codigo}</span>
                          </td>
                          <td>
                            <div className="fw-semibold text-dark">{prod.nombre}</div>
                            <small className="text-muted">{prod.unidad}</small>
                          </td>
                          <td>
                            <span className="badge bg-success-subtle text-success border border-success-subtle">
                              {prod.categoria}
                            </span>
                          </td>
                          <td className="text-end fw-bold text-dark">
                            {formatearDinero(prod.precio)}
                          </td>
                          <td className="text-center">
                            <span className={`badge ${prod.stock < 10 ? 'bg-danger' : prod.stock < 50 ? 'bg-warning text-dark' : 'bg-success'}`}>
                              {prod.stock}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className="badge bg-info-subtle text-info-emphasis border" data-testid={`product-views-${prod.codigo}`}>
                              <i className="bi bi-eye me-1"></i> {Number(prod.visualizaciones) || 0}
                            </span>
                          </td>
                          <td className="small text-muted">
                            <i className="bi bi-geo-alt-fill text-success me-1"></i> {prod.atributo}
                          </td>
                          <td className="text-center pe-3">
                            <div className="btn-group btn-group-sm" role="group">
                              <button
                                className="btn btn-outline-primary"
                                onClick={() => handleEditarClick(prod)}
                                title="Editar producto"
                                data-testid={`btn-edit-${prod.codigo}`}
                              >
                                <i className="bi bi-pencil me-1"></i> Editar
                              </button>
                              {esAdmin && (
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleEliminarClick(prod.codigo, prod.nombre)}
                                  title="Eliminar producto"
                                  data-testid={`btn-delete-${prod.codigo}`}
                                >
                                  <i className="bi bi-trash me-1"></i> Borrar
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ================================================================= */}
      {/* TAB 2: CRUD DE CATEGORÍAS (ms-categorias :8082)                   */}
      {/* ================================================================= */}
      {tabActiva === 'categorias' && (
        <div className="row g-4" data-testid="admin-categorias-section">
          <div className="col-12 col-lg-4">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-success text-white py-3">
                <h5 className="card-title h6 mb-0 fw-bold">
                  {catEditId ? 'Editar Categoría' : 'Nueva Categoría (ms-categorias :8082)'}
                </h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleCatSubmit} data-testid="category-form">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Nombre de Categoría *</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: Lácteos Artesanales"
                      value={catForm.nombre}
                      onChange={e => setCatForm(prev => ({ ...prev, nombre: e.target.value }))}
                      data-testid="input-cat-nombre"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Descripción</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Descripción de la categoría..."
                      value={catForm.descripcion}
                      onChange={e => setCatForm(prev => ({ ...prev, descripcion: e.target.value }))}
                      data-testid="input-cat-descripcion"
                    ></textarea>
                  </div>
                  <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-success w-100 fw-semibold" data-testid="btn-submit-category">
                      {catEditId ? 'Actualizar Categoría' : 'Crear Categoría'}
                    </button>
                    {catEditId && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setCatEditId(null);
                          setCatForm({ nombre: '', descripcion: '' });
                        }}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="card-title fw-bold mb-3">Categorías Registradas ({categoriasObj.length})</h5>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Descripción</th>
                        <th className="text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoriasObj.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="text-center text-muted py-4">No hay categorías registradas.</td>
                        </tr>
                      ) : (
                        categoriasObj.map(cat => (
                          <tr key={cat.id}>
                            <td><span className="badge bg-light text-dark border">#{cat.id}</span></td>
                            <td className="fw-semibold text-dark">{cat.nombre}</td>
                            <td className="text-muted small">{cat.descripcion || 'Sin descripción'}</td>
                            <td className="text-center">
                              <div className="btn-group btn-group-sm">
                                <button
                                  className="btn btn-outline-primary"
                                  onClick={() => {
                                    setCatEditId(cat.id);
                                    setCatForm({ nombre: cat.nombre, descripcion: cat.descripcion || '' });
                                  }}
                                >
                                  <i className="bi bi-pencil me-1"></i> Editar
                                </button>
                                <button
                                  className="btn btn-outline-danger"
                                  onClick={() => handleCatDelete(cat)}
                                >
                                  <i className="bi bi-trash me-1"></i> Borrar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 3: CRUD DE USUARIOS (ms-usuarios :8081) - EXCLUSIVO ADMIN     */}
      {/* ================================================================= */}
      {esAdmin && tabActiva === 'usuarios' && (
        <div className="row g-4" data-testid="admin-usuarios-section">
          <div className="col-12 col-lg-4">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-success text-white py-3">
                <h5 className="card-title h6 mb-0 fw-bold">
                  {userEditId ? `Editando Usuario #${userEditId}` : 'Crear Usuario / Admin (ms-usuarios :8081)'}
                </h5>
              </div>
              <div className="card-body">
                <div className="alert alert-light border small py-2 mb-3">
                  <i className="bi bi-info-circle-fill text-success me-1"></i>
                  <strong>Regla de Permisos:</strong> Como Admin puedes crear nuevos usuarios con rol <strong>Admin</strong> directamente, o darle permiso de Admin a un <strong>Usuario Común (Cliente)</strong>. Los usuarios con rol <strong>Vendedor</strong> no pueden recibir permisos de Admin.
                </div>

                <form onSubmit={handleUserSubmit} data-testid="user-form">
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Nombre Completo *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={userForm.nombre}
                      onChange={e => setUserForm(prev => ({ ...prev, nombre: e.target.value }))}
                      placeholder="Nombre y Apellido"
                      data-testid="input-user-nombre"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Correo Electrónico *</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      value={userForm.email}
                      onChange={e => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="usuario@huertohogar.cl"
                      data-testid="input-user-email"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">
                      Contraseña {userEditId ? '(dejar en blanco para mantener)' : '*'}
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-sm"
                      value={userForm.password}
                      onChange={e => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Contraseña"
                      data-testid="input-user-password"
                    />
                  </div>
                  <div className="row g-2 mb-2">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">RUT</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={userForm.rut}
                        onChange={e => setUserForm(prev => ({ ...prev, rut: e.target.value }))}
                        placeholder="12.345.678-9"
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Rol *</label>
                      <select
                        className="form-select form-select-sm"
                        value={userForm.role}
                        onChange={e => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                        data-testid="select-user-role"
                      >
                        <option value="CLIENTE">Cliente (CLIENTE)</option>
                        <option value="VENDEDOR">Vendedor (VENDEDOR)</option>
                        <option
                          value="ADMIN"
                          disabled={Boolean(userEditId && (userOriginalRole || '').toUpperCase() === 'VENDEDOR')}
                        >
                          {userEditId && (userOriginalRole || '').toUpperCase() === 'VENDEDOR'
                            ? 'Administrador (No permitido para Vendedor)'
                            : 'Administrador (ADMIN)'}
                        </option>
                      </select>
                    </div>
                  </div>
                  <div className="form-check form-switch mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="userActivoSwitch"
                      checked={userForm.activo !== false}
                      onChange={e => setUserForm(prev => ({ ...prev, activo: e.target.checked }))}
                      data-testid="check-user-activo"
                    />
                    <label className="form-check-label small" htmlFor="userActivoSwitch">
                      Cuenta activa
                    </label>
                  </div>
                  <div className="mb-2">
                    <label className="form-label small fw-semibold">Región</label>
                    <select
                      className="form-select form-select-sm"
                      value={userForm.region}
                      onChange={e => {
                        const reg = e.target.value;
                        const comunas = REGIONES_CHILE[reg] || [];
                        setUserForm(prev => ({ ...prev, region: reg, comuna: comunas[0] || '' }));
                      }}
                    >
                      {Object.keys(REGIONES_CHILE).map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Comuna</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={userForm.comuna}
                      onChange={e => setUserForm(prev => ({ ...prev, comuna: e.target.value }))}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-success btn-sm w-100 fw-semibold"
                      data-testid="btn-submit-user"
                    >
                      {userEditId ? 'Actualizar Usuario' : 'Guardar Usuario'}
                    </button>
                    {userEditId && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => {
                          setUserEditId(null);
                          setUserOriginalRole(null);
                          setUserForm({
                            nombre: '',
                            email: '',
                            password: '',
                            rut: '',
                            region: 'Región Metropolitana',
                            comuna: 'Santiago',
                            direccion: '',
                            role: 'CLIENTE',
                            activo: true
                          });
                        }}
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-body">
                <h5 className="card-title fw-bold mb-3">Usuarios Registrados ({usuarios.length})</h5>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0" data-testid="admin-users-table">
                    <thead className="table-light">
                      <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th className="text-center">Estado</th>
                        <th className="text-center">Permisos Admin</th>
                        <th className="text-center">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usuarios.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center text-muted py-4">No hay usuarios registrados.</td>
                        </tr>
                      ) : (
                        usuarios.map(u => {
                          const rolU = (u.rol || u.role || 'CLIENTE').toUpperCase();
                          const estaActivo = u.activo !== false;
                          const badgeClass =
                            rolU === 'ADMIN'
                              ? 'bg-danger'
                              : rolU === 'VENDEDOR'
                              ? 'bg-warning text-dark'
                              : 'bg-primary';
                          return (
                            <tr key={u.id} data-testid={`user-row-${u.id}`}>
                              <td><span className="badge bg-light text-dark border">#{u.id}</span></td>
                              <td>
                                <div className="fw-semibold text-dark">{u.nombre}</div>
                                {u.comuna && <small className="text-muted">{u.comuna}</small>}
                              </td>
                              <td className="small">{u.email}</td>
                              <td>
                                <span className={`badge ${badgeClass}`} data-testid={`user-role-${u.id}`}>
                                  {rolU}
                                </span>
                              </td>
                              <td className="text-center">
                                <span
                                  className={`badge ${estaActivo ? 'bg-success-subtle text-success border' : 'bg-secondary-subtle text-secondary border'}`}
                                  data-testid={`user-status-${u.id}`}
                                >
                                  {estaActivo ? 'Activo' : 'Inactivo'}
                                </span>
                              </td>
                              <td className="text-center">
                                {rolU === 'CLIENTE' && (
                                  <button
                                    type="button"
                                    className="btn btn-outline-success btn-sm"
                                    onClick={() => handleGrantAdminPermission(u)}
                                    title="Otorgar permiso ADMIN"
                                    data-testid={`btn-grant-admin-${u.id}`}
                                  >
                                    <i className="bi bi-shield-check me-1"></i> Dar ADMIN
                                  </button>
                                )}
                                {rolU === 'VENDEDOR' && (
                                  <span
                                    className="badge bg-secondary-subtle text-secondary border"
                                    title="Los vendedores no pueden recibir permiso ADMIN"
                                    data-testid={`badge-no-admin-${u.id}`}
                                  >
                                    <i className="bi bi-slash-circle me-1"></i> No elegible (VENDEDOR)
                                  </span>
                                )}
                                {rolU === 'ADMIN' && (
                                  <span className="badge bg-success-subtle text-success border">
                                    <i className="bi bi-patch-check-fill me-1"></i> Es ADMIN
                                  </span>
                                )}
                              </td>
                              <td className="text-center">
                                <div className="btn-group btn-group-sm">
                                  <button
                                    type="button"
                                    className={`btn ${estaActivo ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                    onClick={() => handleUserToggleStatus(u)}
                                    title={estaActivo ? 'Desactivar usuario' : 'Activar usuario'}
                                    data-testid={`btn-toggle-user-status-${u.id}`}
                                  >
                                    <i className={`bi ${estaActivo ? 'bi-pause-circle' : 'bi-play-circle'}`}></i>
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-outline-primary"
                                    onClick={() => {
                                      setUserEditId(u.id);
                                      setUserOriginalRole(rolU);
                                      setUserForm({
                                        nombre: u.nombre || '',
                                        email: u.email || '',
                                        password: '',
                                        rut: u.rut || '',
                                        region: u.region || 'Región Metropolitana',
                                        comuna: u.comuna || 'Santiago',
                                        direccion: u.direccion || '',
                                        role: rolU,
                                        activo: u.activo !== false
                                      });
                                    }}
                                    data-testid={`btn-edit-user-${u.id}`}
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger"
                                    onClick={() => handleUserDelete(u)}
                                    data-testid={`btn-delete-user-${u.id}`}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 4: CRUD DE VENTAS / ÓRDENES Y ESTADÍSTICAS (ms-ventas :8084)  */}
      {/* ================================================================= */}
      {tabActiva === 'ventas' && (
        <div data-testid="admin-ventas-section">
          {/* Encabezado y descarga de estadísticas detalladas */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2 mb-3">
            <div>
              <h5 className="fw-bold mb-0">
                <i className="bi bi-graph-up-arrow text-success me-2"></i>
                Estadísticas de Ventas y Visualizaciones
              </h5>
              <small className="text-muted">Rendimiento detallado por producto, origen V Región y tasa de conversión</small>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button
                type="button"
                className="btn btn-success btn-sm fw-semibold"
                onClick={descargarEstadisticasCsv}
                data-testid="btn-download-stats-csv"
              >
                <i className="bi bi-file-earmark-spreadsheet me-1"></i> Descargar Estadísticas Detalladas (CSV)
              </button>
              <button
                type="button"
                className="btn btn-outline-dark btn-sm fw-semibold"
                onClick={descargarEstadisticasJson}
                data-testid="btn-download-stats-json"
              >
                <i className="bi bi-filetype-json me-1"></i> Descargar Detalle (JSON)
              </button>
            </div>
          </div>

          {/* Resumen de Estadísticas de Ventas y Visualizaciones para Vendedor y Admin */}
          <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-5 g-3 mb-4" data-testid="seller-sales-stats">
            <div className="col">
              <div className="card border-0 shadow-sm bg-success text-white h-100">
                <div className="card-body">
                  <div className="small text-white-50">Ingresos por Ventas</div>
                  <div className="h4 fw-bold mb-0" data-testid="stat-ingresos">{formatearDinero(statsVentas.totalIngresos)}</div>
                  <small className="text-white-50">Ticket prom: {formatearDinero(statsVentas.ticketPromedio)}</small>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="small text-muted">Órdenes Activas</div>
                  <div className="h4 fw-bold text-dark mb-0" data-testid="stat-ordenes">{statsVentas.totalOrdenes}</div>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="small text-muted">Unidades Vendidas</div>
                  <div className="h4 fw-bold text-success mb-0" data-testid="stat-unidades">{statsVentas.totalUnidadesVendidas}</div>
                  <small className="text-muted">Top: {statsVentas.productoMasVendido}</small>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card border-0 shadow-sm bg-info-subtle h-100">
                <div className="card-body">
                  <div className="small text-info-emphasis fw-semibold">
                    <i className="bi bi-eye-fill me-1"></i> Visualizaciones Totales
                  </div>
                  <div className="h4 fw-bold text-info-emphasis mb-0" data-testid="stat-visualizaciones">
                    {statsVentas.totalVisualizaciones}
                  </div>
                  <small className="text-info-emphasis">Conversión: {statsVentas.tasaConversionGlobal}%</small>
                </div>
              </div>
            </div>
            <div className="col">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <div className="small text-muted">Producto Más Visto</div>
                  <div className="fw-bold text-dark text-truncate" data-testid="stat-top-producto">{statsVentas.productoMasVisto}</div>
                  <small className="text-muted">Más vendido: {statsVentas.productoMasVendido}</small>
                </div>
              </div>
            </div>
          </div>

          {/* Desglose Detallado por Producto */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body p-4">
              <h5 className="card-title fw-bold mb-3">
                <i className="bi bi-bar-chart-fill text-success me-2"></i>
                Desglose Detallado por Producto (Ventas, Visualizaciones y Conversión)
              </h5>
              <div className="table-responsive">
                <table className="table table-sm table-hover align-middle mb-0" data-testid="detailed-product-stats-table">
                  <thead className="table-light">
                    <tr>
                      <th>Código</th>
                      <th>Producto</th>
                      <th>Origen (V Región)</th>
                      <th className="text-end">Precio</th>
                      <th className="text-center">Stock</th>
                      <th className="text-center">Visualizaciones</th>
                      <th className="text-center">Unid. Vendidas</th>
                      <th className="text-end">Ingresos</th>
                      <th className="text-end">Conversión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {statsVentas.detalleProductos.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center text-muted py-3">Sin datos de productos registrados.</td>
                      </tr>
                    ) : (
                      statsVentas.detalleProductos.map((row) => (
                        <tr key={row.codigo} data-testid={`stat-product-row-${row.codigo}`}>
                          <td><span className="badge bg-light text-dark border">{row.codigo}</span></td>
                          <td>
                            <div className="fw-semibold text-dark">{row.nombre}</div>
                            <small className="text-muted">{row.categoria}</small>
                          </td>
                          <td className="small text-muted">{row.origen}</td>
                          <td className="text-end">{formatearDinero(row.precio)}</td>
                          <td className="text-center">{row.stockActual}</td>
                          <td className="text-center">
                            <span className="badge bg-info-subtle text-info-emphasis border">{row.visualizaciones}</span>
                          </td>
                          <td className="text-center fw-semibold">{row.cantidadVendida}</td>
                          <td className="text-end fw-bold text-success">{formatearDinero(row.ingresos)}</td>
                          <td className="text-end small">{row.tasaConversion}%</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h5 className="card-title fw-bold mb-3">Órdenes de Compra Registradas (ms-ventas :8084)</h5>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Orden</th>
                      <th>Cliente</th>
                      <th>Destino</th>
                      <th>Productos</th>
                      <th className="text-end">Total</th>
                      <th>Estado</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordenes.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center text-muted py-4">
                          No hay órdenes registradas todavía. Realiza una compra desde el Carrito para generar una orden.
                        </td>
                      </tr>
                    ) : (
                      ordenes.map(ord => (
                        <tr key={ord.id}>
                          <td>
                            <span className="font-monospace fw-bold text-dark">
                              HH-{String(ord.id).padStart(6, '0')}
                            </span>
                          </td>
                          <td>
                            <div className="fw-semibold text-dark">{ord.nombreCliente || 'Cliente'}</div>
                            <small className="text-muted">{ord.emailCliente}</small>
                          </td>
                          <td className="small text-muted">
                            {ord.comunaDestino}, {ord.regionDestino}
                          </td>
                          <td className="small">
                            {(ord.detalles || []).map((d, idx) => (
                              <div key={idx}>
                                <span className="badge bg-light text-dark border me-1">{d.cantidad}x</span>
                                {d.nombreProducto || d.codigoProducto}
                              </div>
                            ))}
                          </td>
                          <td className="text-end fw-bold text-success">
                            {formatearDinero(ord.total)}
                          </td>
                          <td>
                            {esAdmin ? (
                              <select
                                className="form-select form-select-sm"
                                value={ord.estado || 'CONFIRMADA'}
                                onChange={e => handleOrderStatusChange(ord.id, e.target.value)}
                              >
                                <option value="CONFIRMADA">CONFIRMADA</option>
                                <option value="EN PREPARACIÓN">EN PREPARACIÓN</option>
                                <option value="EN CAMINO">EN CAMINO</option>
                                <option value="ENTREGADA">ENTREGADA</option>
                                <option value="CANCELADA">CANCELADA</option>
                              </select>
                            ) : (
                              <span className="badge bg-light text-dark border">{ord.estado || 'CONFIRMADA'}</span>
                            )}
                          </td>
                          <td className="text-center">
                            {esAdmin ? (
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleOrderDelete(ord.id)}
                                title="Eliminar orden"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            ) : (
                              <span className="text-muted small">—</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* TAB 5: CRUD DE REPORTES Y DASHBOARD (ms-reportes :8085)           */}
      {/* ================================================================= */}
      {tabActiva === 'reportes' && (
        <div data-testid="admin-reportes-section">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
            <span className="fw-semibold text-muted small">
              Exporta las estadísticas consolidadas con detalle por producto y visualizaciones:
            </span>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-success btn-sm fw-semibold"
                onClick={descargarEstadisticasCsv}
                data-testid="btn-report-download-csv"
              >
                <i className="bi bi-file-earmark-spreadsheet me-1"></i> Descargar Estadísticas (CSV)
              </button>
              <button
                type="button"
                className="btn btn-outline-dark btn-sm fw-semibold"
                onClick={descargarEstadisticasJson}
                data-testid="btn-report-download-json"
              >
                <i className="bi bi-filetype-json me-1"></i> Descargar Detalle (JSON)
              </button>
            </div>
          </div>
          {/* Métricas en vivo consolidadas */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-md-3">
              <div className="card border-0 shadow-sm bg-success text-white">
                <div className="card-body">
                  <div className="small text-white-50">Ingresos Totales Consolidados</div>
                  <div className="h3 fw-bold mb-0">{formatearDinero(statsVentas.totalIngresos)}</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="small text-muted">Total Órdenes Procesadas</div>
                  <div className="h3 fw-bold text-dark mb-0">{statsVentas.totalOrdenes}</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-3">
              <div className="card border-0 shadow-sm">
                <div className="card-body">
                  <div className="small text-muted">Unidades Agrícolas Vendidas</div>
                  <div className="h3 fw-bold text-success mb-0">{statsVentas.totalUnidadesVendidas}</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-md-3">
              <div className="card border-0 shadow-sm bg-info-subtle">
                <div className="card-body">
                  <div className="small text-info-emphasis">Visualizaciones Totales</div>
                  <div className="h3 fw-bold text-info-emphasis mb-0">{statsVentas.totalVisualizaciones}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="row g-4">
            <div className="col-12 col-lg-4">
              <div className="card shadow-sm border-0">
                <div className="card-header bg-success text-white py-3">
                  <h5 className="card-title h6 mb-0 fw-bold">
                    {repEditId ? 'Editar Reporte' : 'Generar Reporte (ms-reportes :8085)'}
                  </h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleRepSubmit}>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Título del Reporte *</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej: Cierre Mensual HuertoHogar"
                        value={repForm.titulo}
                        onChange={e => setRepForm(prev => ({ ...prev, titulo: e.target.value }))}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Período</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ej: 2026-11"
                        value={repForm.periodo}
                        onChange={e => setRepForm(prev => ({ ...prev, periodo: e.target.value }))}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Observaciones</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        placeholder="Notas de auditoría o inventario..."
                        value={repForm.observaciones}
                        onChange={e => setRepForm(prev => ({ ...prev, observaciones: e.target.value }))}
                      ></textarea>
                    </div>
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-success w-100 fw-semibold">
                        {repEditId ? 'Actualizar Reporte' : 'Generar y Guardar Reporte'}
                      </button>
                      {repEditId && (
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            setRepEditId(null);
                            setRepForm({ titulo: '', periodo: new Date().toISOString().slice(0, 10), observaciones: '' });
                          }}
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-12 col-lg-8">
              <div className="card shadow-sm border-0">
                <div className="card-body">
                  <h5 className="card-title fw-bold mb-3">Reportes Generados ({reportes.length})</h5>
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>ID</th>
                          <th>Título / Período</th>
                          <th className="text-end">Ingresos</th>
                          <th className="text-center">Órdenes</th>
                          <th>Top Producto</th>
                          <th className="text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportes.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="text-center text-muted py-4">
                              No hay reportes generados. Crea uno con el formulario para consolidar las ventas.
                            </td>
                          </tr>
                        ) : (
                          reportes.map(rep => (
                            <tr key={rep.id}>
                              <td><span className="badge bg-light text-dark border">#{rep.id}</span></td>
                              <td>
                                <div className="fw-semibold text-dark">{rep.titulo}</div>
                                <small className="text-muted">Período: {rep.periodo}</small>
                                {rep.observaciones && <div className="small text-secondary fst-italic">{rep.observaciones}</div>}
                              </td>
                              <td className="text-end fw-bold text-success">{formatearDinero(rep.totalIngresos)}</td>
                              <td className="text-center">{rep.totalOrdenes}</td>
                              <td className="small">{rep.productoMasVendido}</td>
                              <td className="text-center">
                                <div className="btn-group btn-group-sm">
                                  <button
                                    className="btn btn-outline-primary"
                                    onClick={() => {
                                      setRepEditId(rep.id);
                                      setRepForm({
                                        titulo: rep.titulo || '',
                                        periodo: rep.periodo || '',
                                        observaciones: rep.observaciones || ''
                                      });
                                    }}
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button
                                    className="btn btn-outline-danger"
                                    onClick={() => handleRepDelete(rep)}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reportes de frutas / productos en mal estado */}
          <div className="card shadow-sm border-0 mt-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="card-title fw-bold mb-0">
                  <i className="bi bi-flag-fill text-danger me-2"></i>
                  Reportes de Frutas en Mal Estado ({reportesProductos.length})
                </h5>
                <span className="badge bg-warning-subtle text-warning-emphasis border">
                  Pendientes: {reportesProductos.filter((r) => (r.estado || 'PENDIENTE') === 'PENDIENTE').length}
                </span>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" data-testid="product-reports-table">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Producto</th>
                      <th>Motivo y Detalle</th>
                      <th>Reportado por</th>
                      <th className="text-center">Estado</th>
                      {esAdmin && <th className="text-center">Acciones</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {reportesProductos.length === 0 ? (
                      <tr>
                        <td colSpan={esAdmin ? 6 : 5} className="text-center text-muted py-4" data-testid="no-product-reports">
                          No hay reportes de frutas en mal estado registrados.
                        </td>
                      </tr>
                    ) : (
                      reportesProductos.map((rep) => {
                        const est = rep.estado || 'PENDIENTE';
                        const badgeCls = est === 'RESUELTO'
                          ? 'bg-success-subtle text-success'
                          : est === 'EN_REVISION'
                            ? 'bg-info-subtle text-info-emphasis'
                            : 'bg-warning-subtle text-warning-emphasis';
                        return (
                          <tr key={rep.id} data-testid={`product-report-row-${rep.id}`}>
                            <td><span className="badge bg-light text-dark border">#{rep.id}</span></td>
                            <td>
                              <div className="fw-semibold text-dark">{rep.nombreProducto}</div>
                              <small className="text-muted">{rep.codigoProducto}</small>
                            </td>
                            <td>
                              <div className="fw-semibold text-danger small">{rep.motivo}</div>
                              {rep.descripcion && <div className="small text-secondary">{rep.descripcion}</div>}
                            </td>
                            <td className="small text-muted">
                              <div>{rep.reportadoPor || 'Cliente'}</div>
                              {rep.fechaReporte && (
                                <small>{String(rep.fechaReporte).slice(0, 16).replace('T', ' ')}</small>
                              )}
                            </td>
                            <td className="text-center">
                              <span className={`badge ${badgeCls} border`} data-testid={`product-report-status-${rep.id}`}>
                                {est}
                              </span>
                            </td>
                            {esAdmin && (
                              <td className="text-center">
                                <div className="btn-group btn-group-sm">
                                  {est !== 'RESUELTO' && (
                                    <button
                                      type="button"
                                      className="btn btn-outline-success"
                                      title="Marcar como resuelto"
                                      onClick={() => onUpdateProductReportStatus && onUpdateProductReportStatus(rep.id, 'RESUELTO')}
                                      data-testid={`btn-resolve-product-report-${rep.id}`}
                                    >
                                      <i className="bi bi-check2-circle"></i>
                                    </button>
                                  )}
                                  {est === 'PENDIENTE' && (
                                    <button
                                      type="button"
                                      className="btn btn-outline-info"
                                      title="Marcar en revision"
                                      onClick={() => onUpdateProductReportStatus && onUpdateProductReportStatus(rep.id, 'EN_REVISION')}
                                      data-testid={`btn-review-product-report-${rep.id}`}
                                    >
                                      <i className="bi bi-eye"></i>
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger"
                                    title="Eliminar reporte"
                                    onClick={() => onDeleteProductReport && onDeleteProductReport(rep.id)}
                                    data-testid={`btn-delete-product-report-${rep.id}`}
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
