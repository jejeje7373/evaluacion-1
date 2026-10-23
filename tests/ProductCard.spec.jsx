import React from 'react';
import ProductCard from '../src/components/ProductCard.jsx';
import { setupTestContainer, cleanupTestContainer, render, fireClick } from './test-utils.js';

describe('Componente ProductCard (Pruebas Unitarias con Jasmine & Karma)', () => {
  let container;
  let mockProducto;
  let mockOnAddToCart;

  beforeEach(() => {
    container = setupTestContainer();

    // Mock de datos del producto
    mockProducto = {
      codigo: 'FR001',
      nombre: 'Manzanas Fuji',
      categoria: 'Frutas Frescas',
      precio: 1200,
      unidad: 'kilo',
      stock: 5,
      atributo: 'Valle del Maule',
      descripcion: 'Manzanas crujientes y dulces del Maule.',
      imagen: 'assets/img/manzanas.svg'
    };

    // Mock de callback mediante espía Jasmine (Spy)
    mockOnAddToCart = jasmine.createSpy('onAddToCart');
  });

  afterEach(() => {
    cleanupTestContainer();
  });

  it('1. Debe renderizar correctamente las propiedades (props) del producto en el DOM', () => {
    render(<ProductCard producto={mockProducto} onAddToCart={mockOnAddToCart} />);

    const nombreEl = container.querySelector('[data-testid="product-name"]');
    const precioEl = container.querySelector('[data-testid="product-price"]');
    const codigoEl = container.querySelector('[data-testid="product-code"]');
    const categoriaEl = container.querySelector('[data-testid="badge-categoria"]');
    const atributoEl = container.querySelector('[data-testid="product-attribute"]');

    expect(nombreEl).not.toBeNull();
    expect(nombreEl.textContent.trim()).toBe('Manzanas Fuji');
    expect(precioEl.textContent).toContain('1.200');
    expect(codigoEl.textContent.trim()).toBe('FR001');
    expect(categoriaEl.textContent.trim()).toBe('Frutas Frescas');
    expect(atributoEl.textContent).toContain('Valle del Maule');
  });

  it('2. Debe gestionar el estado interno de cantidad al hacer clic en los botones + y -', () => {
    render(<ProductCard producto={mockProducto} onAddToCart={mockOnAddToCart} />);

    const qtyInput = container.querySelector('[data-testid="quantity-input"]');
    const btnIncrement = container.querySelector('[data-testid="btn-increment"]');
    const btnDecrement = container.querySelector('[data-testid="btn-decrement"]');

    // Valor inicial del estado es 1
    expect(qtyInput.value).toBe('1');

    // Incrementar a 2
    fireClick(btnIncrement);
    expect(qtyInput.value).toBe('2');

    // Incrementar a 3
    fireClick(btnIncrement);
    expect(qtyInput.value).toBe('3');

    // Decrementar a 2
    fireClick(btnDecrement);
    expect(qtyInput.value).toBe('2');

    // Decrementar a 1
    fireClick(btnDecrement);
    expect(qtyInput.value).toBe('1');

    // Intento de decrementar menor a 1 (no debe bajar de 1)
    fireClick(btnDecrement);
    expect(qtyInput.value).toBe('1');
  });

  it('3. Debe respetar el límite de stock máximo del producto', () => {
    render(<ProductCard producto={mockProducto} onAddToCart={mockOnAddToCart} />);

    const qtyInput = container.querySelector('[data-testid="quantity-input"]');
    const btnIncrement = container.querySelector('[data-testid="btn-increment"]');

    // Stock máximo es 5
    for (let i = 0; i < 10; i++) {
      fireClick(btnIncrement);
    }

    expect(Number(qtyInput.value)).toBe(5);
    expect(btnIncrement.disabled).toBe(true);
  });

  it('4. Debe invocar el spy onAddToCart con el producto y la cantidad seleccionada', () => {
    render(<ProductCard producto={mockProducto} onAddToCart={mockOnAddToCart} />);

    const btnIncrement = container.querySelector('[data-testid="btn-increment"]');
    const btnAdd = container.querySelector('[data-testid="btn-add-cart"]');

    // Seleccionar 3 unidades
    fireClick(btnIncrement);
    fireClick(btnIncrement);

    // Click en Agregar
    fireClick(btnAdd);

    expect(mockOnAddToCart).toHaveBeenCalledTimes(1);
    expect(mockOnAddToCart).toHaveBeenCalledWith(mockProducto, 3);
  });

  it('5. Debe manipular el DOM mostrando un mensaje de feedback tras agregar el producto', () => {
    render(<ProductCard producto={mockProducto} onAddToCart={mockOnAddToCart} />);

    const btnAdd = container.querySelector('[data-testid="btn-add-cart"]');
    fireClick(btnAdd);

    const feedbackEl = container.querySelector('[data-testid="feedback-message"]');
    expect(feedbackEl).not.toBeNull();
    expect(feedbackEl.textContent).toContain('unidad agregada');
  });
});

