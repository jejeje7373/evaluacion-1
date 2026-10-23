import React from 'react';
import { motion } from 'framer-motion';

/**
 * Componente Hero Banner (Estilo SmoothUI + Bootstrap 5)
 * 
 * Responsividad Bootstrap:
 * - Contenedor con padding adaptativo (py-4 py-md-5)
 * - Grilla de 2 columnas en desktop (col-lg-7 y col-lg-5), apilada en móviles (col-12)
 * - Micro-interacciones y transiciones suaves inspiradas en SmoothUI
 * 
 * Props:
 * - onExplore: Función para redirigir al catálogo
 */
export default function Hero({ onExplore }) {
  return (
    <section className="bg-light py-4 py-md-5 border-bottom mb-4 overflow-hidden" data-testid="hero-section">
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
              Alimentos frescos directamente del campo chileno
            </h1>
            <p className="lead text-muted mb-4">
              Conectamos pequeños agricultores del Maule, O'Higgins y el sur de Chile con tu hogar. 
              Productos 100% orgánicos, libres de intermediarios y con despacho refrigerado garantizado.
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
            <div className="card shadow-sm border-0 bg-success text-white p-4 rounded-4">
              <div className="card-body">
                <i className="bi bi-basket-fill display-3 d-block mb-3"></i>
                <h3 className="h4 fw-bold">Canasta Campesina</h3>
                <p className="small mb-3 text-white-50">
                  Frutas y verduras seleccionadas a mano cada madrugada por productores locales.
                </p>
                <div className="row text-center g-2 pt-2 border-top border-white-50">
                  <div className="col-4">
                    <span className="fw-bold d-block fs-5">+9</span>
                    <span className="small text-white-50">Regiones</span>
                  </div>
                  <div className="col-4">
                    <span className="fw-bold d-block fs-5">100%</span>
                    <span className="small text-white-50">Natural</span>
                  </div>
                  <div className="col-4">
                    <span className="fw-bold d-block fs-5">24h</span>
                    <span className="small text-white-50">Despacho</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
