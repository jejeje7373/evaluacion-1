import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import ProductList from './components/ProductList.jsx';
import Cart from './components/Cart.jsx';
import LoginForm from './components/LoginForm.jsx';
import RegisterForm from './components/RegisterForm.jsx';
import AdminProducts from './components/AdminProducts.jsx';
import Footer from './components/Footer.jsx';
import { CATALOGO_PRODUCTOS } from './data/products.js';

export default function App() {
  const [activeView, setActiveView] = useState('catalogo');

  // Estado del catálogo con persistencia en localStorage
  const [productos, setProductos] = useState(() => {
    try {
      const saved = localStorage.getItem('huertohogar_productos');
      return saved ? JSON.parse(saved) : CATALOGO_PRODUCTOS;
    } catch {
      return CATALOGO_PRODUCTOS;
    }
  });

  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('huertohogar_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('huertohogar_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [toastNotification, setToastNotification] = useState('');

  // Sincronizar catálogo con localStorage
  useEffect(() => {
    try {
      localStorage.setItem('huertohogar_productos', JSON.stringify(productos));
    } catch {
      // Ignorar error de cuota
    }
  }, [productos]);

  // Sincronizar carrito con localStorage
  useEffect(() => {
    try {
      localStorage.setItem('huertohogar_cart', JSON.stringify(cartItems));
    } catch {
      // Ignorar
    }
  }, [cartItems]);

  // Sincronizar sesión con localStorage
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('huertohogar_session', JSON.stringify(currentUser));
      } else {
        localStorage.removeItem('huertohogar_session');
      }
    } catch {
      // Ignorar
    }
  }, [currentUser]);

  const showToast = (msg) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(''), 3000);
  };

  // --- OPERACIONES CRUD DE PRODUCTOS (ADMIN) ---
  const handleAddProduct = (nuevoProducto) => {
    setProductos(prev => [nuevoProducto, ...prev]);
    showToast(`Producto "${nuevoProducto.nombre}" creado exitosamente.`);
  };

  const handleUpdateProduct = (productoActualizado) => {
    setProductos(prev => prev.map(p => p.codigo === productoActualizado.codigo ? productoActualizado : p));
    // Si el producto estaba en el carrito, actualizar sus datos
    setCartItems(prev => prev.map(item => item.codigo === productoActualizado.codigo 
      ? { ...item, nombre: productoActualizado.nombre, precio: productoActualizado.precio, unidad: productoActualizado.unidad }
      : item
    ));
    showToast(`Producto "${productoActualizado.nombre}" actualizado.`);
  };

  const handleDeleteProduct = (codigo) => {
    setProductos(prev => prev.filter(p => p.codigo !== codigo));
    setCartItems(prev => prev.filter(item => item.codigo !== codigo));
    showToast('Producto eliminado del catálogo.');
  };

  const handleResetDefaults = () => {
    setProductos(CATALOGO_PRODUCTOS);
    showToast('Catálogo restablecido a los 8 productos maestros.');
  };

  // --- OPERACIONES DEL CARRITO ---
  const handleAddToCart = (producto, cantidad = 1) => {
    setCartItems(prev => {
      const index = prev.findIndex(item => item.codigo === producto.codigo);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          cantidad: updated[index].cantidad + cantidad
        };
        return updated;
      } else {
        return [...prev, { ...producto, cantidad }];
      }
    });
    showToast(`"${producto.nombre}" agregado al carrito.`);
  };

  const handleUpdateQuantity = (codigo, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      handleRemoveItem(codigo);
      return;
    }
    setCartItems(prev => prev.map(item => item.codigo === codigo ? { ...item, cantidad: nuevaCantidad } : item));
  };

  const handleRemoveItem = (codigo) => {
    setCartItems(prev => prev.filter(item => item.codigo !== codigo));
    showToast('Producto removido del carrito.');
  };

  const handleClearCart = () => {
    setCartItems([]);
    showToast('Carrito vaciado.');
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.rol === 'admin') {
      setActiveView('admin');
      showToast(`¡Bienvenido Administrador(a) ${user.nombre}!`);
    } else {
      setActiveView('catalogo');
      showToast(`¡Bienvenido(a), ${user.nombre || user.email}!`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveView('catalogo');
    showToast('Has cerrado sesión exitosamente.');
  };

  const handleRegisterSuccess = (newUser) => {
    setCurrentUser(newUser);
    setActiveView('catalogo');
    showToast(`¡Cuenta creada con éxito! Bienvenido(a) ${newUser.nombre}.`);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <div className="d-flex flex-column min-vh-100 bg-white" data-testid="app-root">
      {/* Toast flotante de notificación */}
      {toastNotification && (
        <div 
          className="position-fixed bottom-0 end-0 p-3" 
          style={{ zIndex: 1100 }}
          data-testid="global-toast"
        >
          <div className="toast show align-items-center text-bg-success border-0 shadow" role="alert">
            <div className="d-flex">
              <div className="toast-body">
                <i className="bi bi-check-circle-fill me-2"></i>
                {toastNotification}
              </div>
              <button 
                type="button" 
                className="btn-close btn-close-white me-2 m-auto" 
                onClick={() => setToastNotification('')}
              ></button>
            </div>
          </div>
        </div>
      )}

      {/* Barra de navegación responsiva */}
      <Navbar 
        activeView={activeView}
        setActiveView={setActiveView}
        cartCount={totalCartCount}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Vistas según navegación activa */}
      <main className="flex-grow-1">
        {activeView === 'catalogo' && (
          <>
            <Hero onExplore={() => {
              const el = document.getElementById('catalogo-anchor');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }} />
            <div id="catalogo-anchor">
              <ProductList 
                productos={productos} 
                onAddToCart={handleAddToCart}
              />
            </div>
          </>
        )}

        {activeView === 'admin' && (
          currentUser?.rol === 'admin' ? (
            <AdminProducts 
              productos={productos}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onResetDefaults={handleResetDefaults}
              onExitAdmin={() => setActiveView('catalogo')}
            />
          ) : (
            <div className="container my-5 text-center">
              <div className="alert alert-warning py-4 shadow-sm">
                <h4 className="fw-bold">Acceso Restringido</h4>
                <p className="mb-3 text-muted">Debes iniciar sesión con una cuenta de Administrador para acceder a este panel.</p>
                <button className="btn btn-success" onClick={() => setActiveView('login')}>
                  Ir a Iniciar Sesión
                </button>
              </div>
            </div>
          )
        )}

        {activeView === 'carrito' && (
          <Cart 
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onContinueShopping={() => setActiveView('catalogo')}
          />
        )}

        {activeView === 'login' && (
          <LoginForm 
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setActiveView('registro')}
          />
        )}

        {activeView === 'registro' && (
          <RegisterForm 
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => setActiveView('login')}
          />
        )}
      </main>

      {/* Pie de página institucional */}
      <Footer />
    </div>
  );
}
