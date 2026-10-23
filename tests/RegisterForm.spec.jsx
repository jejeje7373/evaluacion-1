import React from 'react';
import RegisterForm from '../src/components/RegisterForm.jsx';
import { setupTestContainer, cleanupTestContainer, render, fireClick, fireChange, fireSubmit } from './test-utils.js';

describe('Componente RegisterForm (Pruebas Unitarias de Formulario y Select Dependiente)', () => {
  let container;
  let mockOnRegisterSuccess;
  let mockOnSwitchToLogin;

  beforeEach(() => {
    container = setupTestContainer();
    mockOnRegisterSuccess = jasmine.createSpy('onRegisterSuccess');
    mockOnSwitchToLogin = jasmine.createSpy('onSwitchToLogin');
    localStorage.clear();
  });

  afterEach(() => {
    cleanupTestContainer();
    localStorage.clear();
  });

  it('1. Debe renderizar los campos principales del formulario de registro', () => {
    render(<RegisterForm onRegisterSuccess={mockOnRegisterSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);

    expect(container.querySelector('[data-testid="input-nombre"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="input-email"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="input-password"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="input-confirm-password"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="select-region"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="select-comuna"]')).not.toBeNull();
  });

  it('2. Debe actualizar dinámicamente las comunas en el DOM al seleccionar una región (Select dependiente)', () => {
    render(<RegisterForm onRegisterSuccess={mockOnRegisterSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);

    const selectRegion = container.querySelector('[data-testid="select-region"]');
    const selectComuna = container.querySelector('[data-testid="select-comuna"]');

    // Inicialmente el select de comuna está deshabilitado sin región
    expect(selectComuna.disabled).toBe(true);

    // Seleccionar 'Región de Valparaíso'
    fireChange(selectRegion, 'Región de Valparaíso');

    // Ahora debe estar habilitado y contener Viña del Mar, Valparaíso, etc.
    expect(selectComuna.disabled).toBe(false);
    const opcionesComuna = Array.from(selectComuna.querySelectorAll('option')).map(o => o.value);
    expect(opcionesComuna).toContain('Viña del Mar');
    expect(opcionesComuna).toContain('Valparaíso');
    expect(opcionesComuna).not.toContain('Santiago'); // Santiago es de RM
  });

  it('3. Debe mostrar error en el DOM si las contraseñas no coinciden', () => {
    render(<RegisterForm onRegisterSuccess={mockOnRegisterSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);

    const inputNombre = container.querySelector('[data-testid="input-nombre"]');
    const inputEmail = container.querySelector('[data-testid="input-email"]');
    const inputPassword = container.querySelector('[data-testid="input-password"]');
    const inputConfirm = container.querySelector('[data-testid="input-confirm-password"]');
    const selectRegion = container.querySelector('[data-testid="select-region"]');
    const selectComuna = container.querySelector('[data-testid="select-comuna"]');
    const checkTerminos = container.querySelector('[data-testid="check-terminos"]');
    const form = container.querySelector('[data-testid="register-form"]');

    fireChange(inputNombre, 'Rodrigo Muñoz');
    fireChange(inputEmail, 'rodrigo@campo.cl');
    fireChange(inputPassword, 'Huerto123*');
    fireChange(inputConfirm, 'HuertoDiferente456*');
    fireChange(selectRegion, 'Región Metropolitana');
    fireChange(selectComuna, 'Santiago');
    fireChange(checkTerminos, true);

    fireSubmit(form);

    const errorConfirm = container.querySelector('[data-testid="error-confirm-password"]');
    expect(errorConfirm).not.toBeNull();
    expect(errorConfirm.textContent).toContain('Las contraseñas no coinciden');
    expect(mockOnRegisterSuccess).not.toHaveBeenCalled();
  });

  it('4. Debe exigir la aceptación de términos y condiciones', () => {
    render(<RegisterForm onRegisterSuccess={mockOnRegisterSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);

    const inputNombre = container.querySelector('[data-testid="input-nombre"]');
    const inputEmail = container.querySelector('[data-testid="input-email"]');
    const inputPassword = container.querySelector('[data-testid="input-password"]');
    const inputConfirm = container.querySelector('[data-testid="input-confirm-password"]');
    const selectRegion = container.querySelector('[data-testid="select-region"]');
    const selectComuna = container.querySelector('[data-testid="select-comuna"]');
    const form = container.querySelector('[data-testid="register-form"]');

    fireChange(inputNombre, 'Rodrigo Muñoz');
    fireChange(inputEmail, 'rodrigo@campo.cl');
    fireChange(inputPassword, 'Huerto123*');
    fireChange(inputConfirm, 'Huerto123*');
    fireChange(selectRegion, 'Región Metropolitana');
    fireChange(selectComuna, 'Santiago');
    // NO marcamos términos

    fireSubmit(form);

    const errorTerminos = container.querySelector('[data-testid="error-terminos"]');
    expect(errorTerminos).not.toBeNull();
    expect(errorTerminos.textContent).toContain('Debes aceptar los términos');
  });

  it('5. Debe persistir el usuario en localStorage y disparar onRegisterSuccess cuando los datos son válidos', (done) => {
    spyOn(localStorage, 'setItem').and.callThrough();

    render(<RegisterForm onRegisterSuccess={mockOnRegisterSuccess} onSwitchToLogin={mockOnSwitchToLogin} />);

    const inputNombre = container.querySelector('[data-testid="input-nombre"]');
    const inputEmail = container.querySelector('[data-testid="input-email"]');
    const inputPassword = container.querySelector('[data-testid="input-password"]');
    const inputConfirm = container.querySelector('[data-testid="input-confirm-password"]');
    const selectRegion = container.querySelector('[data-testid="select-region"]');
    const selectComuna = container.querySelector('[data-testid="select-comuna"]');
    const checkTerminos = container.querySelector('[data-testid="check-terminos"]');
    const form = container.querySelector('[data-testid="register-form"]');

    fireChange(inputNombre, 'Ignacia Silva');
    fireChange(inputEmail, 'ignacia@huertohogar.cl');
    fireChange(inputPassword, 'MiClaveSegura2026*');
    fireChange(inputConfirm, 'MiClaveSegura2026*');
    fireChange(selectRegion, 'Región del Biobío');
    fireChange(selectComuna, 'Concepción');
    fireChange(checkTerminos, true);

    fireSubmit(form);

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'huertohogar_usuarios',
      jasmine.any(String)
    );

    const exitoAlert = container.querySelector('[data-testid="register-success"]');
    expect(exitoAlert).not.toBeNull();
    expect(exitoAlert.textContent).toContain('¡Registro exitoso!');

    setTimeout(() => {
      expect(mockOnRegisterSuccess).toHaveBeenCalledTimes(1);
      done();
    }, 1600);
  });
});
