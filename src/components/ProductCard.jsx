import React, { useState } from 'react';
import { motion } from 'framer-motion';
import CartIcon from './CartIcon.jsx';

/**
 * Componente ProductCard (Estilo SmoothUI + Bootstrap 5)
 * 
 * Integra micro-interacciones fluidas y físicas de resorte (spring physics)
 * inspiradas en SmoothUI (smoothui.dev), conservando la grilla responsiva de Bootstrap.
 */
export default function ProductCard({ producto, onAddToCart, onViewDetails, onReportProduct }) {
  const [cantidad, setCantidad] = useState(1);
  const [mensajeFeedback, setMensajeFeedback] = useState('');

  if (!producto) return null;

  const handleIncrement = (e) => {
    e?.stopPropagation();
    if (cantidad < producto.stock) setCantidad(prev => prev + 1);
  };

  const handleDecrement = (e) => {
    e?.stopPropagation();
    if (cantidad > 1) setCantidad(prev => prev - 1);
  };

  const handleAgregar = (e) => {
    e?.stopPropagation();
    if (onAddToCart) onAddToCart(producto, cantidad);
    setMensajeFeedback(`${cantidad} ${cantidad > 1 ? 'unidades agregadas' : 'unidad agregada'}`);
    setTimeout(() => setMensajeFeedback(''), 2500);
  };

  const handleView = () => {
    if (onViewDetails) onViewDetails(producto);
  };

  const precioFormateado = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(producto.precio);

  return (
    <motion.div 
      className="card h-100 shadow-sm border-0 product-card" 
      data-testid={`product-card-${producto.codigo}`}
      layoutId={`product-card-${producto.codigo}`}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
    >
      <div 
        className="position-relative bg-light text-center p-3 border-bottom rounded-top overflow-hidden"
        style={{ cursor: onViewDetails ? 'pointer' : 'default' }}
        onClick={handleView}
        title="Haz clic para ver la información completa"
      >
        <span 
          className="badge bg-success position-absolute top-0 start-0 m-2 rounded-pill small shadow-sm" 
          style={{ zIndex: 2 }}
          data-testid="badge-categoria"
        >
          {producto.categoria}
        </span>
        <motion.img 
          layoutId={`product-image-${producto.codigo}`}
          src={producto.imagen} 
          alt={producto.nombre} 
          className="img-fluid position-relative mt-2" 
          style={{ height: '140px', objectFit: 'contain', zIndex: 1 }}
          data-testid="product-image"
          onError={(e) => { e.target.style.display = 'none'; }}
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        />
      </div>

      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <h5 
            className="card-title fw-bold text-dark mb-0 fs-6" 
            data-testid="product-name"
            style={{ cursor: onViewDetails ? 'pointer' : 'default' }}
            onClick={handleView}
          >
            {producto.nombre}
          </h5>
          <span className="badge bg-light text-muted border small" data-testid="product-code">
            {producto.codigo}
          </span>
        </div>

        <p className="text-muted small mb-2 fst-italic" data-testid="product-attribute">
          <i className="bi bi-geo-alt-fill text-success me-1"></i> {producto.atributo}
        </p>

        <p 
          className="card-text small text-secondary flex-grow-1" 
          data-testid="product-description"
          style={{ cursor: onViewDetails ? 'pointer' : 'default' }}
          onClick={handleView}
        >
          {producto.descripcion}
        </p>

        <div className="d-flex justify-content-between align-items-baseline my-2">
          <span className="fs-5 fw-bold text-success" data-testid="product-price">
            {precioFormateado}
          </span>
          <span className="small text-muted" data-testid="product-unit">
            / {producto.unidad}
          </span>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="small text-muted" data-testid="product-stock">
            <i className="bi bi-box-seam me-1"></i> Stock: <strong>{producto.stock}</strong>
          </div>
          {onViewDetails && (
            <button 
              type="button" 
              className="btn btn-link btn-sm text-decoration-none p-0 text-success small fw-semibold"
              onClick={handleView}
            >
              Ver detalle <i className="bi bi-chevron-right small"></i>
            </button>
          )}
        </div>

        <div 
          className="d-flex align-items-center justify-content-between gap-2 mt-auto pt-2 border-top"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="input-group input-group-sm" style={{ width: '110px' }}>
            <button 
              className="btn btn-outline-secondary" 
              type="button" 
              onClick={handleDecrement}
              disabled={cantidad <= 1}
              data-testid="btn-decrement"
              aria-label="Disminuir cantidad"
            >
              <i className="bi bi-dash"></i>
            </button>
            <input 
              type="text" 
              className="form-control text-center bg-white" 
              readOnly 
              value={cantidad}
              data-testid="quantity-input"
            />
            <button 
              className="btn btn-outline-secondary" 
              type="button" 
              onClick={handleIncrement}
              disabled={cantidad >= producto.stock}
              data-testid="btn-increment"
              aria-label="Aumentar cantidad"
            >
              <i className="bi bi-plus"></i>
            </button>
          </div>

          <motion.button 
            className="btn btn-success btn-sm flex-grow-1 d-inline-flex align-items-center justify-content-center"
            onClick={handleAgregar}
            data-testid="btn-add-cart"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
          >
            <CartIcon size={16} className="me-1" /> Agregar
          </motion.button>

          <button
            type="button"
            className="btn btn-outline-danger btn-sm d-inline-flex align-items-center justify-content-center"
            title="Reportar fruta en mal estado"
            aria-label={`Reportar ${producto.nombre} en mal estado`}
            onClick={(e) => {
              e.stopPropagation();
              if (onReportProduct) {
                onReportProduct(producto);
              } else if (onViewDetails) {
                onViewDetails(producto);
              }
            }}
            data-testid="btn-report-product"
          >
            <i className="bi bi-flag"></i>
          </button>
        </div>

        {mensajeFeedback && (
          <motion.div 
            className="alert alert-success py-1 px-2 mt-2 mb-0 small text-center" 
            role="alert" 
            data-testid="feedback-message"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <i className="bi bi-check-circle-fill me-1"></i> {mensajeFeedback}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
