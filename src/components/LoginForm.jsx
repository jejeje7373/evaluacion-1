import React, { useState } from 'react';
import { loginUsuario, obtenerMensajeError } from '../services/api.js';

/**
 * Componente LoginForm
 *
 * Autentica al usuario contra el microservicio de usuarios vía backend/JWT.
 */
export default function LoginForm({ onLoginSuccess, onSwitchToRegister, onAuthenticate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const emailTrim = email.trim();
    if (!emailTrim || !password) {
      setError('Por favor ingresa tu correo y tu contraseña.');
      return;
    }

    // Validación básica de formato de correo
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrim)) {
      setError('El formato de correo electrónico no es válido.');
      return;
    }

    try {
      setCargando(true);
      const authFn = onAuthenticate || loginUsuario;
      const resultado = await authFn(emailTrim, password);
      const usuarioAutenticado = resultado?.user || resultado;
      if (onLoginSuccess) {
        onLoginSuccess(usuarioAutenticado, resultado?.token || '');
      }
    } catch (err) {
      setError(obtenerMensajeError(err, 'Credenciales inválidas. Verifica tu correo y contraseña.'));
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="container my-5" data-testid="login-container">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4">
                <i className="bi bi-shield-lock-fill fs-1 text-success d-block mb-2"></i>
                <h2 className="h4 fw-bold text-dark">Iniciar Sesión</h2>
                <p className="text-muted small">Accede a tu cuenta de HuertoHogar</p>
              </div>

              {error && (
                <div className="alert alert-danger py-2 small mb-3" role="alert" data-testid="login-error">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} data-testid="login-form">
                <div className="mb-3">
                  <label htmlFor="loginEmail" className="form-label small fw-semibold text-secondary">
                    Correo Electrónico
                  </label>
                  <input 
                    type="email" 
                    className="form-control" 
                    id="loginEmail"
                    placeholder="ejemplo@correo.cl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    data-testid="input-email"
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="loginPassword" className="form-label small fw-semibold text-secondary">
                    Contraseña
                  </label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="loginPassword"
                    placeholder="Tu contraseña secreta"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    data-testid="input-password"
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-success w-100 py-2 fw-semibold shadow-sm mb-3"
                  disabled={cargando}
                  data-testid="btn-login-submit"
                >
                  {cargando ? 'Verificando con el servidor...' : 'Ingresar a HuertoHogar'}
                </button>
              </form>

              <div className="text-center pt-3 border-top">
                <span className="small text-muted me-2">¿Aún no tienes cuenta?</span>
                <button 
                  className="btn btn-link btn-sm text-success p-0 fw-semibold text-decoration-none"
                  onClick={onSwitchToRegister}
                  data-testid="link-register"
                >
                  Regístrate aquí
                </button>
              </div>

              <div className="bg-light p-3 rounded mt-3 text-center small text-muted">
                <i className="bi bi-shield-check text-success me-1"></i>
                Autenticación verificada mediante Spring Security, BCrypt y JWT.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
