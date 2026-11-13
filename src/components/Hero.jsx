import React from 'react';
import { motion } from 'framer-motion';
import ScrollableCardStack from './ScrollableCardStack';

const GRADIENTES_DESTACADOS = [
  'linear-gradient(135deg, #d97706 0%, #78350f 100%)',
  'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
  'linear-gradient(135deg, #ea580c 0%, #9a3412 100%)',
  'linear-gradient(135deg, #16a34a 0%, #14532d 100%)'
];

const ICONOS_DESTACADOS = [
  'bi-award-fill',
  'bi-bag-heart-fill',
  'bi-patch-check-fill',
  'bi-sun-fill'
];

/**
 * Componente Hero Banner (Estilo SmoothUI + Bootstrap 5)
 *
 * Muestra productos destacados cargados dinámicamente desde la API.
 *
 * Props:
 * - productos: Lista de productos provenientes del backend
 * - cargando: Estado de carga del catálogo
 * - onExplore: Función para redirigir al catálogo
 * - onSelectProduct: Callback opcional al hacer click en un producto de la pila
 */
export default function Hero({ productos = [], cargando = false, onExplore, onSelectProduct }) {
  const productosDestacados = Array.isArray(productos)
    ? productos.slice(0, 4).map((p, idx) => ({
        id: p.codigo || String(idx),
        codigo: p.codigo,
        badge: `Destacado #${idx + 1}`,
        title: p.nombre,
        precio: `$${Number(p.precio || 0).toLocaleString('es-CL')} / ${p.unidad || 'unidad'}`,
        description: p.descripcion || `${p.categoria} fresco de ${p.atributo || 'V Región'}.`,
        imagen: p.imagen,
        icon: ICONOS_DESTACADOS[idx % ICONOS_DESTACADOS.length],
        bgGradient: GRADIENTES_DESTACADOS[idx % GRADIENTES_DESTACADOS.length],
        stats: [
          { label: 'Categoría', value: p.categoria || 'Huerto' },
          { label: 'Origen', value: p.atributo || 'V Región' },
          { label: 'Stock', value: `${p.stock ?? 0}` }
        ]
      }))
    : [];

  const handleItemClick = (item) => {
    if (onSelectProduct) {
      onSelectProduct(item.codigo);
    }
    window.dispatchEvent(new CustomEvent('huertohogar:select-product', {
      detail: { codigo: item.codigo }
    }));
  };

  return (
    <section className="hero-orchard-glass py-4 py-md-5 border-bottom mb-4 overflow-hidden" data-testid="hero-section">
      <div className="container">
        <div className="row align-items-center g-4">
          <motion.div
            className="col-12 col-lg-7 text-center text-lg-start"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <span className="badge bg-success-subtle text-success border border-success-subtle mb-2 px-3 py-2 rounded-pill fw-semibold">
              <i className="bi bi-leaf-fill me-1"></i> Cosechado hoy, en tu mesa mañana
            </span>
            <h1 className="display-5 fw-bold text-dark mt-2 mb-3">
              Alimentos frescos directamente de la V Región de Valparaíso
            </h1>
            <p className="lead text-muted mb-4">
              Conectamos pequeños agricultores de Quillota, Limache, Olmué, el Valle de Aconcagua y Casablanca con tu hogar.
              Productos 100% orgánicos de la 5ª Región, libres de intermediarios y con despacho refrigerado garantizado.
            </p>
            <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3">
              <motion.button
                className="btn btn-success btn-lg px-4 shadow-sm"
                onClick={onExplore}
                data-testid="hero-cta"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 17 }}
              >
                <i className="bi bi-bag-fill me-2"></i> Ver Catálogo de Temporada
              </motion.button>
              <div className="d-flex align-items-center justify-content-center text-muted small">
                <i className="bi bi-star-fill text-warning me-1"></i>
                <span>4.9/5 satisfacción en más de 9 regiones</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="col-12 col-lg-5 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.1 }}
          >
            {cargando ? (
              <div className="p-5 bg-white rounded-4 border shadow-sm text-center" style={{ minHeight: '340px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} data-testid="hero-loading">
                <div className="spinner-border text-success mb-3" role="status">
                  <span className="visually-hidden">Cargando destacados...</span>
                </div>
                <span className="text-muted small">Cargando productos destacados desde el servidor...</span>
              </div>
            ) : productosDestacados.length > 0 ? (
              <ScrollableCardStack
                items={productosDestacados}
                onItemClick={handleItemClick}
                cardHeight={390}
              />
            ) : (
              <div className="p-5 bg-white rounded-4 border shadow-sm text-center text-muted" style={{ minHeight: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }} data-testid="hero-empty">
                <i className="bi bi-basket2 fs-1 text-success mb-2"></i>
                <p className="mb-0 small">Explora nuestro catálogo para ver la cosecha disponible.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
