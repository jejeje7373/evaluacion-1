import React from 'react';
import ProductDetail from '../src/components/ProductDetail.jsx';
import { setupTestContainer, cleanupTestContainer, render, fireClick } from './test-utils.js';

describe('Componente ProductDetail (Página de detalle del producto)', () => {
  let container;
  let mockProducto;
  let mockOnBack;
  let mockOnAddToCart;
  let mockOnGoToCart;
  let mockOnSelectRelated;

  beforeEach(() => {
    container = setupTestContainer();

    mockProducto = {
      codigo: 'FR001',
      nombre: 'Manzanas Fuji',
      categoria: 'Frutas Frescas',
      precio: 1200,
      unidad: 'kilo',
      stock: 5,
      atributo: 'Valle del Maule',
      descripcion: 'Manzanas crujientes y dulces del Valle del Maule.',
      imagen: 'assets/img/manzanas.svg'
    };

    mockOnBack = jasmine.createSpy('onBack');
    mockOnAddToCart = jasmine.createSpy('onAddToCart');
    mockOnGoToCart = jasmine.createSpy('onGoToCart');
    mockOnSelectRelated = jasmine.createSpy('onSelectRelated');
  });

  afterEach(() => {
    cleanupTestContainer();
  });

  it('1. Debe renderizar la información completa del producto', () => {
    render(
      <ProductDetail 
        producto={mockProducto} 
        onBack={mockOnBack}
        onAddToCart={mockOnAddToCart}
      />
    );

    const nameEl = container.querySelector('[data-testid="detail-product-name"]');
    const priceEl = container.querySelector('[data-testid="detail-product-price"]');
    const descEl = container.querySelector('[data-testid="detail-product-description"]');

    expect(nameEl).not.toBeNull();
    expect(nameEl.textContent.trim()).toBe('Manzanas Fuji');
    expect(priceEl.textContent).toContain('1.200');
    expect(descEl.textContent).toContain('Manzanas crujientes y dulces del Valle del Maule.');
  });

  it('2. Debe llamar a onBack al pulsar el botón de volver al catálogo', () => {
    render(
      <ProductDetail 
        producto={mockProducto} 
        onBack={mockOnBack}
        onAddToCart={mockOnAddToCart}
      />
    );

    const btnBack = container.querySelector('[data-testid="btn-back-to-catalog"]');
    expect(btnBack).not.toBeNull();
    fireClick(btnBack);

    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it('3. Debe agregar al carrito la cantidad seleccionada', () => {
    render(
      <ProductDetail 
        producto={mockProducto} 
        onBack={mockOnBack}
        onAddToCart={mockOnAddToCart}
      />
    );

    const btnAdd = container.querySelector('[data-testid="detail-btn-add-cart"]');
    expect(btnAdd).not.toBeNull();
    fireClick(btnAdd);

    expect(mockOnAddToCart).toHaveBeenCalledWith(mockProducto, 1);
  });

  it('4. Debe permitir abrir el formulario y reportar una fruta en mal estado', async () => {
    const mockOnReport = jasmine.createSpy('onReportProduct').and.returnValue(Promise.resolve({ id: 1 }));
    render(
      <ProductDetail
        producto={mockProducto}
        onBack={mockOnBack}
        onAddToCart={mockOnAddToCart}
        onReportProduct={mockOnReport}
      />
    );

    const btnOpen = container.querySelector('[data-testid="btn-open-report-modal"]');
    expect(btnOpen).not.toBeNull();
    fireClick(btnOpen);

    const form = container.querySelector('[data-testid="product-report-form"]');
    expect(form).not.toBeNull();

    const submitBtn = container.querySelector('[data-testid="btn-submit-product-report"]');
    fireClick(submitBtn);
    await new Promise((r) => setTimeout(r, 30));

    expect(mockOnReport).toHaveBeenCalledWith(jasmine.objectContaining({
      codigoProducto: 'FR001',
      nombreProducto: 'Manzanas Fuji',
      motivo: 'Fruta en mal estado'
    }));
  });
});
