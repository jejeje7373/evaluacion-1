import React from 'react';
import App from '../src/App.jsx';
import { apiClient, clearAuthToken } from '../src/services/api.js';
import { setupTestContainer, cleanupTestContainer, render, fireClick } from './test-utils.js';

describe('Seguridad de Rutas e Integración Backend en App.jsx', () => {
  let container;

  beforeEach(() => {
    container = setupTestContainer();
    clearAuthToken();
    sessionStorage.clear();
  });

  afterEach(() => {
    clearAuthToken();
    sessionStorage.clear();
    cleanupTestContainer();
  });

  it('1. [RUTA PROTEGIDA] Debe bloquear el panel admin a usuarios sin sesión autenticada (401)', async () => {
    spyOn(apiClient, 'get').and.resolveTo({ data: [] });

    render(<App initialView="admin" initialUser={null} />);
    await new Promise(r => setTimeout(r, 20));

    expect(container.querySelector('[data-testid="protected-route-unauth"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="admin-panel"]')).toBeNull();
  });

  it('2. [RBAC CLIENTE] Debe denegar acceso al panel admin a un usuario con rol CLIENTE aunque navegue a #admin (403)', async () => {
    spyOn(apiClient, 'get').and.resolveTo({ data: [] });

    render(
      <App
        initialView="admin"
        initialUser={{ id: 2, nombre: 'Catalina Cliente', email: 'cliente@huertohogar.cl', rol: 'CLIENTE' }}
      />
    );
    await new Promise(r => setTimeout(r, 20));

    const forbidden = container.querySelector('[data-testid="protected-route-forbidden"]');
    expect(forbidden).not.toBeNull();
    expect(forbidden.textContent).toContain('403');
    expect(container.querySelector('[data-testid="admin-panel"]')).toBeNull();
  });

  it('3. [RBAC ADMIN] Debe permitir ingresar al panel admin y cargar datos desde la API para rol ADMIN', async () => {
    const getSpy = spyOn(apiClient, 'get').and.callFake((url) => {
      if (url.includes('/products')) {
        return Promise.resolve({ data: [{ codigo: 'FR001', nombre: 'Manzanas Fuji', categoria: 'Frutas Frescas', precio: 1200, unidad: 'kilo', stock: 20 }] });
      }
      if (url.includes('/dashboard')) {
        return Promise.resolve({ data: { totalIngresos: 10000, totalOrdenes: 2 } });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <App
        initialView="admin"
        initialUser={{ id: 1, nombre: 'Admin Principal', email: 'admin@huertohogar.cl', rol: 'ADMIN' }}
      />
    );
    await new Promise(r => setTimeout(r, 30));

    expect(container.querySelector('[data-testid="admin-panel"]')).not.toBeNull();
    expect(getSpy).toHaveBeenCalled();
  });

  it('4. [ESTADOS DE CARGA Y ERROR] Debe mostrar banner de error con botón Reintentar si falla la carga del catálogo', async () => {
    const getSpy = spyOn(apiClient, 'get').and.callFake((url) => {
      if (url.includes('/products')) {
        return Promise.reject({ response: { status: 503, data: { error: 'Microservicio de productos no disponible' } } });
      }
      return Promise.resolve({ data: [] });
    });

    render(<App initialView="catalogo" initialUser={null} />);
    await new Promise(r => setTimeout(r, 30));

    const banner = container.querySelector('[data-testid="catalog-error-banner"]');
    expect(banner).not.toBeNull();
    expect(banner.textContent).toContain('Microservicio de productos no disponible');

    // Al pulsar Reintentar vuelve a consultar la API
    getSpy.and.resolveTo({ data: [{ codigo: 'FR001', nombre: 'Manzanas Fuji', categoria: 'Frutas Frescas', precio: 1200, unidad: 'kilo', stock: 10 }] });
    fireClick(container.querySelector('[data-testid="btn-retry-catalog"]'));
    await new Promise(r => setTimeout(r, 30));

    expect(container.querySelector('[data-testid="catalog-error-banner"]')).toBeNull();
    expect(container.textContent).toContain('Manzanas Fuji');
  });

  it('5. [RBAC VENDEDOR] Debe permitir acceso a VENDEDOR para publicar frutas y ver estadísticas sin llamar a /users', async () => {
    const getSpy = spyOn(apiClient, 'get').and.callFake((url) => {
      if (url.includes('/products')) {
        return Promise.resolve({
          data: [{ codigo: 'FR001', nombre: 'Manzanas Fuji', categoria: 'Frutas Frescas', precio: 1200, unidad: 'kilo', stock: 20, visualizaciones: 85, atributo: 'Limache' }]
        });
      }
      if (url.includes('/dashboard')) {
        return Promise.resolve({ data: { totalIngresos: 4800, totalOrdenes: 1, totalUnidadesVendidas: 4, totalVisualizaciones: 85 } });
      }
      return Promise.resolve({ data: [] });
    });

    render(
      <App
        initialView="admin"
        initialUser={{ id: 3, nombre: 'Matías Vendedor', email: 'vendedor@huertohogar.cl', rol: 'VENDEDOR' }}
      />
    );
    await new Promise(r => setTimeout(r, 30));

    expect(container.querySelector('[data-testid="admin-panel"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="tab-usuarios"]')).toBeNull();
    expect(getSpy).not.toHaveBeenCalledWith('http://api.test/usuarios/api/users');
  });
});
