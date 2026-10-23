import React from 'react';
import AdminProducts from '../src/components/AdminProducts.jsx';
import { setupTestContainer, cleanupTestContainer, render, fireClick, fireChange, fireSubmit } from './test-utils.js';

describe('Componente AdminProducts (CRUD Completo de Productos con Jasmine & Karma)', () => {
  let container;
  let mockProductos;
  let mockOnAddProduct;
  let mockOnUpdateProduct;
  let mockOnDeleteProduct;
  let mockOnResetDefaults;
  let mockOnExitAdmin;

  beforeEach(() => {
    container = setupTestContainer();

    mockProductos = [
      {
        codigo: 'FR001',
        nombre: 'Manzanas Fuji',
        categoria: 'Frutas Frescas',
        precio: 1200,
        unidad: 'kilo',
        stock: 150,
        atributo: 'Valle del Maule',
        descripcion: 'Manzanas Fuji crujientes y dulces.',
        imagen: 'assets/img/manzanas.svg'
      },
      {
        codigo: 'VR001',
        nombre: 'Zanahorias Orgánicas',
        categoria: 'Verduras Orgánicas',
        precio: 900,
        unidad: 'kilo',
        stock: 8,
        atributo: "Región de O'Higgins",
        descripcion: 'Zanahorias frescas sin pesticidas.',
        imagen: 'assets/img/zanahorias.svg'
      }
    ];

    mockOnAddProduct = jasmine.createSpy('onAddProduct');
    mockOnUpdateProduct = jasmine.createSpy('onUpdateProduct');
    mockOnDeleteProduct = jasmine.createSpy('onDeleteProduct');
    mockOnResetDefaults = jasmine.createSpy('onResetDefaults');
    mockOnExitAdmin = jasmine.createSpy('onExitAdmin');
  });

  afterEach(() => {
    cleanupTestContainer();
  });

  it('1. [READ] Debe renderizar la tabla con todos los productos registrados', () => {
    render(
      <AdminProducts 
        productos={mockProductos}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onDeleteProduct={mockOnDeleteProduct}
        onResetDefaults={mockOnResetDefaults}
        onExitAdmin={mockOnExitAdmin}
      />
    );

    const rowFR001 = container.querySelector('[data-testid="admin-row-FR001"]');
    const rowVR001 = container.querySelector('[data-testid="admin-row-VR001"]');

    expect(rowFR001).not.toBeNull();
    expect(rowFR001.textContent).toContain('Manzanas Fuji');
    expect(rowVR001).not.toBeNull();
    expect(rowVR001.textContent).toContain('Zanahorias Orgánicas');
  });

  it('2. [CREATE - Validación] Debe exigir campos obligatorios y mostrar errores en el DOM', () => {
    render(
      <AdminProducts 
        productos={mockProductos}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onDeleteProduct={mockOnDeleteProduct}
        onResetDefaults={mockOnResetDefaults}
        onExitAdmin={mockOnExitAdmin}
      />
    );

    const form = container.querySelector('[data-testid="admin-product-form"]');
    fireSubmit(form);

    expect(mockOnAddProduct).not.toHaveBeenCalled();

    const errCodigo = container.querySelector('[data-testid="error-codigo"]');
    const errNombre = container.querySelector('[data-testid="error-nombre"]');
    const errPrecio = container.querySelector('[data-testid="error-precio"]');

    expect(errCodigo).not.toBeNull();
    expect(errNombre).not.toBeNull();
    expect(errPrecio).not.toBeNull();
  });

  it('3. [CREATE - Validación] Debe rechazar códigos duplicados', () => {
    render(
      <AdminProducts 
        productos={mockProductos}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onDeleteProduct={mockOnDeleteProduct}
        onResetDefaults={mockOnResetDefaults}
        onExitAdmin={mockOnExitAdmin}
      />
    );

    const inputCodigo = container.querySelector('[data-testid="input-codigo"]');
    const form = container.querySelector('[data-testid="admin-product-form"]');

    fireChange(inputCodigo, 'FR001'); // FR001 ya existe
    fireSubmit(form);

    const errCodigo = container.querySelector('[data-testid="error-codigo"]');
    expect(errCodigo).not.toBeNull();
    expect(errCodigo.textContent).toContain('ya existe');
    expect(mockOnAddProduct).not.toHaveBeenCalled();
  });

  it('4. [CREATE - Éxito] Debe crear un nuevo producto e invocar onAddProduct con sus datos', () => {
    render(
      <AdminProducts 
        productos={mockProductos}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onDeleteProduct={mockOnDeleteProduct}
        onResetDefaults={mockOnResetDefaults}
        onExitAdmin={mockOnExitAdmin}
      />
    );

    const inputCodigo = container.querySelector('[data-testid="input-codigo"]');
    const inputNombre = container.querySelector('[data-testid="input-nombre"]');
    const inputPrecio = container.querySelector('[data-testid="input-precio"]');
    const inputStock = container.querySelector('[data-testid="input-stock"]');
    const inputAtributo = container.querySelector('[data-testid="input-atributo"]');
    const inputDesc = container.querySelector('[data-testid="input-descripcion"]');
    const form = container.querySelector('[data-testid="admin-product-form"]');

    fireChange(inputCodigo, 'FR004');
    fireChange(inputNombre, 'Frutillas Silvestres');
    fireChange(inputPrecio, '2500');
    fireChange(inputStock, '40');
    fireChange(inputAtributo, 'San Pedro de Melipilla');
    fireChange(inputDesc, 'Frutillas dulces cosechadas al amanecer.');

    fireSubmit(form);

    expect(mockOnAddProduct).toHaveBeenCalledTimes(1);
    const nuevo = mockOnAddProduct.calls.mostRecent().args[0];
    expect(nuevo.codigo).toBe('FR004');
    expect(nuevo.nombre).toBe('Frutillas Silvestres');
    expect(nuevo.precio).toBe(2500);
    expect(nuevo.stock).toBe(40);
  });

  it('5. [UPDATE] Debe precargar el formulario al pulsar Editar y guardar con onUpdateProduct', () => {
    render(
      <AdminProducts 
        productos={mockProductos}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onDeleteProduct={mockOnDeleteProduct}
        onResetDefaults={mockOnResetDefaults}
        onExitAdmin={mockOnExitAdmin}
      />
    );

    // Pulsar Editar en FR001
    const btnEditFR001 = container.querySelector('[data-testid="btn-edit-FR001"]');
    fireClick(btnEditFR001);

    const inputNombre = container.querySelector('[data-testid="input-nombre"]');
    const inputPrecio = container.querySelector('[data-testid="input-precio"]');
    const form = container.querySelector('[data-testid="admin-product-form"]');

    // Comprobar que los campos se precargaron
    expect(inputNombre.value).toBe('Manzanas Fuji');
    expect(inputPrecio.value).toBe('1200');

    // Modificar precio a 1400
    fireChange(inputPrecio, '1400');
    fireSubmit(form);

    expect(mockOnUpdateProduct).toHaveBeenCalledTimes(1);
    const actualizado = mockOnUpdateProduct.calls.mostRecent().args[0];
    expect(actualizado.codigo).toBe('FR001');
    expect(actualizado.precio).toBe(1400);
  });

  it('6. [DELETE] Debe solicitar confirmación y ejecutar onDeleteProduct con el código correspondiente', () => {
    spyOn(window, 'confirm').and.returnValue(true);

    render(
      <AdminProducts 
        productos={mockProductos}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onDeleteProduct={mockOnDeleteProduct}
        onResetDefaults={mockOnResetDefaults}
        onExitAdmin={mockOnExitAdmin}
      />
    );

    const btnDeleteVR001 = container.querySelector('[data-testid="btn-delete-VR001"]');
    fireClick(btnDeleteVR001);

    expect(window.confirm).toHaveBeenCalled();
    expect(mockOnDeleteProduct).toHaveBeenCalledWith('VR001');
  });

  it('7. [FILTER / SEARCH] Debe filtrar reactivamente las filas de la tabla por texto', () => {
    render(
      <AdminProducts 
        productos={mockProductos}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onDeleteProduct={mockOnDeleteProduct}
        onResetDefaults={mockOnResetDefaults}
        onExitAdmin={mockOnExitAdmin}
      />
    );

    const searchInput = container.querySelector('[data-testid="search-admin-input"]');
    fireChange(searchInput, 'Zanahorias');

    const rowFR001 = container.querySelector('[data-testid="admin-row-FR001"]');
    const rowVR001 = container.querySelector('[data-testid="admin-row-VR001"]');

    expect(rowVR001).not.toBeNull();
    expect(rowFR001).toBeNull(); // Se ocultó por filtro
  });

  it('8. Debe invocar onResetDefaults al pulsar Restablecer Catálogo', () => {
    render(
      <AdminProducts 
        productos={mockProductos}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onDeleteProduct={mockOnDeleteProduct}
        onResetDefaults={mockOnResetDefaults}
        onExitAdmin={mockOnExitAdmin}
      />
    );

    const btnReset = container.querySelector('[data-testid="btn-reset-defaults"]');
    fireClick(btnReset);

    expect(mockOnResetDefaults).toHaveBeenCalledTimes(1);
  });
});

