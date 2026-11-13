import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CartIcon from './CartIcon.jsx';

/**
 * Componente Cart (Carrito de Compras)
 * 
 * Conectado al microservicio ms-ventas mediante la capa de servicios y la prop onCheckout provista por App.jsx, lo que además descuenta stock en ms-productos.
 */
export default function Cart({
  cartItems = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onContinueShopping,
  currentUser = null,
  onCheckout
}) {
  const [cuponInput, setCuponInput] = useState('');
  const [cuponAplicado, setCuponAplicado] = useState('');
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState(0);
  const [mensajeCupon, setMensajeCupon] = useState(null);
  const [ordenSimulada, setOrdenSimulada] = useState(null);
  const [errorCheckout, setErrorCheckout] = useState('');
  const [procesandoPago, setProcesandoPago] = useState(false);

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
      setCuponAplicado(codigoLimpio);
      setMensajeCupon({
        tipo: 'success',
        texto: `¡Cupón "${codigoLimpio}" aplicado! Descuento del ${porcentaje * 100}%.`
      });
    } else {
      setDescuentoPorcentaje(0);
      setCuponAplicado('');
      setMensajeCupon({
        tipo: 'danger',
        texto: 'Código de cupón inválido o caducado.'
      });
    }
  };

  const handleFinalizarCompra = async () => {
    setErrorCheckout('');

    if (onCheckout) {
      try {
        setProcesandoPago(true);
        const payload = {
          emailCliente: currentUser?.email || 'invitado@huertohogar.cl',
          nombreCliente: currentUser?.nombre || 'Cliente Invitado',
          regionDestino: currentUser?.region || 'Región Metropolitana',
          comunaDestino: currentUser?.comuna || 'Santiago',
          descuentoPorcentaje: Math.round(descuentoPorcentaje * 100),
          cuponAplicado: cuponAplicado || null,
          detalles: cartItems.map(item => ({
            codigoProducto: item.codigo,
            nombreProducto: item.nombre,
            cantidad: item.cantidad,
            precioUnitario: item.precio,
            unidad: item.unidad
          }))
        };

        const ordenCreada = await onCheckout(payload);
        const orden = {
          numero: ordenCreada?.id ? `HH-${String(ordenCreada.id).padStart(6, '0')}` : 'HH-' + Math.floor(100000 + Math.random() * 900000),
          totalFinal: ordenCreada?.total ?? total,
          estado: ordenCreada?.estado || 'CONFIRMADA',
          itemsCount: cartItems.reduce((acc, i) => acc + i.cantidad, 0),
          fecha: new Date().toLocaleDateString('es-CL')
        };
        setOrdenSimulada(orden);
        if (onClearCart) {
          onClearCart();
        }
      } catch (err) {
        const msg = err?.response?.data?.error || 'No se pudo procesar la compra en el servidor. Verifica el stock disponible.';
        setErrorCheckout(msg);
      } finally {
        setProcesandoPago(false);
      }
      return;
    }

    // Fallback síncrono para pruebas unitarias aisladas (Karma/Jasmine)
    const orden = {
      numero: 'HH-' + Math.floor(100000 + Math.random() * 900000),
      totalFinal: total,
      estado: 'Preparando en Huerto',
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
        <h2 className="h3 fw-bold text-dark mb-0 d-flex align-items-center">
          <CartIcon size={24} className="me-2 text-success" /> Tu Canasta de Compras
        </h2>
        <button 
          className="btn btn-outline-success btn-sm"
          onClick={onContinueShopping}
          data-testid="btn-continue-shopping"
        >
          <i className="bi bi-arrow-left me-1"></i> Seguir Comprando
        </button>
      </div>

      {errorCheckout && (
        <div className="alert alert-danger shadow-sm mb-4" role="alert" data-testid="checkout-error-alert">
          <i className="bi bi-exclamation-triangle-fill me-2"></i>
          {errorCheckout}
        </div>
      )}

      {/* Confirmación animada estilo React Animate Suspense (Motion) */}
      <AnimatePresence mode="wait">
        {ordenSimulada && (
          <motion.div 
            className="alert alert-success shadow-lg p-4 p-md-5 text-center mb-4 border-0 rounded-4" 
            data-testid="checkout-success-alert"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -16 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}
          >
            {/* SVG Checkmark animado con trazo progresivo (Motion Draw Effect) */}
            <motion.svg 
              width="80" 
              height="80" 
              viewBox="0 0 80 80" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="d-block mx-auto mb-3 text-success"
            >
              <motion.circle 
                cx="40" 
                cy="40" 
                r="36" 
                stroke="#22c55e" 
                strokeWidth="4" 
                strokeLinecap="round"
                initial={{ pathLength: 0, rotate: -90 }}
                animate={{ pathLength: 1, rotate: 0 }}
                transition={{ duration: 0.65, ease: 'easeOut' }}
              />
              <motion.path 
                d="M26 40 L36 50 L54 32" 
                stroke="#16a34a" 
                strokeWidth="4.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.35, duration: 0.45, ease: 'easeOut' }}
              />
            </motion.svg>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.3 }}
            >
              <span className="badge bg-success-subtle text-success border border-success px-3 py-1 rounded-pill small mb-2 fw-semibold">
                <i className="bi bi-shield-check me-1"></i> Pago Verificado con Éxito
              </span>
              <h4 className="alert-heading fw-bold text-dark mt-1 mb-2">¡Compra simulada realizada con éxito!</h4>
              <p className="mb-3 text-secondary fs-6" style={{ maxWidth: '600px', margin: '0 auto' }}>
                Hemos generado tu orden de despacho <strong className="text-dark font-monospace">{ordenSimulada.numero}</strong> por un total de <strong className="text-success">{formatearDinero(ordenSimulada.totalFinal)}</strong>.
              </p>

              {/* Ficha resumen con animación stagger */}
              <div className="card border-0 bg-white shadow-sm p-3 mx-auto mb-4 text-start" style={{ maxWidth: '520px', borderRadius: '1rem' }}>
                <div className="d-flex justify-content-between align-items-center pb-2 border-bottom mb-2">
                  <span className="text-muted small">N° de Seguimiento:</span>
                  <span className="font-monospace fw-bold text-dark">{ordenSimulada.numero}</span>
                </div>
                <div className="d-flex justify-content-between align-items-center pb-2 border-bottom mb-2">
                  <span className="text-muted small">Fecha estimada de entrega:</span>
                  <span className="fw-semibold text-dark">
                    <i className="bi bi-truck text-success me-1"></i> 24-48 hrs refrigerado
                  </span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span className="text-muted small">Estado del pedido:</span>
                  <span className="badge bg-success rounded-pill">{ordenSimulada.estado || 'Preparando en Huerto'}</span>
                </div>
              </div>

              <small className="text-muted d-block mb-4">
                <i className="bi bi-envelope-check me-1"></i> Recibirás el comprobante y los detalles en el correo registrado.
              </small>

              <div className="d-flex justify-content-center gap-2">
                <motion.button 
                  className="btn btn-success px-4 py-2 fw-semibold shadow-sm"
                  onClick={() => setOrdenSimulada(null)}
                  data-testid="btn-dismiss-success"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <i className="bi bi-check2-circle me-1"></i> Aceptar y Volver
                </motion.button>
                <motion.button 
                  className="btn btn-outline-success px-4 py-2 fw-semibold"
                  onClick={() => {
                    setOrdenSimulada(null);
                    if (onContinueShopping) onContinueShopping();
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  Explorar Más Productos
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  className="btn btn-success w-100 py-2 fw-semibold shadow-sm d-flex align-items-center justify-content-center"
                  onClick={handleFinalizarCompra}
                  disabled={procesandoPago}
                  data-testid="btn-checkout"
                >
                  <CartIcon size={20} className="me-2" />
                  {procesandoPago ? 'Procesando Orden...' : 'Finalizar Compra y Simular Pago'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
