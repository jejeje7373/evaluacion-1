import React, { useState } from 'react';
import { CATEGORIAS } from '../data/products.js';

/**
 * Componente AdminProducts (Panel de Administración: CRUD de Productos)
 * 
 * Operaciones CRUD completas:
 * - C (Create): Formulario para crear un nuevo producto con validación de código único y campos obligatorios.
 * - R (Read): Tabla interactiva responsiva con buscador en tiempo real, filtro por categoría y contador de inventario.
 * - U (Update): Edición directa precargando el producto seleccionado y guardando cambios.
 * - D (Delete): Eliminación de productos con confirmación.
 * 
 * Props:
 * - productos: Lista actual de productos
 * - onAddProduct: Callback (nuevoProducto) => void
 * - onUpdateProduct: Callback (productoActualizado) => void
 * - onDeleteProduct: Callback (codigo) => void
 * - onResetDefaults: Callback () => void (Restablecer catálogo maestro)
 * - onExitAdmin: Callback () => void (Volver a la tienda cliente)
 */
export default function AdminProducts({
  productos = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onResetDefaults,
  onExitAdmin
}) {
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoEnEdicion, setProductoEnEdicion] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [alerta, setAlerta] = useState(null);

  // Estado del formulario
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
    setTimeout(() => setAlerta(null), 3000);
  };

  const limpiarFormulario = () => {
    setFormData({
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
      errors.atributo = 'El origen o atributo es obligatorio.';
    }

    if (!formData.descripcion.trim()) {
      errors.descripcion = 'La descripción es obligatoria.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
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

    if (modoEdicion) {
      if (onUpdateProduct) {
        onUpdateProduct(productoPayload);
      }
      mostrarAlerta('success', `Producto "${productoPayload.nombre}" actualizado con éxito.`);
    } else {
      if (onAddProduct) {
        onAddProduct(productoPayload);
      }
      mostrarAlerta('success', `Producto "${productoPayload.nombre}" agregado exitosamente al catálogo.`);
    }

    limpiarFormulario();
  };

  const handleEditarClick = (prod) => {
    setModoEdicion(true);
    setProductoEnEdicion(prod.codigo);
    setFormData({
      codigo: prod.codigo,
      nombre: prod.nombre,
      categoria: prod.categoria,
      precio: prod.precio,
      unidad: prod.unidad,
      stock: prod.stock,
      atributo: prod.atributo,
      descripcion: prod.descripcion,
      imagen: prod.imagen || 'assets/img/manzanas.svg'
    });
    setFormErrors({});

    // Scroll suave hacia el formulario
    const formEl = document.getElementById('admin-form-anchor');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleEliminarClick = (codigo, nombre) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar "${nombre}" (${codigo})?`)) {
      if (onDeleteProduct) {
        onDeleteProduct(codigo);
      }
      mostrarAlerta('warning', `Producto "${nombre}" eliminado del catálogo.`);
      if (modoEdicion && productoEnEdicion === codigo) {
        limpiarFormulario();
      }
    }
  };

  const formatearDinero = (monto) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(monto);
  };

  // Filtrado reactivo de productos en la tabla
  const productosFiltrados = productos.filter(p => {
    const matchCat = filtroCategoria === 'Todas' || p.categoria === filtroCategoria;
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          p.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
                          p.atributo.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchBusqueda;
  });

  return (
    <div className="container my-4" data-testid="admin-panel">
      {/* Encabezado del Panel */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 pb-3 mb-4 border-bottom">
        <div>
          <h2 className="h3 fw-bold text-dark mb-0">Gestión de Catálogo e Inventario (CRUD)</h2>
          <small className="text-muted">Panel exclusivo de Administración</small>
        </div>

        <div className="d-flex gap-2">
          <button 
            className="btn btn-outline-secondary btn-sm"
            onClick={onResetDefaults}
            title="Restablecer los 8 productos originales"
            data-testid="btn-reset-defaults"
          >
            <i className="bi bi-arrow-clockwise me-1"></i> Restablecer Catálogo
          </button>
          <button 
            className="btn btn-success btn-sm"
            onClick={onExitAdmin}
            data-testid="btn-exit-admin"
          >
            <i className="bi bi-box-arrow-left me-1"></i> Volver a la Tienda
          </button>
        </div>
      </div>

      {/* Alerta flotante de retroalimentación */}
      {alerta && (
        <div className={`alert alert-${alerta.tipo} shadow-sm py-2 px-3 mb-4`} role="alert" data-testid="admin-alert">
          {alerta.mensaje}
        </div>
      )}

      {/* Formulario de Creación / Edición */}
      <div className="card shadow-sm border-0 mb-5" id="admin-form-anchor" data-testid="product-form-card">
        <div className="card-header bg-success text-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="card-title h6 mb-0 fw-bold">
            {modoEdicion ? (
              <span><i className="bi bi-pencil-square me-1"></i> Editando Producto: {formData.codigo}</span>
            ) : (
              <span><i className="bi bi-plus-circle me-1"></i> Crear Nuevo Producto Agrícola</span>
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
                  {CATEGORIAS.filter(c => c !== 'Todas').map(cat => (
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

              {/* Origen / Atributo */}
              <div className="col-12 col-md-3">
                <label htmlFor="prodAtributo" className="form-label small fw-semibold text-secondary">
                  Origen / Atributo *
                </label>
                <input 
                  type="text" 
                  id="prodAtributo"
                  name="atributo"
                  className={`form-control ${formErrors.atributo ? 'is-invalid' : ''}`}
                  placeholder="Ej: Valle del Huasco"
                  value={formData.atributo}
                  onChange={handleInputChange}
                  data-testid="input-atributo"
                />
                {formErrors.atributo && <div className="invalid-feedback" data-testid="error-atributo">{formErrors.atributo}</div>}
              </div>

              {/* Descripción */}
              <div className="col-12">
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

            {/* Filtros de la tabla */}
            <div className="d-flex flex-column flex-sm-row gap-2" style={{ maxWidth: '450px', width: '100%' }}>
              <select 
                className="form-select form-select-sm"
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                data-testid="filter-admin-categoria"
              >
                {CATEGORIAS.map(cat => (
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
                  <th scope="col">Origen</th>
                  <th scope="col" className="text-center pe-3" style={{ width: '160px' }}>Acciones (CRUD)</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted" data-testid="no-admin-products">
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
                          <button 
                            className="btn btn-outline-danger"
                            onClick={() => handleEliminarClick(prod.codigo, prod.nombre)}
                            title="Eliminar producto"
                            data-testid={`btn-delete-${prod.codigo}`}
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
  );
}

