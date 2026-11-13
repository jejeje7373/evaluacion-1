import React from 'react';
import RegisterForm from '../src/components/RegisterForm.jsx';
import { setupTestContainer, cleanupTestContainer, render, fireClick, fireChange, fireSubmit } from './test-utils.js';

describe('Componente RegisterForm (Pruebas Unitarias de Registro con Backend)', () => {
  let container;
  let mockOnRegister;
  let mockOnRegisterSuccess;
  let mockOnSwitchToLogin;

  beforeEach(() => {
    container = setupTestContainer();
    mockOnRegister = jasmine.createSpy('onRegister').and.callFake((nuevo) =>
      Promise.resolve({ user: { id: 10, ...nuevo, role: 'CLIENTE', rol: 'CLIENTE' }, token: 'jwt-reg-123' })
    );
    mockOnRegisterSuccess = jasmine.createSpy('onRegisterSuccess');
    mockOnSwitchToLogin = jasmine.createSpy('onSwitchToLogin');
  });

  afterEach(() => {
    cleanupTestContainer();
  });

  it('1. Debe renderizar los campos principales del formulario de registro', () => {
    render(<RegisterForm onRegister={mockOnRegister} onRegisterSuccess={mockOnRegisterSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);

    expect(container.querySelector('[data-testid="input-nombre"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="input-email"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="input-password"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="input-confirm-password"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="select-region"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="select-comuna"]')).not.toBeNull();
  });

  it('2. Debe actualizar dinámicamente las comunas en el DOM al seleccionar una región', () => {
    render(<RegisterForm onRegister={mockOnRegister} onRegisterSuccess={mockOnRegisterSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);

    const selectRegion = container.querySelector('[data-testid="select-region"]');
    const selectComuna = container.querySelector('[data-testid="select-comuna"]');

    expect(selectComuna.disabled).toBe(true);
    fireChange(selectRegion, 'Región de Valparaíso');

    expect(selectComuna.disabled).toBe(false);
    const opcionesComuna = Array.from(selectComuna.querySelectorAll('option')).map(o => o.value);
    expect(opcionesComuna).toContain('Viña del Mar');
    expect(opcionesComuna).toContain('Valparaíso');
    expect(opcionesComuna).not.toContain('Santiago');
  });

  it('3. Debe mostrar error en el DOM si las contraseñas no coinciden', () => {
    render(<RegisterForm onRegister={mockOnRegister} onRegisterSuccess={mockOnRegisterSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);

    fireChange(container.querySelector('[data-testid="input-nombre"]'), 'Rodrigo Muñoz');
    fireChange(container.querySelector('[data-testid="input-email"]'), 'rodrigo@campo.cl');
    fireChange(container.querySelector('[data-testid="input-password"]'), 'Huerto123*');
    fireChange(container.querySelector('[data-testid="input-confirm-password"]'), 'HuertoDiferente456*');
    fireChange(container.querySelector('[data-testid="select-region"]'), 'Región Metropolitana');
    fireChange(container.querySelector('[data-testid="select-comuna"]'), 'Santiago');
    fireChange(container.querySelector('[data-testid="check-terminos"]'), true);

    fireSubmit(container.querySelector('[data-testid="register-form"]'));

    const errorConfirm = container.querySelector('[data-testid="error-confirm-password"]');
    expect(errorConfirm).not.toBeNull();
    expect(errorConfirm.textContent).toContain('Las contraseñas no coinciden');
    expect(mockOnRegister).not.toHaveBeenCalled();
  });

  it('4. Debe exigir la aceptación de términos y condiciones', () => {
    render(<RegisterForm onRegister={mockOnRegister} onRegisterSuccess={mockOnRegisterSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);

    fireChange(container.querySelector('[data-testid="input-nombre"]'), 'Rodrigo Muñoz');
    fireChange(container.querySelector('[data-testid="input-email"]'), 'rodrigo@campo.cl');
    fireChange(container.querySelector('[data-testid="input-password"]'), 'Huerto123*');
    fireChange(container.querySelector('[data-testid="input-confirm-password"]'), 'Huerto123*');
    fireChange(container.querySelector('[data-testid="select-region"]'), 'Región Metropolitana');
    fireChange(container.querySelector('[data-testid="select-comuna"]'), 'Santiago');

    fireSubmit(container.querySelector('[data-testid="register-form"]'));

    const errorTerminos = container.querySelector('[data-testid="error-terminos"]');
    expect(errorTerminos).not.toBeNull();
    expect(errorTerminos.textContent).toContain('Debes aceptar los términos');
    expect(mockOnRegister).not.toHaveBeenCalled();
  });

  it('5. Debe invocar el servicio backend con rol CLIENTE (sin localStorage) y disparar onRegisterSuccess', async () => {
    render(<RegisterForm onRegister={mockOnRegister} onRegisterSuccess={mockOnRegisterSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);

    fireChange(container.querySelector('[data-testid="input-nombre"]'), 'Ignacia Silva');
    fireChange(container.querySelector('[data-testid="input-email"]'), 'ignacia@huertohogar.cl');
    fireChange(container.querySelector('[data-testid="input-password"]'), 'MiClaveSegura2026*');
    fireChange(container.querySelector('[data-testid="input-confirm-password"]'), 'MiClaveSegura2026*');
    fireChange(container.querySelector('[data-testid="select-region"]'), 'Región del Biobío');
    fireChange(container.querySelector('[data-testid="select-comuna"]'), 'Concepción');
    fireChange(container.querySelector('[data-testid="check-terminos"]'), true);

    fireSubmit(container.querySelector('[data-testid="register-form"]'));
    await new Promise(r => setTimeout(r, 700));

    expect(mockOnRegister).toHaveBeenCalledWith(jasmine.objectContaining({
      email: 'ignacia@huertohogar.cl',
      role: 'CLIENTE',
      rol: 'CLIENTE'
    }));
    const exitoAlert = container.querySelector('[data-testid="register-success"]');
    expect(exitoAlert).not.toBeNull();
    expect(mockOnRegisterSuccess).toHaveBeenCalledTimes(1);
  });

  it('6. Debe mostrar error del servidor en el DOM si el correo ya está registrado (HTTP 400)', async () => {
    mockOnRegister.and.rejectWith({ response: { status: 400, data: { error: 'El email ya existe' } } });
    render(<RegisterForm onRegister={mockOnRegister} onRegisterSuccess={mockOnRegisterSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);

    fireChange(container.querySelector('[data-testid="input-nombre"]'), 'Ignacia Silva');
    fireChange(container.querySelector('[data-testid="input-email"]'), 'duplicado@huertohogar.cl');
    fireChange(container.querySelector('[data-testid="input-password"]'), 'MiClaveSegura2026*');
    fireChange(container.querySelector('[data-testid="input-confirm-password"]'), 'MiClaveSegura2026*');
    fireChange(container.querySelector('[data-testid="select-region"]'), 'Región Metropolitana');
    fireChange(container.querySelector('[data-testid="select-comuna"]'), 'Santiago');
    fireChange(container.querySelector('[data-testid="check-terminos"]'), true);

    fireSubmit(container.querySelector('[data-testid="register-form"]'));
    await new Promise(r => setTimeout(r, 30));

    const serverErr = container.querySelector('[data-testid="register-server-error"]');
    expect(serverErr).not.toBeNull();
    expect(serverErr.textContent).toContain('El email ya existe');
    expect(mockOnRegisterSuccess).not.toHaveBeenCalled();
  });

  it('7. Debe permitir registrar un nuevo usuario con rol VENDEDOR desde el selector de cuenta', async () => {
    render(<RegisterForm onRegister={mockOnRegister} onRegisterSuccess={mockOnRegisterSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);

    fireChange(container.querySelector('[data-testid="input-nombre"]'), 'Pedro Agricultor');
    fireChange(container.querySelector('[data-testid="input-email"]'), 'pedro.quillota@huertohogar.cl');
    fireChange(container.querySelector('[data-testid="input-password"]'), 'Vendedor2026*');
    fireChange(container.querySelector('[data-testid="input-confirm-password"]'), 'Vendedor2026*');
    fireChange(container.querySelector('[data-testid="select-register-rol"]'), 'VENDEDOR');
    fireChange(container.querySelector('[data-testid="select-region"]'), 'Región de Valparaíso');
    fireChange(container.querySelector('[data-testid="select-comuna"]'), 'Quillota');
    fireChange(container.querySelector('[data-testid="check-terminos"]'), true);

    fireSubmit(container.querySelector('[data-testid="register-form"]'));
    await new Promise(r => setTimeout(r, 700));

    expect(mockOnRegister).toHaveBeenCalledWith(jasmine.objectContaining({
      email: 'pedro.quillota@huertohogar.cl',
      role: 'VENDEDOR',
      rol: 'VENDEDOR'
    }));
  });
});
