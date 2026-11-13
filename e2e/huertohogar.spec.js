import { test, expect } from '@playwright/test';
import fs from 'node:fs';

const API_USUARIOS = process.env.VITE_API_USUARIOS_URL || 'http://3.134.140.248:8081/api';
const API_PRODUCTOS = process.env.VITE_API_PRODUCTOS_URL || 'http://3.134.140.248:8083/api/products';

test.describe('HuertoHogar E2E — Integración Frontend + Backend EC2', () => {
  test('1. Carga catálogo real desde la API, abre detalle e incrementa visualizaciones', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('nav-catalogo').click();

    const grid = page.getByTestId('products-grid');
    await expect(grid).toBeVisible({ timeout: 15000 });

    const fr001Card = page.getByTestId('product-card-FR001');
    await expect(fr001Card).toBeVisible();

    await fr001Card.getByTestId('product-name').click();

    const detail = page.getByTestId('product-detail-view');
    await expect(detail).toBeVisible();
    await expect(detail.getByTestId('detail-product-name')).toContainText('Manzanas Fuji');

    const viewsBadge = detail.getByTestId('detail-product-views');
    await expect(viewsBadge).toBeVisible();
    await expect(viewsBadge).toContainText('visualizaciones');
  });

  test('2. Rutas protegidas (#admin): bloquea sin sesión (401) y a CLIENTE (403)', async ({ page }) => {
    await page.goto('/#admin');
    await expect(page.getByTestId('protected-route-unauth')).toBeVisible({ timeout: 10000 });

    await page.getByTestId('nav-login').click();
    await page.getByTestId('input-email').fill('cliente@huertohogar.cl');
    await page.getByTestId('input-password').fill('Password123*');
    await page.getByTestId('btn-login-submit').click();

    await expect(page.getByTestId('user-greeting')).toBeVisible({ timeout: 10000 });
    await page.goto('/#admin');
    await page.reload();
    await expect(page.getByTestId('protected-route-forbidden')).toBeVisible({ timeout: 10000 });
  });

  test('3. Flujo VENDEDOR: validación V Región, creación real en MySQL, estadísticas y descarga CSV', async ({ page, request }) => {
    const uniqueCode = `E2E${Date.now().toString().slice(-4)}`;

    await page.goto('/');
    await page.getByTestId('nav-login').click();
    await page.getByTestId('input-email').fill('vendedor@huertohogar.cl');
    await page.getByTestId('input-password').fill('Vendedor123*');
    await page.getByTestId('btn-login-submit').click();

    const navVendedor = page.getByTestId('nav-vendedor');
    await expect(navVendedor).toBeVisible({ timeout: 10000 });
    await navVendedor.click();

    await expect(page.getByTestId('admin-panel')).toBeVisible();
    await expect(page.getByTestId('tab-usuarios')).toHaveCount(0);
    await expect(page.getByTestId('tab-categorias')).toHaveCount(0);

    // Intento inválido fuera de la 5ª Región
    await page.getByTestId('input-codigo').fill(uniqueCode);
    await page.getByTestId('input-nombre').fill('Chirimoya E2E');
    await page.getByTestId('input-precio').fill('3200');
    await page.getByTestId('input-unidad').fill('Kilo');
    await page.getByTestId('input-stock').fill('25');
    await page.getByTestId('input-atributo').fill('Santiago, Región Metropolitana');
    await page.getByTestId('input-descripcion').fill('Prueba E2E fuera de V Región');
    await page.getByTestId('btn-submit-product').click();

    await expect(page.getByTestId('error-atributo')).toBeVisible();

    // Intento válido en la 5ª Región (Quillota)
    await page.getByTestId('input-atributo').fill('Origen: Quillota, Región de Valparaíso');
    await page.getByTestId('btn-submit-product').click();

    await expect(page.getByTestId('admin-alert')).toBeVisible({ timeout: 10000 });
    await expect(page.getByTestId(`admin-row-${uniqueCode}`)).toBeVisible({ timeout: 10000 });

    // Estadísticas de ventas y visualizaciones + descarga CSV detallada
    await page.getByTestId('tab-ventas').click();
    await expect(page.getByTestId('stat-visualizaciones')).toBeVisible();
    await expect(page.getByTestId('detailed-product-stats-table')).toBeVisible();

    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('btn-download-stats-csv').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');

    const filePath = await download.path();
    const csvContent = fs.readFileSync(filePath, 'utf8');
    expect(csvContent).toContain('RESUMEN EJECUTIVO');
    expect(csvContent).toContain('Visualizaciones Totales de Productos');
    expect(csvContent).toContain(uniqueCode);

    // Limpieza del producto de prueba usando endpoint ADMIN para mantener limpia la BD
    const loginRes = await request.post(`${API_USUARIOS}/auth/login`, {
      data: { email: 'admin@huertohogar.cl', password: 'Admin123*' },
    });
    if (loginRes.ok()) {
      const { token } = await loginRes.json();
      await request.delete(`${API_PRODUCTOS}/${uniqueCode}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  });

  test('4. Carrito: agrega producto real y verifica cantidad y subtotal', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('product-card-FR001')).toBeVisible({ timeout: 15000 });

    await page.getByTestId('product-card-FR001').getByTestId('btn-add-cart').click();
    await expect(page.getByTestId('cart-badge')).toHaveText('1');

    await page.getByTestId('nav-carrito').click();
    await expect(page.getByTestId('cart-row-FR001')).toBeVisible();
  });

  test('5. Registro de nuevo VENDEDOR con región Valparaíso y comuna Quillota', async ({ page, request }) => {
    const uniqueEmail = `e2e_vendedor_${Date.now()}@huertohogar.cl`;

    await page.goto('/');
    await page.getByTestId('nav-registro').click();

    await page.getByTestId('input-nombre').fill('Vendedor E2E');
    await page.getByTestId('input-email').fill(uniqueEmail);
    await page.getByTestId('input-password').fill('Password123*');
    await page.getByTestId('input-confirm-password').fill('Password123*');
    await page.getByTestId('select-register-rol').selectOption('VENDEDOR');
    await page.getByTestId('select-region').selectOption('Región de Valparaíso');
    await page.getByTestId('select-comuna').selectOption('Quillota');
    await page.getByTestId('input-direccion').fill('Camino Troncal 123');
    await page.getByTestId('check-terminos').check();
    await page.getByTestId('btn-register-submit').click();

    await expect(page.getByTestId('register-success')).toBeVisible({ timeout: 10000 });

    // Limpieza del usuario de prueba
    const loginRes = await request.post(`${API_USUARIOS}/auth/login`, {
      data: { email: 'admin@huertohogar.cl', password: 'Admin123*' },
    });
    if (loginRes.ok()) {
      const { token } = await loginRes.json();
      const usersRes = await request.get(`${API_USUARIOS}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (usersRes.ok()) {
        const users = await usersRes.json();
        const created = users.find((u) => u.email === uniqueEmail);
        if (created?.id) {
          await request.delete(`${API_USUARIOS}/users/${created.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }
    }
  });
});
