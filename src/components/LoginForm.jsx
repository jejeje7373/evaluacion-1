import React, { useState } from 'react';

/**
 * Componente LoginForm
 * 
 * Responsividad Bootstrap:
 * - Centrado en pantalla con row justify-content-center
 * - col-12 en móviles, col-md-8 en tablets y col-lg-5 en escritorio
 * 
 * Props:
 * - onLoginSuccess: Callback invocado con los datos del usuario logueado
 * - onSwitchToRegister: Callback para cambiar a la vista de registro
 * 
 * Estado:
 * - email: Campo de correo electrónico
 * - password: Campo de contraseña
 * - error: Mensaje de error de validación o credenciales incorrectas
 */
export default function LoginForm({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
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

    // Intentar verificar en localStorage (usuarios registrados)
    let usuariosGuardados = [];
    try {
      usuariosGuardados = JSON.parse(localStorage.getItem('huertohogar_usuarios') || '[]');
    } catch {
      usuariosGuardados = [];
    }

    // Cuentas del sistema preconfiguradas
    const usuariosSistema = [
      {
        nombre: 'Catalina Gómez',
        email: 'cliente@huertohogar.cl',
        password: 'Password123*',
        rol: 'cliente',
        region: 'Región Metropolitana',
        comuna: 'Santiago'
      },
      {
        nombre: 'Administrador HuertoHogar',
        email: 'admin@huertohogar.cl',
        password: 'Admin123*',
        rol: 'admin',
        region: 'Región Metropolitana',
        comuna: 'Santiago'
      }
    ];

    const usuarioEncontrado = usuariosGuardados.find(
      u => u.email.toLowerCase() === emailTrim.toLowerCase() && u.password === password
    ) || usuariosSistema.find(
      u => u.email.toLowerCase() === emailTrim.toLowerCase() && u.password === password
    );

    if (usuarioEncontrado) {
      if (onLoginSuccess) {
        onLoginSuccess(usuarioEncontrado);
      }
    } else {
      setError('Credenciales inválidas. Verifica tu correo y contraseña.');
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
                  data-testid="btn-login-submit"
                >
                  Ingresar a HuertoHogar
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
                <div><i className="bi bi-person-fill text-primary me-1"></i><strong>Cliente:</strong> <code>cliente@huertohogar.cl</code> / <code>Password123*</code></div>
                <div className="mt-1"><i className="bi bi-gear-fill text-success me-1"></i><strong>Admin:</strong> <code>admin@huertohogar.cl</code> / <code>Admin123*</code></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

