import React, { useState } from 'react';
import { REGIONES_CHILE } from '../data/regiones.js';
import { registrarUsuario, obtenerMensajeError } from '../services/api.js';

/**
 * Componente RegisterForm
 *
 * Registra nuevos usuarios CLIENTE contra el microservicio de usuarios.
 */
export default function RegisterForm({ onRegisterSuccess, onSwitchToLogin, onRegister }) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
    rol: 'cliente',
    region: '',
    comuna: '',
    direccion: '',
    terminos: false
  });

  const [errors, setErrors] = useState({});
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorServidor, setErrorServidor] = useState('');
  const [cargando, setCargando] = useState(false);

  // Lista reactiva de comunas según la región elegida
  const comunasDisponibles = formData.region && REGIONES_CHILE[formData.region] 
    ? REGIONES_CHILE[formData.region] 
    : [];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };
      if (name === 'region') {
        updated.comuna = '';
      }
      return updated;
    });

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    if (errorServidor) {
      setErrorServidor('');
    }
  };

  const validar = () => {
    const nuevosErrores = {};

    if (!formData.nombre.trim() || formData.nombre.trim().length < 3) {
      nuevosErrores.nombre = 'El nombre debe tener al menos 3 caracteres.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      nuevosErrores.email = 'Ingresa un formato de correo válido (ej: usuario@correo.cl).';
    }

    if (!formData.password || formData.password.length < 6) {
      nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (formData.password !== formData.confirmPassword) {
      nuevosErrores.confirmPassword = 'Las contraseñas no coinciden.';
    }

    if (!formData.region) {
      nuevosErrores.region = 'Debes seleccionar una región.';
    }

    if (!formData.comuna) {
      nuevosErrores.comuna = 'Debes seleccionar una comuna.';
    }

    if (!formData.terminos) {
      nuevosErrores.terminos = 'Debes aceptar los términos y condiciones.';
    }

    setErrors(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorServidor('');
    if (!validar()) {
      return;
    }

    const rolElegido = (formData.rol || 'CLIENTE').toUpperCase() === 'VENDEDOR' ? 'VENDEDOR' : 'CLIENTE';
    const nuevoUsuario = {
      nombre: formData.nombre.trim(),
      email: formData.email.trim(),
      password: formData.password,
      region: formData.region,
      comuna: formData.comuna,
      direccion: formData.direccion.trim(),
      role: rolElegido,
      rol: rolElegido
    };

    try {
      setCargando(true);
      const registerFn = onRegister || registrarUsuario;
      const resultado = await registerFn(nuevoUsuario);
      const usuarioCreado = resultado?.user || resultado;
      setMensajeExito('¡Registro exitoso! Cuenta guardada en la base de datos.');
      setTimeout(() => {
        if (onRegisterSuccess) {
          onRegisterSuccess(usuarioCreado, resultado?.token || '');
        }
      }, 600);
    } catch (err) {
      setErrorServidor(obtenerMensajeError(err, 'Error al registrar el usuario en el servidor.'));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="container my-5" data-testid="register-container">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <i className="bi bi-person-lines-fill fs-1 text-success d-block mb-2"></i>
                <h2 className="h4 fw-bold text-dark">Crear Cuenta en HuertoHogar</h2>
                <p className="text-muted small">Únete a nuestra comunidad de alimentación consciente</p>
              </div>

              {mensajeExito && (
                <div className="alert alert-success py-2 small mb-3 text-center" role="alert" data-testid="register-success">
                  {mensajeExito}
                </div>
              )}

              {errorServidor && (
                <div className="alert alert-danger py-2 small mb-3 text-center" role="alert" data-testid="register-server-error">
                  {errorServidor}
                </div>
              )}

              <form onSubmit={handleSubmit} data-testid="register-form" noValidate>
                <div className="row g-3">
                  {/* Nombre completo */}
                  <div className="col-12 col-md-6">
                    <label htmlFor="regNombre" className="form-label small fw-semibold text-secondary">
                      Nombre Completo *
                    </label>
                    <input 
                      type="text" 
                      id="regNombre"
                      name="nombre"
                      className={`form-control ${errors.nombre ? 'is-invalid' : ''}`}
                      placeholder="Ej: Juan Pérez"
                      value={formData.nombre}
                      onChange={handleChange}
                      data-testid="input-nombre"
                    />
                    {errors.nombre && <div className="invalid-feedback" data-testid="error-nombre">{errors.nombre}</div>}
                  </div>

                  {/* Correo */}
                  <div className="col-12 col-md-6">
                    <label htmlFor="regEmail" className="form-label small fw-semibold text-secondary">
                      Correo Electrónico *
                    </label>
                    <input 
                      type="email" 
                      id="regEmail"
                      name="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      placeholder="juan@correo.cl"
                      value={formData.email}
                      onChange={handleChange}
                      data-testid="input-email"
                    />
                    {errors.email && <div className="invalid-feedback" data-testid="error-email">{errors.email}</div>}
                  </div>

                  {/* Contraseña */}
                  <div className="col-12 col-md-6">
                    <label htmlFor="regPassword" className="form-label small fw-semibold text-secondary">
                      Contraseña *
                    </label>
                    <input 
                      type="password" 
                      id="regPassword"
                      name="password"
                      className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      placeholder="Mínimo 6 caracteres"
                      value={formData.password}
                      onChange={handleChange}
                      data-testid="input-password"
                    />
                    {errors.password && <div className="invalid-feedback" data-testid="error-password">{errors.password}</div>}
                  </div>

                  {/* Confirmar contraseña */}
                  <div className="col-12 col-md-6">
                    <label htmlFor="regConfirmPassword" className="form-label small fw-semibold text-secondary">
                      Confirmar Contraseña *
                    </label>
                    <input 
                      type="password" 
                      id="regConfirmPassword"
                      name="confirmPassword"
                      className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                      placeholder="Repite tu contraseña"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      data-testid="input-confirm-password"
                    />
                    {errors.confirmPassword && <div className="invalid-feedback" data-testid="error-confirm-password">{errors.confirmPassword}</div>}
                  </div>

                  <div className="col-12">
                    <label htmlFor="regRol" className="form-label small fw-semibold text-secondary">
                      Tipo de Cuenta *
                    </label>
                    <select
                      id="regRol"
                      name="rol"
                      className="form-select"
                      value={(formData.rol || 'CLIENTE').toUpperCase()}
                      onChange={handleChange}
                      data-testid="select-register-rol"
                    >
                      <option value="CLIENTE">Usuario Común (CLIENTE - Comprar productos)</option>
                      <option value="VENDEDOR">Vendedor / Productor V Región (VENDEDOR - Publicar frutas y ver estadísticas)</option>
                    </select>
                    <div className="form-text small text-muted">
                      Nota: Las cuentas de Administrador solo pueden ser asignadas por un Administrador interno.
                    </div>
                  </div>

                  {/* Select Región */}
                  <div className="col-12 col-md-6">
                    <label htmlFor="regRegion" className="form-label small fw-semibold text-secondary">
                      Región *
                    </label>
                    <select 
                      id="regRegion"
                      name="region"
                      className={`form-select ${errors.region ? 'is-invalid' : ''}`}
                      value={formData.region}
                      onChange={handleChange}
                      data-testid="select-region"
                    >
                      <option value="">-- Selecciona tu región --</option>
                      {Object.keys(REGIONES_CHILE).map(region => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                    {errors.region && <div className="invalid-feedback" data-testid="error-region">{errors.region}</div>}
                  </div>

                  {/* Select Comuna dependiente */}
                  <div className="col-12 col-md-6">
                    <label htmlFor="regComuna" className="form-label small fw-semibold text-secondary">
                      Comuna *
                    </label>
                    <select 
                      id="regComuna"
                      name="comuna"
                      className={`form-select ${errors.comuna ? 'is-invalid' : ''}`}
                      value={formData.comuna}
                      onChange={handleChange}
                      disabled={!formData.region}
                      data-testid="select-comuna"
                    >
                      <option value="">{formData.region ? '-- Selecciona tu comuna --' : '-- Primero elige región --'}</option>
                      {comunasDisponibles.map(comuna => (
                        <option key={comuna} value={comuna}>{comuna}</option>
                      ))}
                    </select>
                    {errors.comuna && <div className="invalid-feedback" data-testid="error-comuna">{errors.comuna}</div>}
                  </div>

                  {/* Dirección */}
                  <div className="col-12">
                    <label htmlFor="regDireccion" className="form-label small fw-semibold text-secondary">
                      Dirección de Despacho (Calle, Número, Depto)
                    </label>
                    <input 
                      type="text" 
                      id="regDireccion"
                      name="direccion"
                      className="form-control"
                      placeholder="Ej: Av. Providencia 1234, Dpto 502"
                      value={formData.direccion}
                      onChange={handleChange}
                      data-testid="input-direccion"
                    />
                  </div>

                  {/* Términos y condiciones */}
                  <div className="col-12">
                    <div className="form-check">
                      <input 
                        type="checkbox" 
                        id="regTerminos"
                        name="terminos"
                        className={`form-check-input ${errors.terminos ? 'is-invalid' : ''}`}
                        checked={formData.terminos}
                        onChange={handleChange}
                        data-testid="check-terminos"
                      />
                      <label htmlFor="regTerminos" className="form-check-label small text-muted">
                        Acepto los términos del servicio y políticas de privacidad de HuertoHogar.
                      </label>
                      {errors.terminos && <div className="invalid-feedback d-block" data-testid="error-terminos">{errors.terminos}</div>}
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-success w-100 py-2 fw-semibold shadow-sm mt-4 mb-3"
                  disabled={cargando}
                  data-testid="btn-register-submit"
                >
                  {cargando ? 'Registrando en el servidor...' : 'Registrarse en HuertoHogar'}
                </button>
              </form>

              <div className="text-center pt-3 border-top">
                <span className="small text-muted me-2">¿Ya tienes cuenta?</span>
                <button 
                  className="btn btn-link btn-sm text-success p-0 fw-semibold text-decoration-none"
                  onClick={onSwitchToLogin}
                  data-testid="link-login"
                >
                  Inicia sesión aquí
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
