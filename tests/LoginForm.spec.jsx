import React from 'react';
import LoginForm from '../src/components/LoginForm.jsx';
import { setupTestContainer, cleanupTestContainer, render, fireClick, fireChange, fireSubmit } from './test-utils.js';

describe('Componente LoginForm (Pruebas Unitarias de Autenticación JWT y Validación)', () => {
  let container;
  let mockOnAuthenticate;
  let mockOnLoginSuccess;
  let mockOnSwitchToRegister;

  beforeEach(() => {
    container = setupTestContainer();
    mockOnAuthenticate = jasmine.createSpy('onAuthenticate');
    mockOnLoginSuccess = jasmine.createSpy('onLoginSuccess');
    mockOnSwitchToRegister = jasmine.createSpy('onSwitchToRegister');
  });

  afterEach(() => {
    cleanupTestContainer();
  });

  it('1. Debe renderizar los campos de correo, contraseña y el botón de submit sin credenciales quemadas', () => {
    render(
      <LoginForm
        onAuthenticate={mockOnAuthenticate}
        onLoginSuccess={mockOnLoginSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
      />
    );

    const inputEmail = container.querySelector('[data-testid="input-email"]');
    const inputPassword = container.querySelector('[data-testid="input-password"]');
    const btnSubmit = container.querySelector('[data-testid="btn-login-submit"]');

    expect(inputEmail).not.toBeNull();
    expect(inputPassword).not.toBeNull();
    expect(btnSubmit).not.toBeNull();
    expect(container.textContent).not.toContain('Admin123*');
    expect(container.textContent).not.toContain('Password123*');
  });

  it('2. Debe validar campos vacíos y mostrar alerta de error en el DOM', () => {
    render(
      <LoginForm
        onAuthenticate={mockOnAuthenticate}
        onLoginSuccess={mockOnLoginSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
      />
    );

    fireSubmit(container.querySelector('[data-testid="login-form"]'));

    expect(mockOnAuthenticate).not.toHaveBeenCalled();
    expect(mockOnLoginSuccess).not.toHaveBeenCalled();

    const errorAlert = container.querySelector('[data-testid="login-error"]');
    expect(errorAlert).not.toBeNull();
    expect(errorAlert.textContent).toContain('Por favor ingresa tu correo y tu contraseña');
  });

  it('3. Debe rechazar formatos inválidos de correo electrónico', () => {
    render(
      <LoginForm
        onAuthenticate={mockOnAuthenticate}
        onLoginSuccess={mockOnLoginSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
      />
    );

    fireChange(container.querySelector('[data-testid="input-email"]'), 'correo-no-valido');
    fireChange(container.querySelector('[data-testid="input-password"]'), 'ClaveSegura123');
    fireSubmit(container.querySelector('[data-testid="login-form"]'));

    expect(mockOnAuthenticate).not.toHaveBeenCalled();

    const errorAlert = container.querySelector('[data-testid="login-error"]');
    expect(errorAlert).not.toBeNull();
    expect(errorAlert.textContent).toContain('El formato de correo electrónico no es válido');
  });

  it('4. Debe autenticar contra el backend vía onAuthenticate y ejecutar onLoginSuccess con rol ADMIN', async () => {
    mockOnAuthenticate.and.resolveTo({
      token: 'jwt-admin-token',
      user: { id: 1, nombre: 'Administrador', email: 'admin@huertohogar.cl', rol: 'ADMIN', role: 'ADMIN' }
    });

    render(
      <LoginForm
        onAuthenticate={mockOnAuthenticate}
        onLoginSuccess={mockOnLoginSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
      />
    );

    fireChange(container.querySelector('[data-testid="input-email"]'), 'admin@huertohogar.cl');
    fireChange(container.querySelector('[data-testid="input-password"]'), 'ClaveAdmin');
    fireSubmit(container.querySelector('[data-testid="login-form"]'));
    await new Promise(r => setTimeout(r, 20));

    expect(mockOnAuthenticate).toHaveBeenCalledWith('admin@huertohogar.cl', 'ClaveAdmin');
    expect(mockOnLoginSuccess).toHaveBeenCalledTimes(1);
    const [usuarioLlamado, token] = mockOnLoginSuccess.calls.mostRecent().args;
    expect(usuarioLlamado.rol).toBe('ADMIN');
    expect(token).toBe('jwt-admin-token');
  });

  it('5. Debe mostrar error HTTP 401/403 del backend si las credenciales fallan o la cuenta está inactiva', async () => {
    mockOnAuthenticate.and.rejectWith({
      response: { status: 401, data: { error: 'Credenciales inválidas.' } }
    });

    render(
      <LoginForm
        onAuthenticate={mockOnAuthenticate}
        onLoginSuccess={mockOnLoginSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
      />
    );

    fireChange(container.querySelector('[data-testid="input-email"]'), 'desconocido@huertohogar.cl');
    fireChange(container.querySelector('[data-testid="input-password"]'), 'claveErronea999');
    fireSubmit(container.querySelector('[data-testid="login-form"]'));
    await new Promise(r => setTimeout(r, 20));

    expect(mockOnLoginSuccess).not.toHaveBeenCalled();

    const errorAlert = container.querySelector('[data-testid="login-error"]');
    expect(errorAlert).not.toBeNull();
    expect(errorAlert.textContent).toContain('Credenciales inválidas.');
  });

  it('6. Debe llamar a onSwitchToRegister al hacer clic en el enlace de registro', () => {
    render(
      <LoginForm
        onAuthenticate={mockOnAuthenticate}
        onLoginSuccess={mockOnLoginSuccess}
        onSwitchToRegister={mockOnSwitchToRegister}
      />
    );

    fireClick(container.querySelector('[data-testid="link-register"]'));
    expect(mockOnSwitchToRegister).toHaveBeenCalledTimes(1);
  });
});
