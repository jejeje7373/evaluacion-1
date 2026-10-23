import React from 'react';
import Navbar from '../src/components/Navbar.jsx';
import { setupTestContainer, cleanupTestContainer, render, fireClick } from './test-utils.js';

describe('Componente Navbar (Pruebas Unitarias de Navegación, Sesión y Badges)', () => {
  let container;
  let mockSetActiveView;
  let mockOnLogout;

  beforeEach(() => {
    container = setupTestContainer();
    mockSetActiveView = jasmine.createSpy('setActiveView');
    mockOnLogout = jasmine.createSpy('onLogout');
  });

  afterEach(() => {
    cleanupTestContainer();
  });

  it('1. Debe renderizar el badge del carrito con el contador correcto de ítems', () => {
    render(
      <Navbar 
        activeView="catalogo"
        setActiveView={mockSetActiveView}
        cartCount={7}
        currentUser={null}
        onLogout={mockOnLogout}
      />
    );

    const badge = container.querySelector('[data-testid="cart-badge"]');
    expect(badge).not.toBeNull();
    expect(badge.textContent.trim()).toBe('7');
  });

  it('2. Debe mostrar botones de Iniciar Sesión y Registro cuando el usuario es invitado (currentUser null)', () => {
    render(
      <Navbar 
        activeView="catalogo"
        setActiveView={mockSetActiveView}
        cartCount={0}
        currentUser={null}
        onLogout={mockOnLogout}
      />
    );

    const btnLogin = container.querySelector('[data-testid="nav-login"]');
    const btnRegistro = container.querySelector('[data-testid="nav-registro"]');
    const greeting = container.querySelector('[data-testid="user-greeting"]');

    expect(btnLogin).not.toBeNull();
    expect(btnRegistro).not.toBeNull();
    expect(greeting).toBeNull();
  });

  it('3. Debe mostrar saludo personalizado y botón de Cerrar Sesión cuando hay un usuario autenticado', () => {
    const usuarioActivo = {
      nombre: 'Felipe Valenzuela',
      email: 'felipe@huertohogar.cl'
    };

    render(
      <Navbar 
        activeView="catalogo"
        setActiveView={mockSetActiveView}
        cartCount={3}
        currentUser={usuarioActivo}
        onLogout={mockOnLogout}
      />
    );

    const greeting = container.querySelector('[data-testid="user-greeting"]');
    const btnLogout = container.querySelector('[data-testid="logout-button"]');
    const btnLogin = container.querySelector('[data-testid="nav-login"]');

    expect(greeting).not.toBeNull();
    expect(greeting.textContent).toContain('Felipe Valenzuela');
    expect(btnLogout).not.toBeNull();
    expect(btnLogin).toBeNull();
  });

  it('4. Debe invocar el spy onLogout al pulsar el botón de Cerrar Sesión', () => {
    const usuarioActivo = { nombre: 'Felipe Valenzuela' };

    render(
      <Navbar 
        activeView="catalogo"
        setActiveView={mockSetActiveView}
        cartCount={0}
        currentUser={usuarioActivo}
        onLogout={mockOnLogout}
      />
    );

    const btnLogout = container.querySelector('[data-testid="logout-button"]');
    fireClick(btnLogout);

    expect(mockOnLogout).toHaveBeenCalledTimes(1);
  });

  it('5. Debe invocar setActiveView con la vista correspondiente al hacer clic en los enlaces', () => {
    render(
      <Navbar 
        activeView="catalogo"
        setActiveView={mockSetActiveView}
        cartCount={2}
        currentUser={null}
        onLogout={mockOnLogout}
      />
    );

    const navCarrito = container.querySelector('[data-testid="nav-carrito"]');
    fireClick(navCarrito);
    expect(mockSetActiveView).toHaveBeenCalledWith('carrito');

    const brandBtn = container.querySelector('[data-testid="brand-button"]');
    fireClick(brandBtn);
    expect(mockSetActiveView).toHaveBeenCalledWith('catalogo');
  });

  it('6. Debe alternar la clase collapse al hacer clic en el botón toggler para móviles', () => {
    render(
      <Navbar 
        activeView="catalogo"
        setActiveView={mockSetActiveView}
        cartCount={0}
        currentUser={null}
        onLogout={mockOnLogout}
      />
    );

    const collapseDiv = container.querySelector('#navbarHuerto');
    const togglerBtn = container.querySelector('[data-testid="navbar-toggler"]');

    // Inicialmente colapsado
    expect(collapseDiv.classList.contains('collapse')).toBe(true);

    // Click para expandir en móvil
    fireClick(togglerBtn);
    expect(collapseDiv.classList.contains('collapse')).toBe(false);

    // Click para volver a colapsar
    fireClick(togglerBtn);
    expect(collapseDiv.classList.contains('collapse')).toBe(true);
  });

  it('7. Debe mostrar el botón de Panel Admin EXCLUSIVAMENTE cuando el usuario tiene rol admin', () => {
    // 1. Caso invitado: No debe existir
    render(
      <Navbar 
        activeView="catalogo"
        setActiveView={mockSetActiveView}
        cartCount={0}
        currentUser={null}
        onLogout={mockOnLogout}
      />
    );
    expect(container.querySelector('[data-testid="nav-admin"]')).toBeNull();

    // 2. Caso cliente normal: No debe existir
    render(
      <Navbar 
        activeView="catalogo"
        setActiveView={mockSetActiveView}
        cartCount={0}
        currentUser={{ nombre: 'Cliente', rol: 'cliente' }}
        onLogout={mockOnLogout}
      />
    );
    expect(container.querySelector('[data-testid="nav-admin"]')).toBeNull();

    // 3. Caso Administrador: Sí debe aparecer
    render(
      <Navbar 
        activeView="catalogo"
        setActiveView={mockSetActiveView}
        cartCount={0}
        currentUser={{ nombre: 'Admin Huerto', rol: 'admin' }}
        onLogout={mockOnLogout}
      />
    );
    const navAdmin = container.querySelector('[data-testid="nav-admin"]');
    expect(navAdmin).not.toBeNull();
    fireClick(navAdmin);
    expect(mockSetActiveView).toHaveBeenCalledWith('admin');
  });
});
