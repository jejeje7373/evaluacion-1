import React from 'react';
import AdminProducts from '../src/components/AdminProducts.jsx';
import { calcularEstadisticasDetalladas, generarCsvEstadisticasDetalladas } from '../src/utils/estadisticas.js';
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
    fireChange(inputAtributo, 'Quillota, V Región');
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

  it('9. [ROL CLIENTE] Debe permitir crear y editar usuarios con rol ADMIN o CLIENTE y cambiar su estado activo/inactivo', async () => {
    const mockOnAddUser = jasmine.createSpy('onAddUser').and.resolveTo({});
    const mockOnUpdateUser = jasmine.createSpy('onUpdateUser').and.resolveTo({});
    const mockOnToggleUserStatus = jasmine.createSpy('onToggleUserStatus').and.resolveTo({});
    const mockOnDeleteUser = jasmine.createSpy('onDeleteUser').and.resolveTo({});
    const mockUsuarios = [
      { id: 1, nombre: 'Catalina Cliente', email: 'cliente@huertohogar.cl', rol: 'CLIENTE', role: 'CLIENTE', activo: true, region: 'RM', comuna: 'Santiago' },
      { id: 2, nombre: 'Admin Existente', email: 'admin@huertohogar.cl', rol: 'ADMIN', role: 'ADMIN', activo: true, region: 'RM', comuna: 'Santiago' }
    ];

    render(
      <AdminProducts
        currentUser={{ nombre: 'Admin', rol: 'ADMIN' }}
        productos={mockProductos}
        usuarios={mockUsuarios}
        onAddUser={mockOnAddUser}
        onUpdateUser={mockOnUpdateUser}
        onToggleUserStatus={mockOnToggleUserStatus}
        onDeleteUser={mockOnDeleteUser}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onDeleteProduct={mockOnDeleteProduct}
        onResetDefaults={mockOnResetDefaults}
        onExitAdmin={mockOnExitAdmin}
      />
    );

    fireClick(container.querySelector('[data-testid="tab-usuarios"]'));

    // 1. Promover a ADMIN un usuario CLIENTE
    const btnPromoteCliente = container.querySelector('[data-testid="btn-grant-admin-1"]');
    expect(btnPromoteCliente).not.toBeNull();
    fireClick(btnPromoteCliente);
    await new Promise(r => setTimeout(r, 20));
    expect(mockOnUpdateUser).toHaveBeenCalledWith(1, jasmine.objectContaining({ rol: 'ADMIN', role: 'ADMIN' }));

    // 2. Desactivar usuario (PATCH estado)
    const btnToggle = container.querySelector('[data-testid="btn-toggle-user-status-1"]');
    expect(btnToggle).not.toBeNull();
    fireClick(btnToggle);
    await new Promise(r => setTimeout(r, 20));
    expect(mockOnToggleUserStatus).toHaveBeenCalledWith(1, false);

    // 3. Crear usuario ADMIN
    fireChange(container.querySelector('[data-testid="input-user-nombre"]'), 'Nuevo Admin');
    fireChange(container.querySelector('[data-testid="input-user-email"]'), 'nuevoadmin@huertohogar.cl');
    fireChange(container.querySelector('[data-testid="input-user-password"]'), 'AdminClave123*');
    fireChange(container.querySelector('[data-testid="select-user-role"]'), 'ADMIN');
    fireSubmit(container.querySelector('[data-testid="user-form"]'));
    await new Promise(r => setTimeout(r, 20));

    expect(mockOnAddUser).toHaveBeenCalledWith(jasmine.objectContaining({
      email: 'nuevoadmin@huertohogar.cl',
      rol: 'ADMIN',
      role: 'ADMIN'
    }));
  });

  it('10. [ESTADOS UI] Debe mostrar indicadores visuales de carga y error del servidor cuando las props estén activas', () => {
    render(
      <AdminProducts
        currentUser={{ nombre: 'Admin', rol: 'ADMIN' }}
        productos={mockProductos}
        cargandoAdmin={true}
        errorAdmin="Acceso denegado (403)"
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onDeleteProduct={mockOnDeleteProduct}
        onResetDefaults={mockOnResetDefaults}
        onExitAdmin={mockOnExitAdmin}
      />
    );

    expect(container.querySelector('[data-testid="admin-loading"]')).not.toBeNull();
    const errorEl = container.querySelector('[data-testid="admin-error"]');
    expect(errorEl).not.toBeNull();
    expect(errorEl.textContent).toContain('Acceso denegado (403)');
  });

  it('11. [VALIDACIÓN 5ª REGIÓN] Debe rechazar orígenes de otra región o país y pedir intentar de nuevo', () => {
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

    fireChange(container.querySelector('[data-testid="input-codigo"]'), 'FR009');
    fireChange(container.querySelector('[data-testid="input-nombre"]'), 'Paltas Hass');
    fireChange(container.querySelector('[data-testid="input-precio"]'), '3500');
    fireChange(container.querySelector('[data-testid="input-stock"]'), '50');
    fireChange(container.querySelector('[data-testid="input-atributo"]'), 'Mendoza, Argentina');
    fireChange(container.querySelector('[data-testid="input-descripcion"]'), 'Paltas cremosas.');

    fireSubmit(container.querySelector('[data-testid="admin-product-form"]'));

    expect(mockOnAddProduct).not.toHaveBeenCalled();
    const errAtributo = container.querySelector('[data-testid="error-atributo"]');
    expect(errAtributo).not.toBeNull();
    expect(errAtributo.textContent).toContain('Ubicación inválida');
    expect(errAtributo.textContent).toContain('Intente de nuevo');
  });

  it('12. [ROL VENDEDOR + VISUALIZACIONES] Debe mostrar visualizaciones totales, desglose por producto y ocultar usuarios', () => {
    const productosConVistas = [
      { ...mockProductos[0], atributo: 'San Felipe, V Región', visualizaciones: 120 },
      { ...mockProductos[1], atributo: 'Limache, V Región', visualizaciones: 80 }
    ];
    const mockOrdenes = [
      {
        id: 101,
        nombreCliente: 'Catalina Gómez',
        emailCliente: 'cliente@huertohogar.cl',
        total: 4800,
        estado: 'CONFIRMADA',
        detalles: [{ codigoProducto: 'FR001', nombreProducto: 'Manzanas Fuji', cantidad: 4, precioUnitario: 1200 }]
      }
    ];

    render(
      <AdminProducts
        currentUser={{ nombre: 'Matías Rojas', rol: 'VENDEDOR' }}
        productos={productosConVistas}
        ordenes={mockOrdenes}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onDeleteProduct={mockOnDeleteProduct}
        onResetDefaults={mockOnResetDefaults}
        onExitAdmin={mockOnExitAdmin}
      />
    );

    expect(container.querySelector('[data-testid="tab-productos"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="tab-ventas"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="tab-reportes"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="tab-usuarios"]')).toBeNull();

    // En la tabla de productos aparece badge de visualizaciones y no hay botón Borrar para VENDEDOR
    expect(container.querySelector('[data-testid="product-views-FR001"]').textContent).toContain('120');
    expect(container.querySelector('[data-testid="btn-delete-FR001"]')).toBeNull();

    // En Ventas y Estadísticas ve visualizaciones totales (200) y el desglose por producto
    fireClick(container.querySelector('[data-testid="tab-ventas"]'));
    expect(container.querySelector('[data-testid="stat-visualizaciones"]').textContent).toBe('200');
    expect(container.querySelector('[data-testid="stat-unidades"]').textContent).toBe('4');
    expect(container.querySelector('[data-testid="detailed-product-stats-table"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="stat-product-row-FR001"]').textContent).toContain('120');
  });

  it('13. [DESCARGA DETALLADA] Debe generar estadísticas detalladas en CSV con visualizaciones, ventas e historial', () => {
    const productosConVistas = [
      { ...mockProductos[0], atributo: 'Quillota, V Región', visualizaciones: 100 },
      { ...mockProductos[1], atributo: 'Olmué, V Región', visualizaciones: 50 }
    ];
    const mockOrdenes = [
      {
        id: 205,
        fecha: '2026-11-12T10:00:00',
        nombreCliente: 'Lucas Vera',
        emailCliente: 'lucas@correo.cl',
        comunaDestino: 'Viña del Mar',
        regionDestino: 'Región de Valparaíso',
        estado: 'CONFIRMADA',
        total: 6000,
        detalles: [{ codigoProducto: 'FR001', nombreProducto: 'Manzanas Fuji', cantidad: 5, precioUnitario: 1200 }]
      }
    ];

    const stats = calcularEstadisticasDetalladas({ productos: productosConVistas, ordenes: mockOrdenes });
    expect(stats.totalVisualizaciones).toBe(150);
    expect(stats.tasaConversionGlobal).toBe(3.33);

    const csv = generarCsvEstadisticasDetalladas(stats, 'Matías Vendedor');
    expect(csv).toContain('Visualizaciones Totales de Productos,150');
    expect(csv).toContain('Tasa de Conversion Global (%),3.33%');
    expect(csv).toContain('DETALLE POR PRODUCTO (VENTAS Y VISUALIZACIONES)');
    expect(csv).toContain('"FR001","Manzanas Fuji","Frutas Frescas","Quillota, V Región",1200,150,100,5,6000,5%');
    expect(csv).toContain('HH-000205');

    // Verificar trigger de descarga desde la UI
    spyOn(URL, 'createObjectURL').and.returnValue('blob:mock-stats');
    spyOn(URL, 'revokeObjectURL').and.stub();
    render(
      <AdminProducts
        currentUser={{ nombre: 'Matías Vendedor', rol: 'VENDEDOR' }}
        productos={productosConVistas}
        ordenes={mockOrdenes}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onDeleteProduct={mockOnDeleteProduct}
        onResetDefaults={mockOnResetDefaults}
        onExitAdmin={mockOnExitAdmin}
      />
    );
    fireClick(container.querySelector('[data-testid="tab-ventas"]'));
    fireClick(container.querySelector('[data-testid="btn-download-stats-csv"]'));
    expect(URL.createObjectURL).toHaveBeenCalled();
  });
});

