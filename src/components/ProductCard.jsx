import React, { useState } from 'react';

/**
 * Componente ProductCard
 * Props:
 * - producto: Objeto con datos del producto
 * - onAddToCart: Callback invocado al añadir al carro
 * Estado:
 * - cantidad: Unidades a añadir (1 a stock)
 * - mensajeFeedback: Notificación temporal de confirmación
 */
export default function ProductCard({ producto, onAddToCart }) {
  const [cantidad, setCantidad] = useState(1);
  const [mensajeFeedback, setMensajeFeedback] = useState('');

  if (!producto) return null;

  const handleIncrement = () => {
    if (cantidad < producto.stock) setCantidad(prev => prev + 1);
  };

  const handleDecrement = () => {
    if (cantidad > 1) setCantidad(prev => prev - 1);
  };

  const handleAgregar = () => {
    if (onAddToCart) onAddToCart(producto, cantidad);
    setMensajeFeedback(`${cantidad} ${cantidad > 1 ? 'unidades agregadas' : 'unidad agregada'}`);
    setTimeout(() => setMensajeFeedback(''), 2500);
  };

  const precioFormateado = new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0
  }).format(producto.precio);

  return (
    <div className="card h-100 shadow-sm border-0 product-card" data-testid={`product-card-${producto.codigo}`}>
      <div className="position-relative bg-light text-center p-3 border-bottom rounded-top">
        <span className="badge bg-success position-absolute top-0 start-0 m-2 rounded-pill small" data-testid="badge-categoria">
          {producto.categoria}
        </span>
        <img 
          src={producto.imagen} 
          alt={producto.nombre} 
          className="img-fluid" 
          style={{ height: '140px', objectFit: 'contain' }}
          data-testid="product-image"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      </div>

      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-1">
          <h5 className="card-title fw-bold text-dark mb-0 fs-6" data-testid="product-name">
            {producto.nombre}
          </h5>
          <span className="badge bg-light text-muted border small" data-testid="product-code">
            {producto.codigo}
          </span>
        </div>

        <p className="text-muted small mb-2 fst-italic" data-testid="product-attribute">
          <i className="bi bi-geo-alt-fill me-1"></i> {producto.atributo}
        </p>

        <p className="card-text small text-secondary flex-grow-1" data-testid="product-description">
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

        <div className="small text-muted mb-2" data-testid="product-stock">
          <i className="bi bi-box-seam me-1"></i> Stock: <strong>{producto.stock}</strong>
        </div>

        <div className="d-flex align-items-center justify-content-between gap-2 mt-auto pt-2 border-top">
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

          <button 
            className="btn btn-success btn-sm flex-grow-1"
            onClick={handleAgregar}
            data-testid="btn-add-cart"
          >
            <i className="bi bi-cart-plus me-1"></i> Agregar
          </button>
        </div>

        {mensajeFeedback && (
          <div className="alert alert-success py-1 px-2 mt-2 mb-0 small text-center" role="alert" data-testid="feedback-message">
            <i className="bi bi-check-circle-fill me-1"></i> {mensajeFeedback}
          </div>
        )}
      </div>
    </div>
  );
}
