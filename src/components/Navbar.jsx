import React, { useState } from 'react';

/**
 * Componente Navbar de HuertoHogar
 * 
 * Props:
 * - activeView: Vista actual seleccionada ('catalogo', 'carrito', 'login', 'registro')
 * - setActiveView: Función callback para cambiar de vista
 * - cartCount: Número total de unidades en el carrito (para el badge dinámico)
 * - currentUser: Datos del usuario autenticado (o null si es invitado)
 * - onLogout: Función para cerrar sesión
 * 
 * Estado:
 * - isNavCollapsed: Controla el colapso del menú en dispositivos móviles (responsive)
 */
export default function Navbar({ activeView, setActiveView, cartCount = 0, currentUser = null, onLogout }) {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const handleToggle = () => setIsNavCollapsed(!isNavCollapsed);
  const handleNavClick = (view) => {
    setActiveView(view);
    setIsNavCollapsed(true);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success sticky-top shadow-sm" data-testid="navbar">
      <div className="container">
        {/* Logotipo y Marca */}
        <button 
          className="navbar-brand d-flex align-items-center btn btn-link text-white text-decoration-none p-0" 
          onClick={() => handleNavClick('catalogo')}
          data-testid="brand-button"
        >
          <i className="bi bi-tree-fill fs-4 me-2"></i>
          <span className="fw-bold tracking-wide">HuertoHogar</span>
        </button>

        {/* Botón Toggler para pantallas móviles (<992px) */}
        <button 
          className="navbar-toggler" 
          type="button" 
          onClick={handleToggle}
          aria-controls="navbarHuerto" 
          aria-expanded={!isNavCollapsed} 
          aria-label="Alternar navegación"
          data-testid="navbar-toggler"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Enlaces de navegación colapsables */}
        <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`} id="navbarHuerto">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <button 
                className={`nav-link btn btn-link text-start text-white ${activeView === 'catalogo' ? 'active fw-bold text-decoration-underline' : ''}`}
                onClick={() => handleNavClick('catalogo')}
                data-testid="nav-catalogo"
              >
                <i className="bi bi-grid-fill me-1"></i> Catálogo
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link btn btn-link text-start text-white position-relative ${activeView === 'carrito' ? 'active fw-bold text-decoration-underline' : ''}`}
                onClick={() => handleNavClick('carrito')}
                data-testid="nav-carrito"
              >
                <i className="bi bi-cart-fill me-1"></i> Carrito
                <span className="badge bg-warning text-dark ms-2 rounded-pill" data-testid="cart-badge">
                  {cartCount}
                </span>
              </button>
            </li>
            {/* Enlace al Panel Admin exclusivo para administradores */}
            {currentUser?.rol === 'admin' && (
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link text-start text-white ${activeView === 'admin' ? 'active fw-bold text-decoration-underline' : ''}`}
                  onClick={() => handleNavClick('admin')}
                  data-testid="nav-admin"
                >
                  <i className="bi bi-gear-fill me-1"></i> Panel Admin
                </button>
              </li>
            )}
          </ul>

          {/* Sección de autenticación de usuario en Navbar */}
          <div className="d-flex align-items-center gap-2">
            {currentUser ? (
              <div className="d-flex align-items-center gap-2 text-white">
                <span className="small" data-testid="user-greeting">
                  <i className="bi bi-person-circle me-1"></i>
                  Hola, <strong>{currentUser.nombre || currentUser.email}</strong>
                </span>
                <button 
                  className="btn btn-outline-light btn-sm"
                  onClick={onLogout}
                  data-testid="logout-button"
                >
                  <i className="bi bi-box-arrow-right me-1"></i> Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="btn-group" role="group">
                <button 
                  className={`btn btn-sm ${activeView === 'login' ? 'btn-light' : 'btn-outline-light'}`}
                  onClick={() => handleNavClick('login')}
                  data-testid="nav-login"
                >
                  <i className="bi bi-person-fill me-1"></i> Iniciar Sesión
                </button>
                <button 
                  className={`btn btn-sm ${activeView === 'registro' ? 'btn-light' : 'btn-outline-light'}`}
                  onClick={() => handleNavClick('registro')}
                  data-testid="nav-registro"
                >
                  <i className="bi bi-person-plus-fill me-1"></i> Registro
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
