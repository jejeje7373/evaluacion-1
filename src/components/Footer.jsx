import React from 'react';

/**
 * Componente Footer
 * 
 * Responsividad Bootstrap:
 * - 3 Columnas en pantallas medianas y grandes (col-12 col-md-4)
 * - Apilado vertical en móviles con márgenes espaciados (mb-4 mb-md-0)
 */
export default function Footer() {
  return (
    <footer className="bg-dark text-white pt-5 pb-4 mt-auto border-top border-success border-3" data-testid="footer">
      <div className="container">
        <div className="row g-4">
          {/* Columna 1: Marca y descripción */}
          <div className="col-12 col-md-4 text-center text-md-start">
            <h5 className="fw-bold text-success d-flex align-items-center justify-content-center justify-content-md-start">
              <i className="bi bi-tree-fill me-2"></i> HuertoHogar
            </h5>
            <p className="text-secondary small mt-2">
              Conectando la tierra con tu mesa. Productos 100% orgánicos cosechados con amor por familias campesinas en Chile.
            </p>
            <p className="small text-secondary mb-0">
              <i className="bi bi-geo-alt-fill text-success me-1"></i>
              Despachos en Santiago, Viña del Mar, Concepción, Temuco, Puerto Montt y más.
            </p>
          </div>

          {/* Columna 2: Enlaces rápidos */}
          <div className="col-12 col-md-4 text-center">
            <h6 className="fw-bold text-uppercase text-light mb-3">Compromiso Sustentable</h6>
            <ul className="list-unstyled text-secondary small mb-0">
              <li className="mb-2"><i className="bi bi-check2 text-success me-1"></i> Huella de carbono reducida</li>
              <li className="mb-2"><i className="bi bi-check2 text-success me-1"></i> Cero pesticidas industriales</li>
              <li className="mb-2"><i className="bi bi-check2 text-success me-1"></i> Comercio justo con pequeños agricultores</li>
              <li className="mb-2"><i className="bi bi-check2 text-success me-1"></i> Embalajes 100% reciclables y compostables</li>
            </ul>
          </div>

          {/* Columna 3: Información académica */}
          <div className="col-12 col-md-4 text-center text-md-end">
            <h6 className="fw-bold text-uppercase text-light mb-3">Proyecto Académico</h6>
            <p className="small text-secondary mb-1">
              <strong>Asignatura:</strong> Desarrollo de Software Web (DSY1104)
            </p>
            <p className="small text-secondary mb-1">
              <strong>Institución:</strong> Duoc UC — Escuela de Informática
            </p>
            <p className="small text-secondary mb-0">
              <strong>Framework:</strong> React + Bootstrap 5 + Jasmine & Karma
            </p>
          </div>
        </div>

        <hr className="my-4 border-secondary opacity-50" />

        <div className="text-center text-secondary small">
          © {new Date().getFullYear()} HuertoHogar SpA. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}

