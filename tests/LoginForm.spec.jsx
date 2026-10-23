import React from 'react';
import LoginForm from '../src/components/LoginForm.jsx';
import { setupTestContainer, cleanupTestContainer, render, fireClick, fireChange, fireSubmit } from './test-utils.js';

describe('Componente LoginForm (Pruebas Unitarias de Autenticación y Validación)', () => {
  let container;
  let mockOnLoginSuccess;
  let mockOnSwitchToRegister;

  beforeEach(() => {
    container = setupTestContainer();
    mockOnLoginSuccess = jasmine.createSpy('onLoginSuccess');
    mockOnSwitchToRegister = jasmine.createSpy('onSwitchToRegister');
    localStorage.clear();
  });

  afterEach(() => {
    cleanupTestContainer();
    localStorage.clear();
  });

  it('1. Debe renderizar los campos de correo, contraseña y el botón de submit', () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} onSwitchToRegister={mockOnSwitchToRegister} />);

    const inputEmail = container.querySelector('[data-testid="input-email"]');
    const inputPassword = container.querySelector('[data-testid="input-password"]');
    const btnSubmit = container.querySelector('[data-testid="btn-login-submit"]');

    expect(inputEmail).not.toBeNull();
    expect(inputPassword).not.toBeNull();
    expect(btnSubmit).not.toBeNull();
  });

  it('2. Debe validar campos vacíos y manipular el DOM mostrando alerta de error', () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} onSwitchToRegister={mockOnSwitchToRegister} />);

    const form = container.querySelector('[data-testid="login-form"]');
    fireSubmit(form);

    expect(mockOnLoginSuccess).not.toHaveBeenCalled();

    const errorAlert = container.querySelector('[data-testid="login-error"]');
    expect(errorAlert).not.toBeNull();
    expect(errorAlert.textContent).toContain('Por favor ingresa tu correo y tu contraseña');
  });

  it('3. Debe rechazar formatos inválidos de correo electrónico', () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} onSwitchToRegister={mockOnSwitchToRegister} />);

    const inputEmail = container.querySelector('[data-testid="input-email"]');
    const inputPassword = container.querySelector('[data-testid="input-password"]');
    const form = container.querySelector('[data-testid="login-form"]');

    fireChange(inputEmail, 'correo-no-valido');
    fireChange(inputPassword, 'Password123*');
    fireSubmit(form);

    expect(mockOnLoginSuccess).not.toHaveBeenCalled();

    const errorAlert = container.querySelector('[data-testid="login-error"]');
    expect(errorAlert).not.toBeNull();
    expect(errorAlert.textContent).toContain('El formato de correo electrónico no es válido');
  });

  it('4. Debe autenticar correctamente al usuario demo y ejecutar el callback onLoginSuccess', () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} onSwitchToRegister={mockOnSwitchToRegister} />);

    const inputEmail = container.querySelector('[data-testid="input-email"]');
    const inputPassword = container.querySelector('[data-testid="input-password"]');
    const form = container.querySelector('[data-testid="login-form"]');

    fireChange(inputEmail, 'cliente@huertohogar.cl');
    fireChange(inputPassword, 'Password123*');
    fireSubmit(form);

    expect(mockOnLoginSuccess).toHaveBeenCalledTimes(1);
    const usuarioLlamado = mockOnLoginSuccess.calls.mostRecent().args[0];
    expect(usuarioLlamado.email).toBe('cliente@huertohogar.cl');
    expect(usuarioLlamado.nombre).toBe('Catalina Gómez');
  });

  it('5. Debe mostrar error en el DOM si las credenciales son incorrectas', () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} onSwitchToRegister={mockOnSwitchToRegister} />);

    const inputEmail = container.querySelector('[data-testid="input-email"]');
    const inputPassword = container.querySelector('[data-testid="input-password"]');
    const form = container.querySelector('[data-testid="login-form"]');

    fireChange(inputEmail, 'desconocido@huertohogar.cl');
    fireChange(inputPassword, 'claveErronea999');
    fireSubmit(form);

    expect(mockOnLoginSuccess).not.toHaveBeenCalled();

    const errorAlert = container.querySelector('[data-testid="login-error"]');
    expect(errorAlert).not.toBeNull();
    expect(errorAlert.textContent).toContain('Credenciales inválidas');
  });

  it('6. Debe llamar a onSwitchToRegister al hacer clic en el enlace de registro', () => {
    render(<LoginForm onLoginSuccess={mockOnLoginSuccess} onSwitchToRegister={mockOnSwitchToRegister} />);

    const linkRegister = container.querySelector('[data-testid="link-register"]');
    fireClick(linkRegister);

    expect(mockOnSwitchToRegister).toHaveBeenCalledTimes(1);
  });
});

