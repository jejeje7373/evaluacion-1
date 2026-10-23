import React, { useState } from 'react';
import ProductCard from './ProductCard.jsx';
import { CATEGORIAS } from '../data/products.js';

/**
 * Componente ProductList
 * 
 * Responsividad Bootstrap:
 * - Grilla adaptativa: row-cols-1 (móvil) -> row-cols-sm-2 (tablet pequeña) -> row-cols-md-3 (tablet/laptop) -> row-cols-lg-4 (pantallas grandes)
 * - Barra de búsqueda y filtros adaptativos con flexbox
 * 
 * Props:
 * - productos: Lista completa de productos
 * - onAddToCart: Callback propagado hacia ProductCard
 */
export default function ProductList({ productos = [], onAddToCart }) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  // Filtrado reactivo combinado por categoría y texto
  const productosFiltrados = productos.filter(prod => {
    const coincideCategoria = categoriaSeleccionada === 'Todas' || prod.categoria === categoriaSeleccionada;
    const coincideBusqueda = prod.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
                             prod.descripcion.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
                             prod.atributo.toLowerCase().includes(terminoBusqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  return (
    <section className="container my-4" data-testid="product-list-section">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="h3 fw-bold text-dark mb-1">Catálogo de Productos Frescos</h2>
          <p className="text-muted small mb-0">Directo de agricultores chilenos certificados</p>
        </div>

        {/* Buscador reactivo */}
        <div style={{ maxWidth: '320px', width: '100%' }}>
          <input 
            type="search" 
            className="form-control" 
            placeholder="Buscar por fruta, verdura..."
            value={terminoBusqueda}
            onChange={(e) => setTerminoBusqueda(e.target.value)}
            data-testid="search-input"
          />
        </div>
      </div>

      {/* Botones de Filtro por Categoría */}
      <div className="d-flex flex-wrap gap-2 mb-4" data-testid="category-filters">
        {CATEGORIAS.map(cat => (
          <button 
            key={cat}
            className={`btn btn-sm ${categoriaSeleccionada === cat ? 'btn-success fw-bold' : 'btn-outline-secondary'}`}
            onClick={() => setCategoriaSeleccionada(cat)}
            data-testid={`filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grilla responsiva de productos */}
      {productosFiltrados.length === 0 ? (
        <div className="alert alert-warning text-center py-4 my-4" data-testid="no-products-message">
          <i className="bi bi-search fs-2 d-block mb-2 text-secondary"></i>
          No encontramos productos que coincidan con "<strong>{terminoBusqueda}</strong>" en la categoría {categoriaSeleccionada}.
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4" data-testid="products-grid">
          {productosFiltrados.map(prod => (
            <div className="col" key={prod.codigo}>
              <ProductCard producto={prod} onAddToCart={onAddToCart} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

