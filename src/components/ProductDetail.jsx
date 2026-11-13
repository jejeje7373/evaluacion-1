import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CartIcon from './CartIcon.jsx';
import { reportarProductoMalEstado, obtenerMensajeError } from '../services/api.js';

/**
 * Componente ProductDetail (Estilo Native Bloom: Gallery Photo Expand)
 * 
 * Implementa una Shared Element Transition fluida inspirada en Native Bloom:
 * - La imagen del producto viaja y se expande suavemente desde la cuadrícula (layoutId).
 * - Fondo oscuro cinematográfico con desenfoque (backdrop blur).
 * - Ficha técnica completa con animación orquestada (stagger).
 * - Cierre accesible con botón ✕, tecla Escape, clic en el fondo o botón volver.
 * - Navegación entre productos con flechas izquierda y derecha.
 */
export default function ProductDetail({ 
  producto, 
  onBack, 
  onAddToCart, 
  onGoToCart,
  todosLosProductos = [],
  onSelectRelated,
  onReportProduct,
  openReportInitially = false
}) {
  const [cantidad, setCantidad] = useState(1);
  const [feedback, setFeedback] = useState('');
  const [mostrarReporte, setMostrarReporte] = useState(Boolean(openReportInitially));
  const [motivoReporte, setMotivoReporte] = useState('Fruta en mal estado');
  const [descripcionReporte, setDescripcionReporte] = useState('');
  const [enviandoReporte, setEnviandoReporte] = useState(false);
  const [reporteFeedback, setReporteFeedback] = useState('');
  const [reporteError, setReporteError] = useState('');

  useEffect(() => {
    setMostrarReporte(Boolean(openReportInitially));
    setMotivoReporte('Fruta en mal estado');
    setDescripcionReporte('');
    setReporteFeedback('');
    setReporteError('');
  }, [producto?.codigo, openReportInitially]);

  // Atajos de teclado: Escape para cerrar, Flechas para navegar
  useEffect(() => {
    if (!producto) return;

    // Bloquear scroll de fondo mientras el visor está abierto
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (onBack) onBack();
      } else if (e.key === 'ArrowRight' && todosLosProductos.length > 0) {
        const currentIndex = todosLosProductos.findIndex(p => p.codigo === producto.codigo);
        if (currentIndex !== -1) {
          const nextIndex = (currentIndex + 1) % todosLosProductos.length;
          if (onSelectRelated) onSelectRelated(todosLosProductos[nextIndex]);
        }
      } else if (e.key === 'ArrowLeft' && todosLosProductos.length > 0) {
        const currentIndex = todosLosProductos.findIndex(p => p.codigo === producto.codigo);
        if (currentIndex !== -1) {
          const prevIndex = (currentIndex - 1 + todosLosProductos.length) % todosLosProductos.length;
          if (onSelectRelated) onSelectRelated(todosLosProductos[prevIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [producto, todosLosProductos, onBack, onSelectRelated]);

  // Resetear cantidad al cambiar de producto
  useEffect(() => {
    setCantidad(1);
    setFeedback('');
  }, [producto?.codigo]);

  if (!producto) {
    return (
      <div className="container my-5 text-center py-5" data-testid="product-detail-view">
        <div className="alert alert-warning py-4 shadow-sm">
          <i className="bi bi-exclamation-triangle display-4 text-warning d-block mb-3"></i>
          <h4>Producto no encontrado</h4>
          <p className="text-muted">El producto seleccionado no existe o ya no se encuentra disponible.</p>
          <button className="btn btn-success mt-2" onClick={onBack} data-testid="btn-back-to-catalog">
            <i className="bi bi-arrow-left me-1"></i> Volver al Catálogo
          </button>
        </div>
      </div>
    );
  }

  const handleIncrement = () => {
    if (cantidad < producto.stock) {
      setCantidad(prev => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (cantidad > 1) {
      setCantidad(prev => prev - 1);
    }
  };

  const handleAgregar = () => {
    if (onAddToCart) {
      onAddToCart(producto, cantidad);
    }
    setFeedback(`¡Se agregaron ${cantidad} ${cantidad > 1 ? 'unidades' : 'unidad'} al carrito!`);
    setTimeout(() => setFeedback(''), 3500);
  };

  const precioFormateado = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(producto.precio);

  const subtotalFormateado = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(producto.precio * cantidad);

  // Navegación secuencial al siguiente o anterior producto
  const currentIndex = todosLosProductos.findIndex(p => p.codigo === producto.codigo);
  const prevProduct = currentIndex > 0 ? todosLosProductos[currentIndex - 1] : todosLosProductos[todosLosProductos.length - 1];
  const nextProduct = currentIndex < todosLosProductos.length - 1 ? todosLosProductos[currentIndex + 1] : todosLosProductos[0];

  // Productos relacionados de la misma categoría
  const productosRelacionados = todosLosProductos
    .filter(p => p.codigo !== producto.codigo && p.categoria === producto.categoria)
    .slice(0, 3);

  return (
    <div className="photo-expand-overlay" data-testid="product-detail-view">
      {/* Fondo inmersivo con desenfoque (Backdrop Blur) */}
      <motion.div 
        className="photo-expand-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onBack}
        aria-hidden="true"
      />

      {/* Flechas flotantes de navegación rápida */}
      {todosLosProductos.length > 1 && (
        <>
          <button 
            type="button" 
            className="photo-expand-nav-btn photo-expand-nav-prev"
            onClick={() => onSelectRelated && onSelectRelated(prevProduct)}
            title={`Anterior: ${prevProduct?.nombre}`}
            aria-label="Producto anterior"
          >
            <i className="bi bi-chevron-left fs-5"></i>
          </button>
          <button 
            type="button" 
            className="photo-expand-nav-btn photo-expand-nav-next"
            onClick={() => onSelectRelated && onSelectRelated(nextProduct)}
            title={`Siguiente: ${nextProduct?.nombre}`}
            aria-label="Producto siguiente"
          >
            <i className="bi bi-chevron-right fs-5"></i>
          </button>
        </>
      )}

      {/* Tarjeta expandida con transición compartida (Shared Element) */}
      <motion.div 
        layoutId={`product-card-${producto.codigo}`}
        className="photo-expand-card"
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-product-title"
      >
        {/* Botón flotante cerrar (✕) */}
        <button 
          type="button" 
          className="photo-expand-close-btn"
          onClick={onBack}
          aria-label="Cerrar detalle del producto"
        >
          <i className="bi bi-x-lg"></i>
        </button>

        <div className="row g-0">
          {/* Columna Izquierda: Imagen expandida con transición compartida */}
          <div className="col-12 col-md-5 bg-light p-4 p-lg-5 d-flex flex-column align-items-center justify-content-center border-end text-center position-relative">
            <span 
              className="badge bg-success position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill shadow-sm"
              style={{ zIndex: 2 }}
            >
              <i className="bi bi-tag-fill me-1"></i> {producto.categoria}
            </span>

            <motion.img 
              layoutId={`product-image-${producto.codigo}`}
              src={producto.imagen} 
              alt={producto.nombre}
              className="img-fluid position-relative mt-2"
              style={{ maxHeight: '280px', objectFit: 'contain', zIndex: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />

            <motion.div 
              className="mt-4 d-flex flex-wrap gap-2 justify-content-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <span className="badge bg-white text-dark border px-3 py-2 rounded-pill small shadow-sm">
                <i className="bi bi-upc-scan me-1 text-muted"></i> Código: <strong>{producto.codigo}</strong>
              </span>
              <span className="badge bg-white text-success border px-3 py-2 rounded-pill small shadow-sm">
                <i className="bi bi-shield-check me-1"></i> 100% Orgánico
              </span>
            </motion.div>
          </div>

          {/* Columna Derecha: Información completa y compra */}
          <div className="col-12 col-md-7 p-4 p-lg-5 d-flex flex-column justify-content-between">
            {/* Animación orquestada para los contenidos textuales */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3 }}
            >
              {/* Botón de volver clásico y breadcrumb */}
              <div className="d-flex justify-content-between align-items-center mb-3">
                <button 
                  className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center"
                  onClick={onBack}
                  data-testid="btn-back-to-catalog"
                >
                  <i className="bi bi-arrow-left me-1"></i> Volver al Catálogo
                </button>

                <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-1 rounded-pill small fw-semibold">
                  <i className="bi bi-geo-alt-fill me-1"></i> {producto.atributo}
                </span>
              </div>

              <div className="d-flex align-items-center gap-1 text-warning small mb-1">
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <i className="bi bi-star-fill"></i>
                <span className="text-muted ms-2">(5.0 · Cosecha Directa)</span>
              </div>

              <h1 className="h2 fw-bold text-dark mb-2" id="detail-product-title" data-testid="detail-product-name">
                {producto.nombre}
              </h1>

              {/* Precio y disponibilidad */}
              <div className="d-flex align-items-baseline gap-2 mb-3">
                <span className="h2 text-success fw-bold mb-0" data-testid="detail-product-price">
                  {precioFormateado}
                </span>
                <span className="text-muted fs-5">/ {producto.unidad}</span>
              </div>

              {/* Estado del Stock y Visualizaciones */}
              <div className="mb-3 d-flex flex-wrap align-items-center gap-2">
                {producto.stock > 0 ? (
                  <span className="badge bg-success-subtle text-success px-3 py-2 rounded-pill fw-normal">
                    <i className="bi bi-check-circle-fill me-1"></i> Stock disponible: <strong>{producto.stock} unidades</strong>
                  </span>
                ) : (
                  <span className="badge bg-danger-subtle text-danger px-3 py-2 rounded-pill fw-normal">
                    <i className="bi bi-x-circle-fill me-1"></i> Agotado temporalmente
                  </span>
                )}
                <span className="badge bg-info-subtle text-info-emphasis px-3 py-2 rounded-pill fw-normal" data-testid="detail-product-views">
                  <i className="bi bi-eye-fill me-1"></i> {Number(producto.visualizaciones) || 0} visualizaciones
                </span>
              </div>

              {/* Descripción detallada */}
              <div className="mb-4">
                <h6 className="fw-bold text-uppercase text-muted small">Descripción del Alimento</h6>
                <p className="lead fs-6 text-secondary mb-0" data-testid="detail-product-description">
                  {producto.descripcion}
                </p>
              </div>

              {/* Ficha técnica y beneficios */}
              <div className="row g-2 mb-4">
                <div className="col-12 col-sm-6">
                  <div className="p-2 px-3 bg-light rounded-3 border">
                    <div className="d-flex align-items-center text-success mb-1">
                      <i className="bi bi-truck me-2"></i>
                      <strong className="small text-dark">Despacho Refrigerado</strong>
                    </div>
                    <p className="mb-0 small text-muted">Entrega en 24 a 48 hrs con cadena de frío garantizada.</p>
                  </div>
                </div>
                <div className="col-12 col-sm-6">
                  <div className="p-2 px-3 bg-light rounded-3 border">
                    <div className="d-flex align-items-center text-success mb-1">
                      <i className="bi bi-patch-check me-2"></i>
                      <strong className="small text-dark">Origen Certificado</strong>
                    </div>
                    <p className="mb-0 small text-muted">Cosechado por pequeños productores locales chilenos.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Selector de cantidad y Botón de Acción */}
            <motion.div 
              className="pt-3 border-top"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
            >
              <div className="row align-items-center g-3">
                <div className="col-12 col-sm-auto">
                  <label className="form-label small fw-bold text-muted mb-1 d-block">Cantidad:</label>
                  <div className="input-group input-group-lg" style={{ width: '150px' }}>
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button" 
                      onClick={handleDecrement}
                      disabled={cantidad <= 1}
                      aria-label="Disminuir cantidad"
                    >
                      <i className="bi bi-dash-lg"></i>
                    </button>
                    <input 
                      type="text" 
                      className="form-control text-center fw-bold bg-white" 
                      value={cantidad} 
                      readOnly 
                      aria-label="Cantidad seleccionada"
                    />
                    <button 
                      className="btn btn-outline-secondary" 
                      type="button" 
                      onClick={handleIncrement}
                      disabled={cantidad >= producto.stock}
                      aria-label="Aumentar cantidad"
                    >
                      <i className="bi bi-plus-lg"></i>
                    </button>
                  </div>
                </div>

                <div className="col-12 col-sm-auto d-flex flex-column justify-content-end">
                  <span className="small text-muted mb-1">Subtotal estimado:</span>
                  <span className="h4 text-dark fw-bold mb-0">{subtotalFormateado}</span>
                </div>

                <div className="col-12 col-md flex-grow-1">
                  <label className="d-none d-sm-block form-label small mb-1 invisible">Acción</label>
                  <motion.button 
                    className="btn btn-success btn-lg w-100 d-flex align-items-center justify-content-center shadow-sm"
                    onClick={handleAgregar}
                    disabled={producto.stock === 0}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    data-testid="detail-btn-add-cart"
                  >
                    <CartIcon size={22} className="me-2" /> Agregar al Carrito
                  </motion.button>
                </div>
              </div>

              {/* Mensaje de retroalimentación tras agregar */}
              {feedback && (
                <motion.div 
                  className="alert alert-success mt-3 py-2 px-3 d-flex align-items-center justify-content-between"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="small">
                    <i className="bi bi-check-circle-fill me-2"></i> {feedback}
                  </span>
                  {onGoToCart && (
                    <button 
                      className="btn btn-sm btn-outline-success fw-bold ms-2"
                      onClick={onGoToCart}
                    >
                      Ver Carrito <i className="bi bi-arrow-right ms-1"></i>
                    </button>
                  )}
                </motion.div>
              )}

              {/* Botón y formulario para reportar fruta/producto en mal estado */}
              <div className="mt-3 pt-3 border-top">
                <button
                  type="button"
                  className="btn btn-outline-danger btn-sm d-inline-flex align-items-center"
                  onClick={() => {
                    setMostrarReporte((prev) => !prev);
                    setReporteError('');
                    setReporteFeedback('');
                  }}
                  data-testid="btn-open-report-modal"
                >
                  <i className="bi bi-flag me-2"></i>
                  {mostrarReporte ? 'Ocultar reporte' : 'Reportar fruta en mal estado'}
                </button>

                {reporteFeedback && (
                  <div className="alert alert-success py-2 px-3 mt-2 mb-0 small" role="alert" data-testid="product-report-success">
                    <i className="bi bi-check-circle-fill me-2"></i>{reporteFeedback}
                  </div>
                )}

                {mostrarReporte && (
                  <form
                    className="mt-3 p-3 bg-light rounded border"
                    data-testid="product-report-form"
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setReporteError('');
                      setReporteFeedback('');
                      setEnviandoReporte(true);
                      try {
                        const payload = {
                          codigoProducto: producto.codigo,
                          nombreProducto: producto.nombre,
                          motivo: motivoReporte,
                          descripcion: descripcionReporte.trim() || 'Reporte enviado desde el catalogo'
                        };
                        if (onReportProduct) {
                          await onReportProduct(payload);
                        } else {
                          await reportarProductoMalEstado(payload);
                        }
                        setReporteFeedback('Reporte enviado al equipo de Administracion. Gracias por avisarnos.');
                        setDescripcionReporte('');
                        setMostrarReporte(false);
                      } catch (err) {
                        setReporteError(obtenerMensajeError(err));
                      } finally {
                        setEnviandoReporte(false);
                      }
                    }}
                  >
                    <div className="fw-semibold small text-dark mb-2">
                      Reportar problema con {producto.nombre}
                    </div>
                    {reporteError && (
                      <div className="alert alert-danger py-1 px-2 small mb-2" data-testid="product-report-error">
                        {reporteError}
                      </div>
                    )}
                    <div className="mb-2">
                      <label className="form-label small text-muted mb-1" htmlFor="reportMotivoSelect">Motivo *</label>
                      <select
                        id="reportMotivoSelect"
                        className="form-select form-select-sm"
                        value={motivoReporte}
                        onChange={(e) => setMotivoReporte(e.target.value)}
                        data-testid="select-report-motivo"
                      >
                        <option value="Fruta en mal estado">Fruta en mal estado</option>
                        <option value="Golpeada o aplastada">Golpeada o aplastada</option>
                        <option value="Maduracion excesiva">Maduracion excesiva</option>
                        <option value="Peso o calidad distinta">Peso o calidad distinta</option>
                        <option value="Otro problema">Otro problema</option>
                      </select>
                    </div>
                    <div className="mb-2">
                      <label className="form-label small text-muted mb-1" htmlFor="reportDescTextarea">Detalle</label>
                      <textarea
                        id="reportDescTextarea"
                        rows="2"
                        className="form-control form-control-sm"
                        placeholder="Describe brevemente el estado del producto..."
                        value={descripcionReporte}
                        onChange={(e) => setDescripcionReporte(e.target.value)}
                        data-testid="input-report-descripcion"
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      className="btn btn-danger btn-sm fw-semibold"
                      disabled={enviandoReporte}
                      data-testid="btn-submit-product-report"
                    >
                      {enviandoReporte ? 'Enviando...' : 'Enviar Reporte'}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Productos relacionados dentro del detalle */}
        {productosRelacionados.length > 0 && (
          <div className="p-4 bg-light border-top">
            <h6 className="fw-bold text-dark mb-3">
              <i className="bi bi-grid-fill text-success me-1"></i> Otros productos de la categoría <strong>{producto.categoria}</strong>:
            </h6>
            <div className="row row-cols-1 row-cols-sm-3 g-2">
              {productosRelacionados.map(rel => (
                <div className="col" key={rel.codigo}>
                  <div 
                    className="p-2 bg-white rounded-3 border d-flex align-items-center gap-2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => onSelectRelated && onSelectRelated(rel)}
                  >
                    <img 
                      src={rel.imagen} 
                      alt={rel.nombre} 
                      style={{ width: '42px', height: '42px', objectFit: 'contain' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="flex-grow-1 overflow-hidden">
                      <div className="small fw-bold text-truncate text-dark">{rel.nombre}</div>
                      <div className="small text-success fw-semibold">
                        ${new Intl.NumberFormat('es-CL').format(rel.precio)}
                      </div>
                    </div>
                    <i className="bi bi-chevron-right text-muted small"></i>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
