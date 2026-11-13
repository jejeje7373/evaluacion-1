import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard.jsx';
import { CATEGORIAS } from '../data/products.js';

const normalizarTexto = (txt = '') =>
  txt.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

/**
 * Componente ProductList
 * 
 * Consume los productos y categorías provenientes de los microservicios
 * ms-productos (:8083) y ms-categorias (:8082).
 */
export default function ProductList({
  productos = [],
  categorias = CATEGORIAS,
  onAddToCart,
  onViewDetails
}) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todas');
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  const listaCategorias = Array.isArray(categorias) && categorias.length > 0
    ? (categorias.includes('Todas') ? categorias : ['Todas', ...categorias])
    : CATEGORIAS;

  // Escuchar selección de producto desde el Hero o componentes externos
  useEffect(() => {
    const handleSelectProduct = (e) => {
      const codigo = e.detail?.codigo;
      if (!codigo) return;

      setCategoriaSeleccionada('Todas');
      setTerminoBusqueda('');

      setTimeout(() => {
        const el = document.getElementById(`producto-${codigo}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('product-highlight');
          setTimeout(() => el.classList.remove('product-highlight'), 2400);
        }
      }, 150);
    };

    const handleShowAll = () => {
      setCategoriaSeleccionada('Todas');
      setTerminoBusqueda('');
    };

    window.addEventListener('huertohogar:select-product', handleSelectProduct);
    window.addEventListener('huertohogar:show-all-products', handleShowAll);
    return () => {
      window.removeEventListener('huertohogar:select-product', handleSelectProduct);
      window.removeEventListener('huertohogar:show-all-products', handleShowAll);
    };
  }, []);

  // Filtrado reactivo combinado por categoría y texto
  const productosFiltrados = productos.filter(prod => {
    const coincideCategoria =
      categoriaSeleccionada === 'Todas' ||
      normalizarTexto(prod.categoria) === normalizarTexto(categoriaSeleccionada);
    const busq = normalizarTexto(terminoBusqueda);
    const coincideBusqueda =
      normalizarTexto(prod.nombre).includes(busq) ||
      normalizarTexto(prod.descripcion).includes(busq) ||
      normalizarTexto(prod.atributo).includes(busq);
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
        {listaCategorias.map(cat => (
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
            <div className="col" key={prod.codigo} id={`producto-${prod.codigo}`}>
              <ProductCard producto={prod} onAddToCart={onAddToCart} onViewDetails={onViewDetails} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
