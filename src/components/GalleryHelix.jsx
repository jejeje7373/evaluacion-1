import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useSpring, useTransform, useMotionValueEvent } from 'framer-motion';
import CartIcon from './CartIcon.jsx';

/**
 * Componente GalleryHelix (Inspirado en Motion.dev: React Gallery Helix)
 * 
 * Crea una estructura helicoidal 3D (espiral de ADN/escalera) donde las tarjetas
 * de los productos giran y ascienden suavemente a medida que el usuario se desliza
 * hacia abajo en la página de inicio.
 */
export default function GalleryHelix({ 
  productos = [], 
  onSelectProduct, 
  onAddToCart,
  onExploreCatalog 
}) {
  if (!Array.isArray(productos) || productos.length === 0) {
    return null;
  }

  return (
    <GalleryHelixContent
      productos={productos}
      onSelectProduct={onSelectProduct}
      onAddToCart={onAddToCart}
      onExploreCatalog={onExploreCatalog}
    />
  );
}

function GalleryHelixContent({ 
  productos, 
  onSelectProduct, 
  onAddToCart,
  onExploreCatalog 
}) {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar tamaño de pantalla para ajustar el radio 3D de la hélice
  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkViewport();
    window.addEventListener('resize', checkViewport);
    return () => window.removeEventListener('resize', checkViewport);
  }, []);

  const helixItems = productos;
  const totalItems = helixItems.length;

  // Parámetros geométricos de la Hélice 3D
  const ANGLE_STEP = 45; // Grados de rotación por cada escalón de la espiral (8 pasos = 360°)
  const VERTICAL_STEP = isMobile ? 48 : 60; // Distancia vertical entre cada tarjeta en la hélice
  const RADIUS = isMobile ? 175 : 275; // Radio del cilindro 3D en píxeles

  // Capturar progreso del scroll mientras el usuario baja por la sección
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start 75%', 'end 25%']
  });

  // Físicas de resorte para suavizar el movimiento del scroll
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 85,
    damping: 22,
    restDelta: 0.001
  });

  // Transformar el progreso [0, 1] en rotación Y y traslación vertical Y de toda la columna
  const maxRotation = -Math.max(0, totalItems - 1) * ANGLE_STEP;
  const startY = ((totalItems - 1) * VERTICAL_STEP) / 2;
  const endY = -((totalItems - 1) * VERTICAL_STEP) / 2;

  const spineRotateY = useTransform(smoothProgress, [0, 1], [0, maxRotation]);
  const spineTranslateY = useTransform(smoothProgress, [0, 1], [startY, endY]);

  // Actualizar cuál es el producto que está en el frente según el avance del scroll
  useMotionValueEvent(smoothProgress, 'change', (latest) => {
    if (totalItems <= 1) return;
    const idx = Math.min(
      totalItems - 1,
      Math.max(0, Math.round(latest * (totalItems - 1)))
    );
    if (idx !== activeIndex) {
      setActiveIndex(idx);
    }
  });

  const currentProduct = helixItems[activeIndex] || helixItems[0];

  const formatearPrecio = (precio) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(precio);

  return (
    <section 
      ref={trackRef} 
      className="helix-scroll-track" 
      data-testid="gallery-helix-section"
    >
      <div className="helix-sticky-viewport container justify-content-center">
        {/* Escena 3D Principal */}
        <div className="helix-scene-3d my-2">
          {/* Eje central luminoso de la hélice */}
          <div className="helix-axis-line" />

          {/* Columna vertebral de la hélice que rota y se traslada con el scroll */}
          <motion.div
            className="helix-spine"
            style={{
              rotateX: -5,
              rotateZ: 2,
              rotateY: spineRotateY,
              y: spineTranslateY
            }}
          >
            {helixItems.map((prod, index) => {
              const itemAngle = index * ANGLE_STEP;
              const itemY = (index - (totalItems - 1) / 2) * VERTICAL_STEP;
              const isFront = index === activeIndex;

              return (
                <div
                  key={prod.codigo}
                  className={`helix-card-3d ${isFront ? 'helix-card-active' : ''}`}
                  style={{
                    transform: `translateY(${itemY}px) rotateY(${itemAngle}deg) translateZ(${RADIUS}px)`
                  }}
                  onClick={() => onSelectProduct && onSelectProduct(prod)}
                  data-testid={`helix-card-${prod.codigo}`}
                >
                  {/* Cabecera de la tarjeta 3D */}
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="badge bg-success rounded-pill" style={{ fontSize: '0.68rem' }}>
                      {prod.categoria}
                    </span>
                    <span className="badge bg-light text-muted border" style={{ fontSize: '0.65rem' }}>
                      #{index + 1}
                    </span>
                  </div>

                  {/* Contenedor de imagen del producto */}
                  <div className="helix-card-img-wrap my-1">
                    <img
                      src={prod.imagen}
                      alt={prod.nombre}
                      className="helix-card-img"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>

                  {/* Información del producto */}
                  <div>
                    <h6 className="fw-bold text-dark mb-0 text-truncate" title={prod.nombre}>
                      {prod.nombre}
                    </h6>
                    <p className="text-muted mb-2 text-truncate" style={{ fontSize: '0.75rem' }}>
                      <i className="bi bi-geo-alt-fill text-success me-1"></i>
                      {prod.atributo}
                    </p>

                    <div className="d-flex justify-content-between align-items-center pt-1 border-top">
                      <div>
                        <span className="fw-bold text-success small">
                          {formatearPrecio(prod.precio)}
                        </span>
                        <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                          /{prod.unidad}
                        </span>
                      </div>

                      <button
                        type="button"
                        className="btn btn-success btn-sm py-1 px-2 d-inline-flex align-items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onAddToCart) onAddToCart(prod, 1);
                        }}
                        title={`Agregar ${prod.nombre} al carrito`}
                      >
                        <CartIcon size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        {/* Barra inferior sincronizada con el producto activo del frente de la hélice */}
        <div className="w-100 z-3" style={{ maxWidth: '720px' }}>
          <div className="card border-0 shadow-sm bg-white rounded-4 p-3">
            <div className="row align-items-center g-3">
              <div className="col-auto d-none d-sm-block">
                <div className="bg-light rounded-3 p-2 text-center" style={{ width: '58px', height: '58px' }}>
                  <img
                    src={currentProduct.imagen}
                    alt={currentProduct.nombre}
                    style={{ maxHeight: '42px', maxWidth: '42px', objectFit: 'contain' }}
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
              </div>

              <div className="col">
                <div className="d-flex align-items-center gap-2 mb-1">
                  <span className="badge bg-success-subtle text-success rounded-pill small">
                    En Foco ({activeIndex + 1}/{totalItems})
                  </span>
                  <span className="text-muted small">
                    <i className="bi bi-geo-alt text-success me-1"></i>{currentProduct.atributo}
                  </span>
                </div>
                <h5 className="fw-bold text-dark mb-0 fs-6">
                  {currentProduct.nombre} — <span className="text-success">{formatearPrecio(currentProduct.precio)}</span> <small className="text-muted fw-normal">/ {currentProduct.unidad}</small>
                </h5>
              </div>

              <div className="col-12 col-sm-auto d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-outline-success btn-sm px-3 fw-semibold flex-grow-1"
                  onClick={() => onSelectProduct && onSelectProduct(currentProduct)}
                >
                  Ver Detalle
                </button>
                <button
                  type="button"
                  className="btn btn-success btn-sm px-3 fw-semibold d-inline-flex align-items-center justify-content-center flex-grow-1"
                  onClick={() => onAddToCart && onAddToCart(currentProduct, 1)}
                >
                  <CartIcon size={16} className="me-1" /> Agregar
                </button>
              </div>
            </div>

            {/* Indicadores de puntos del progreso de la hélice */}
            <div className="d-flex justify-content-center gap-2 mt-3 pt-2 border-top">
              {helixItems.map((item, idx) => (
                <button
                  key={item.codigo}
                  type="button"
                  onClick={() => onSelectProduct && onSelectProduct(item)}
                  aria-label={`Ver ${item.nombre}`}
                  className="border-0 p-0 rounded-pill transition-all"
                  style={{
                    width: idx === activeIndex ? '28px' : '8px',
                    height: '8px',
                    backgroundColor: idx === activeIndex ? '#2e8b57' : '#cbd5e1',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
