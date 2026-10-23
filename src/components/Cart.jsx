import React, { useState } from 'react';

/**
 * Componente Cart (Carrito de Compras)
 * 
 * Responsividad Bootstrap:
 * - 2 Columnas en escritorio: col-12 col-lg-8 (listado de ítems) y col-12 col-lg-4 (resumen de pago)
 * - Tabla responsive con table-responsive para móviles
 * 
 * Props:
 * - cartItems: Lista de productos en el carrito
 * - onUpdateQuantity: Callback para modificar cantidad (+/-)
 * - onRemoveItem: Callback para remover ítem
 * - onClearCart: Callback para vaciar el carrito
 * - onContinueShopping: Callback para volver al catálogo
 * 
 * Estado:
 * - cuponInput: Texto del cupón ingresado por el usuario
 * - descuentoPorcentaje: Porcentaje de descuento activo (ej: 0.10 = 10%)
 * - mensajeCupon: Mensaje reactivo de éxito o error al validar cupón
 * - ordenSimulada: Alerta con resumen cuando se finaliza la compra
 */
export default function Cart({
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onContinueShopping
}) {
  const [cuponInput, setCuponInput] = useState('');
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0);
  const [mensajeCupon, setMensajeCupon] = useState(null);
  const [ordenSimulada, setOrdenSimulada] = useState(null);

  // Cupones válidos oficiales
  const CUPONES = {
    'HOGAR10': 0.10, // 10% descuento
    'FRESCO15': 0.15 // 15% descuento
  };

  const formatearDinero = (monto) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(monto);
  };

  // Cálculos matemáticos del carrito
  const subtotal = cartItems.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
  const montoDescuento = Math.round(subtotal * descuentoPorcentaje);
  const costoEnvio = subtotal >= 20000 || subtotal === 0 ? 0 : 2500;
  const total = Math.max(0, subtotal - montoDescuento + costoEnvio);

  const handleAplicarCupon = (e) => {
    e.preventDefault();
    const codigoLimpio = cuponInput.trim().toUpperCase();
    if (CUPONES[codigoLimpio]) {
      const porcentaje = CUPONES[codigoLimpio];
      setDescuentoPorcentaje(porcentaje);
      setMensajeCupon({
        tipo: 'success',
        texto: `¡Cupón "${codigoLimpio}" aplicado! Descuento del ${porcentaje * 100}%.`
      });
    } else {
      setDescuentoPorcentaje(0);
      setMensajeCupon({
        tipo: 'danger',
        texto: 'Código de cupón inválido o caducado.'
      });
    }
  };

  const handleFinalizarCompra = () => {
    const orden = {
      numero: 'HH-' + Math.floor(100000 + Math.random() * 900000),
      totalFinal: total,
      itemsCount: cartItems.reduce((acc, i) => acc + i.cantidad, 0),
      fecha: new Date().toLocaleDateString('es-CL')
    };
    setOrdenSimulada(orden);
    if (onClearCart) {
      onClearCart();
    }
  };

  return (
    <section className="container my-4" data-testid="cart-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h3 fw-bold text-dark mb-0">Tu Canasta de Compras</h2>
        <button 
          className="btn btn-outline-success btn-sm"
          onClick={onContinueShopping}
          data-testid="btn-continue-shopping"
        >
          <i className="bi bi-arrow-left me-1"></i> Seguir Comprando
        </button>
      </div>

      {ordenSimulada && (
        <div className="alert alert-success shadow-sm p-4 text-center mb-4" data-testid="checkout-success-alert">
          <i className="bi bi-check-circle-fill text-success display-4 d-block mb-2"></i>
          <h4 className="alert-heading fw-bold">¡Compra simulada realizada con éxito!</h4>
          <p className="mb-2">
            Hemos generado tu orden de despacho <strong>{ordenSimulada.numero}</strong> por un total de <strong>{formatearDinero(ordenSimulada.totalFinal)}</strong>.
          </p>
          <small className="text-muted d-block mb-3">Recibirás los detalles en el correo registrado.</small>
          <button 
            className="btn btn-success btn-sm"
            onClick={() => setOrdenSimulada(null)}
            data-testid="btn-dismiss-success"
          >
            Aceptar y Volver
          </button>
        </div>
      )}

      {cartItems.length === 0 && !ordenSimulada ? (
        <div className="card shadow-sm border-0 text-center py-5 my-4" data-testid="empty-cart-view">
          <div className="card-body">
            <i className="bi bi-cart-x text-muted display-3 d-block mb-3"></i>
            <h4 className="fw-bold text-secondary">Tu carrito está vacío</h4>
            <p className="text-muted mb-4">Aún no has agregado productos frescos del campo.</p>
            <button 
              className="btn btn-success px-4"
              onClick={onContinueShopping}
              data-testid="btn-go-to-catalog"
            >
              Explorar Catálogo de Productos
            </button>
          </div>
        </div>
      ) : cartItems.length > 0 && (
        <div className="row g-4">
          {/* Listado de Productos (8 cols en desktop) */}
          <div className="col-12 col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="table-responsive">
                <table className="table align-middle mb-0" data-testid="cart-table">
                  <thead className="table-light">
                    <tr>
                      <th scope="col" className="ps-3">Producto</th>
                      <th scope="col" className="text-center">Precio</th>
                      <th scope="col" className="text-center" style={{ width: '130px' }}>Cantidad</th>
                      <th scope="col" className="text-end">Subtotal</th>
                      <th scope="col" className="text-center pe-3">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <tr key={item.codigo} data-testid={`cart-row-${item.codigo}`}>
                        <td className="ps-3">
                          <div className="d-flex align-items-center">
                            <img 
                              src={item.imagen} 
                              alt={item.nombre} 
                              className="img-thumbnail me-3 d-none d-sm-block" 
                              style={{ width: '50px', height: '50px', objectFit: 'contain' }}
                            />
                            <div>
                              <div className="fw-bold text-dark">{item.nombre}</div>
                              <small className="text-muted">{item.unidad}</small>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">{formatearDinero(item.precio)}</td>
                        <td className="text-center">
                          <div className="input-group input-group-sm">
                            <button 
                              className="btn btn-outline-secondary" 
                              type="button"
                              onClick={() => onUpdateQuantity(item.codigo, item.cantidad - 1)}
                              disabled={item.cantidad <= 1}
                              data-testid={`cart-dec-${item.codigo}`}
                            >
                              -
                            </button>
                            <span className="form-control text-center bg-white px-1" data-testid={`cart-qty-${item.codigo}`}>
                              {item.cantidad}
                            </span>
                            <button 
                              className="btn btn-outline-secondary" 
                              type="button"
                              onClick={() => onUpdateQuantity(item.codigo, item.cantidad + 1)}
                              data-testid={`cart-inc-${item.codigo}`}
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="text-end fw-semibold text-dark" data-testid={`cart-subtotal-${item.codigo}`}>
                          {formatearDinero(item.precio * item.cantidad)}
                        </td>
                        <td className="text-center pe-3">
                          <button 
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => onRemoveItem(item.codigo)}
                            title="Eliminar producto"
                            data-testid={`cart-remove-${item.codigo}`}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="card-footer bg-white d-flex justify-content-between py-3">
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={onClearCart}
                  data-testid="btn-clear-cart"
                >
                  Vaciar Carrito
                </button>
                <span className="text-muted small align-self-center">
                  Precios con IVA incluido
                </span>
              </div>
            </div>
          </div>

          {/* Resumen de Compra y Cupones (4 cols en desktop) */}
          <div className="col-12 col-lg-4">
            <div className="card shadow-sm border-0 mb-3">
              <div className="card-body">
                <h5 className="card-title fw-bold mb-3">Resumen de la Orden</h5>

                {/* Formulario de Cupón */}
                <form onSubmit={handleAplicarCupon} className="mb-3" data-testid="coupon-form">
                  <label htmlFor="couponInput" className="form-label small text-muted mb-1">
                    ¿Tienes un cupón de descuento?
                  </label>
                  <div className="input-group input-group-sm">
                    <input 
                      type="text" 
                      id="couponInput"
                      className="form-control" 
                      placeholder="Ej: HOGAR10 o FRESCO15"
                      value={cuponInput}
                      onChange={(e) => setCuponInput(e.target.value)}
                      data-testid="coupon-input"
                    />
                    <button className="btn btn-outline-success" type="submit" data-testid="coupon-submit">
                      Aplicar
                    </button>
                  </div>
                  {mensajeCupon && (
                    <div 
                      className={`alert alert-${mensajeCupon.tipo} py-1 px-2 mt-2 mb-0 small`}
                      data-testid="coupon-feedback"
                    >
                      {mensajeCupon.texto}
                    </div>
                  )}
                </form>

                <hr />

                {/* Desglose de totales */}
                <div className="d-flex justify-content-between mb-2 small">
                  <span className="text-muted">Subtotal productos:</span>
                  <span className="fw-semibold" data-testid="summary-subtotal">{formatearDinero(subtotal)}</span>
                </div>

                {descuentoPorcentaje > 0 && (
                  <div className="d-flex justify-content-between mb-2 small text-success">
                    <span>Descuento ({(descuentoPorcentaje * 100)}%):</span>
                    <span className="fw-semibold" data-testid="summary-discount">-{formatearDinero(montoDescuento)}</span>
                  </div>
                )}

                <div className="d-flex justify-content-between mb-2 small">
                  <span className="text-muted">Costo de despacho:</span>
                  <span className="fw-semibold" data-testid="summary-shipping">
                    {costoEnvio === 0 ? <span className="text-success fw-bold">Gratis</span> : formatearDinero(costoEnvio)}
                  </span>
                </div>

                {subtotal < 20000 && (
                  <div className="alert alert-info py-1 px-2 small mb-3">
                    <i className="bi bi-info-circle-fill me-1"></i>
                    ¡Envío gratis por compras sobre $20.000! Te faltan {formatearDinero(20000 - subtotal)}.
                  </div>
                )}

                <div className="d-flex justify-content-between pt-2 border-top mb-3">
                  <span className="fs-5 fw-bold text-dark">Total:</span>
                  <span className="fs-5 fw-bold text-success" data-testid="summary-total">{formatearDinero(total)}</span>
                </div>

                <button 
                  className="btn btn-success w-100 py-2 fw-semibold shadow-sm"
                  onClick={handleFinalizarCompra}
                  data-testid="btn-checkout"
                >
                  Finalizar Compra y Simular Pago
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

