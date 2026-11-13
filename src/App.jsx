import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import GalleryHelix from './components/GalleryHelix.jsx';
import ProductList from './components/ProductList.jsx';
import ProductCard from './components/ProductCard.jsx';
import ProductDetail from './components/ProductDetail.jsx';
import GripIcon from './components/GripIcon.jsx';
import Cart from './components/Cart.jsx';
import LoginForm from './components/LoginForm.jsx';
import RegisterForm from './components/RegisterForm.jsx';
import AdminProducts from './components/AdminProducts.jsx';
import Footer from './components/Footer.jsx';
import OrchardBackground from './components/OrchardBackground.jsx';
import { CATEGORIAS } from './data/products.js';
import {
  ESTACIONES_TEMPORADA,
  obtenerEstacionActual,
  obtenerInfoEstacion,
  seleccionarProductosPorTemporada
} from './utils/temporada.js';
import {
  getAuthToken,
  clearAuthToken,
  setUnauthorizedHandler,
  obtenerMensajeError,
  normalizarUsuario,
  listarProductos,
  obtenerProductoPorCodigo,
  registrarVisualizacionProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  restaurarCatalogo,
  listarCategorias,
  crearCategoria,
  actualizarCategoria,
  eliminarCategoria,
  loginUsuario,
  registrarUsuario,
  obtenerUsuarioActual,
  logoutUsuario,
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  cambiarEstadoUsuario,
  eliminarUsuario,
  listarOrdenes,
  crearOrdenCheckout,
  actualizarEstadoOrden,
  eliminarOrden,
  listarReportes,
  obtenerDashboardReportes,
  crearReporte,
  actualizarReporte,
  eliminarReporte,
  listarReportesProductos,
  actualizarEstadoReporteProducto,
  eliminarReporteProducto
} from './services/api.js';

export default function App({ initialView = null, initialUser = null }) {
  const [activeView, setActiveView] = useState(() => {
    if (initialView) return initialView;
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash;
      if (hash.startsWith('#producto-')) return 'producto';
      if (['#inicio', '#catalogo', '#carrito', '#login', '#registro', '#admin'].includes(hash)) {
        return hash.replace('#', '');
      }
    }
    return 'inicio';
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openReportModal, setOpenReportModal] = useState(false);
  const [estacionSeleccionada, setEstacionSeleccionada] = useState(() => obtenerEstacionActual());
  const hasHandledInitialHashRef = useRef(false);

  // Estado del catálogo y módulos administrativos (sin datos quemados)
  const [productos, setProductos] = useState([]);
  const [cargandoCatalogo, setCargandoCatalogo] = useState(true);
  const [errorCatalogo, setErrorCatalogo] = useState('');

  const [categoriasObj, setCategoriasObj] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [reportes, setReportes] = useState([]);
  const [reportesProductos, setReportesProductos] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [cargandoAdmin, setCargandoAdmin] = useState(false);
  const [errorAdmin, setErrorAdmin] = useState('');

  // Estado de sesión JWT y carrito en memoria
  const [cartItems, setCartItems] = useState([]);
  const [currentUser, setCurrentUser] = useState(() => normalizarUsuario(initialUser));
  const [cargandoSesion, setCargandoSesion] = useState(() => Boolean(!initialUser && getAuthToken()));
  const [toastNotification, setToastNotification] = useState('');

  const showToast = useCallback((msg) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(''), 3500);
  }, []);

  const rolUpper = (currentUser?.rol || currentUser?.role || '').toUpperCase();
  const esAdmin = rolUpper === 'ADMIN';
  const esVendedor = rolUpper === 'VENDEDOR';
  const puedeGestionarPanel = esAdmin || esVendedor;

  // Manejo global de token expirado o 401
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearAuthToken();
      setCurrentUser(null);
      setActiveView('login');
      showToast('Tu sesión ha expirado o no es válida. Inicia sesión nuevamente.');
    });
    return () => setUnauthorizedHandler(null);
  }, [showToast]);

  // Restaurar sesión JWT al recargar la página usando GET /api/auth/me
  useEffect(() => {
    if (initialUser) {
      setCargandoSesion(false);
      return;
    }
    const token = getAuthToken();
    if (!token) {
      setCargandoSesion(false);
      return;
    }
    let cancelado = false;
    obtenerUsuarioActual()
      .then((user) => {
        if (!cancelado) {
          setCurrentUser(normalizarUsuario(user));
        }
      })
      .catch(() => {
        if (!cancelado) {
          clearAuthToken();
          setCurrentUser(null);
        }
      })
      .finally(() => {
        if (!cancelado) {
          setCargandoSesion(false);
        }
      });
    return () => {
      cancelado = true;
    };
  }, [initialUser]);

  // Cargar datos públicos desde ms-productos y ms-categorias
  const cargarCatalogoBackend = useCallback(async () => {
    setCargandoCatalogo(true);
    setErrorCatalogo('');
    try {
      const dataProd = await listarProductos();
      setProductos(Array.isArray(dataProd) ? dataProd : []);
    } catch (err) {
      setErrorCatalogo(obtenerMensajeError(err, 'No se pudo cargar el catálogo desde el servidor.'));
    } finally {
      setCargandoCatalogo(false);
    }

    try {
      const dataCat = await listarCategorias();
      if (Array.isArray(dataCat)) {
        setCategoriasObj(dataCat);
      }
    } catch {
      // Las categorías tienen respaldo de etiquetas en UI si ms-categorias no responde
    }
  }, []);

  // Cargar datos administrativos (ADMIN ve todo; VENDEDOR ve catálogo, ventas y reportes)
  const cargarDatosAdminBackend = useCallback(async () => {
    setCargandoAdmin(true);
    setErrorAdmin('');
    await cargarCatalogoBackend();

    try {
      const promesas = [
        listarOrdenes(),
        listarReportes(),
        obtenerDashboardReportes(),
        listarReportesProductos().catch(() => [])
      ];
      if (esAdmin) {
        promesas.push(listarUsuarios());
      }
      const resultados = await Promise.all(promesas);
      setOrdenes(Array.isArray(resultados[0]) ? resultados[0] : []);
      setReportes(Array.isArray(resultados[1]) ? resultados[1] : []);
      setDashboardStats(resultados[2] || null);
      setReportesProductos(Array.isArray(resultados[3]) ? resultados[3] : []);
      if (esAdmin) {
        setUsuarios(Array.isArray(resultados[4]) ? resultados[4] : []);
      }
    } catch (err) {
      setErrorAdmin(obtenerMensajeError(err, 'Error al cargar datos del panel desde el servidor.'));
    } finally {
      setCargandoAdmin(false);
    }
  }, [cargarCatalogoBackend, esAdmin]);

  useEffect(() => {
    cargarCatalogoBackend();
  }, [cargarCatalogoBackend]);

  useEffect(() => {
    if (activeView === 'admin' && puedeGestionarPanel) {
      cargarDatosAdminBackend();
    }
  }, [activeView, puedeGestionarPanel, cargarDatosAdminBackend]);

  // --- 1. OPERACIONES CRUD DE PRODUCTOS ---
  const handleAddProduct = async (nuevoProducto) => {
    const creado = await crearProducto(nuevoProducto);
    setProductos(prev => [creado, ...prev]);
    showToast(`Producto "${creado.nombre}" creado en la base de datos.`);
    return creado;
  };

  const handleUpdateProduct = async (productoActualizado) => {
    const actualizado = await actualizarProducto(productoActualizado.codigo, productoActualizado);
    setProductos(prev => prev.map(p => p.codigo === actualizado.codigo ? actualizado : p));
    if (selectedProduct && selectedProduct.codigo === actualizado.codigo) {
      setSelectedProduct(actualizado);
    }
    setCartItems(prev => prev.map(item => item.codigo === actualizado.codigo
      ? { ...item, nombre: actualizado.nombre, precio: actualizado.precio, unidad: actualizado.unidad }
      : item
    ));
    showToast(`Producto "${actualizado.nombre}" actualizado en la base de datos.`);
    return actualizado;
  };

  const handleDeleteProduct = async (codigo) => {
    await eliminarProducto(codigo);
    setProductos(prev => prev.filter(p => p.codigo !== codigo));
    setCartItems(prev => prev.filter(item => item.codigo !== codigo));
    if (selectedProduct && selectedProduct.codigo === codigo) {
      setSelectedProduct(null);
      setActiveView('catalogo');
    }
    showToast('Producto eliminado de la base de datos.');
  };

  const handleResetDefaults = async () => {
    const restaurados = await restaurarCatalogo();
    setProductos(restaurados);
    if (selectedProduct) {
      const resetProd = restaurados.find(p => p.codigo === selectedProduct.codigo);
      if (resetProd) setSelectedProduct(resetProd);
    }
    showToast('Catálogo restablecido en la base de datos.');
  };

  // --- 2. OPERACIONES CRUD DE CATEGORÍAS ---
  const handleAddCategory = async (nuevaCat) => {
    const creada = await crearCategoria(nuevaCat);
    setCategoriasObj(prev => [...prev, creada]);
    showToast(`Categoría "${creada.nombre}" creada.`);
    return creada;
  };

  const handleUpdateCategory = async (id, datosCat) => {
    const actualizada = await actualizarCategoria(id, datosCat);
    setCategoriasObj(prev => prev.map(c => c.id === id ? actualizada : c));
    showToast(`Categoría "${actualizada.nombre}" actualizada.`);
    return actualizada;
  };

  const handleDeleteCategory = async (id) => {
    await eliminarCategoria(id);
    setCategoriasObj(prev => prev.filter(c => c.id !== id));
    showToast('Categoría eliminada.');
  };

  // --- 3. OPERACIONES CRUD DE USUARIOS (Solo ADMIN) ---
  const handleAddUser = async (nuevoUser) => {
    const creado = await crearUsuario(nuevoUser);
    setUsuarios(prev => [...prev, creado]);
    showToast(`Usuario "${creado.nombre}" (${creado.rol}) creado.`);
    return creado;
  };

  const handleUpdateUser = async (id, datosUser) => {
    const actualizado = await actualizarUsuario(id, datosUser);
    setUsuarios(prev => prev.map(u => u.id === id ? actualizado : u));
    showToast(`Usuario "${actualizado.nombre}" actualizado (${actualizado.rol}).`);
    return actualizado;
  };

  const handleToggleUserStatus = async (id, activo) => {
    const actualizado = await cambiarEstadoUsuario(id, activo);
    setUsuarios(prev => prev.map(u => u.id === id ? actualizado : u));
    showToast(`Estado de "${actualizado.nombre}" actualizado a ${actualizado.activo ? 'Activo' : 'Inactivo'}.`);
    return actualizado;
  };

  const handleDeleteUser = async (id) => {
    await eliminarUsuario(id);
    setUsuarios(prev => prev.filter(u => u.id !== id));
    showToast('Usuario eliminado de la base de datos.');
  };

  // Autenticación y Registro contra backend
  const handleAuthenticateUser = async (emailInput, passwordInput) => {
    const { user, token } = await loginUsuario((emailInput || '').trim().toLowerCase(), passwordInput);
    return { user, token };
  };

  const handleRegisterUser = async (nuevoUsuario) => {
    const { user, token } = await registrarUsuario(nuevoUsuario);
    return { user, token };
  };

  // --- 4. OPERACIONES CRUD DE VENTAS / ÓRDENES ---
  const handleCheckoutOrder = async (ordenPayload) => {
    if (!currentUser) {
      throw {
        response: {
          status: 401,
          data: { error: 'Debes iniciar sesión para confirmar una compra.' }
        }
      };
    }
    const ordenCreada = await crearOrdenCheckout(ordenPayload);
    setOrdenes(prev => [ordenCreada, ...prev]);
    await cargarCatalogoBackend();
    showToast(`¡Orden #${ordenCreada.id} registrada exitosamente en el servidor!`);
    return ordenCreada;
  };

  const handleUpdateOrderStatus = async (id, estado) => {
    const actualizada = await actualizarEstadoOrden(id, estado);
    setOrdenes(prev => prev.map(o => o.id === id ? actualizada : o));
    return actualizada;
  };

  const handleDeleteOrder = async (id) => {
    await eliminarOrden(id);
    setOrdenes(prev => prev.filter(o => o.id !== id));
    const dash = await obtenerDashboardReportes().catch(() => null);
    if (dash) setDashboardStats(dash);
  };

  // --- 5. OPERACIONES CRUD DE REPORTES ---
  const handleCreateReport = async (repPayload) => {
    const creado = await crearReporte(repPayload);
    setReportes(prev => [creado, ...prev]);
    const dash = await obtenerDashboardReportes().catch(() => null);
    if (dash) setDashboardStats(dash);
    return creado;
  };

  const handleUpdateReport = async (id, repPayload) => {
    const actualizado = await actualizarReporte(id, repPayload);
    setReportes(prev => prev.map(r => r.id === id ? actualizado : r));
    return actualizado;
  };

  const handleDeleteReport = async (id) => {
    await eliminarReporte(id);
    setReportes(prev => prev.filter(r => r.id !== id));
  };

  // Navegación con sincronización de historial
  const navigateTo = (view, producto = null, push = true) => {
    if (producto) {
      setSelectedProduct(producto);
      if (producto.codigo) {
        registrarVisualizacionProducto(producto.codigo)
          .then((actualizado) => {
            if (actualizado) {
              setSelectedProduct(prev => (prev && prev.codigo === actualizado.codigo ? actualizado : prev));
              setProductos(prev => prev.map(p => p.codigo === actualizado.codigo ? actualizado : p));
            }
          })
          .catch(() => {
            obtenerProductoPorCodigo(producto.codigo)
              .then((detalle) => {
                if (detalle) {
                  setSelectedProduct(prev => (prev && prev.codigo === detalle.codigo ? detalle : prev));
                }
              })
              .catch(() => {});
          });
      }
      if (push && typeof window !== 'undefined' && window.history) {
        window.history.pushState(
          { view: activeView === 'producto' ? 'catalogo' : activeView, codigo: producto.codigo },
          '',
          `#producto-${producto.codigo}`
        );
      }
      return;
    }

    setSelectedProduct(null);
    setActiveView(view);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });

      if (view === 'catalogo') {
        window.dispatchEvent(new CustomEvent('huertohogar:show-all-products'));
      }

      if (push && window.history) {
        window.history.pushState({ view, codigo: null }, '', `#${view}`);
      }
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined' || initialView) return;

    if (!hasHandledInitialHashRef.current) {
      const initialHash = window.location.hash;
      if (initialHash.startsWith('#producto-')) {
        if (productos.length > 0) {
          hasHandledInitialHashRef.current = true;
          const code = initialHash.replace('#producto-', '');
          const initialProd = productos.find(p => p.codigo === code);
          if (initialProd) {
            setSelectedProduct(initialProd);
            setActiveView('catalogo');
            window.history.replaceState({ view: 'catalogo', codigo: code }, '', initialHash);
          }
        }
      } else {
        hasHandledInitialHashRef.current = true;
        if (!window.history.state) {
          window.history.replaceState({ view: activeView, codigo: null }, '', `#${activeView}`);
        }
      }
    }

    const handlePopState = (event) => {
      const state = event.state;
      if (state) {
        if (state.codigo) {
          const prod = productos.find(p => p.codigo === state.codigo);
          if (prod) {
            if (state.view) setActiveView(state.view);
            setSelectedProduct(prod);
            return;
          }
        }
        setSelectedProduct(null);
        if (state.view) {
          setActiveView(state.view);
        }
      } else {
        setSelectedProduct(null);
        setActiveView('inicio');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [productos, activeView, initialView]);

  const handleViewProduct = (producto) => {
    navigateTo(activeView, producto, true);
  };

  const handleBackToCatalog = () => {
    if (typeof window !== 'undefined' && window.history && window.history.state?.codigo) {
      window.history.back();
    } else {
      setSelectedProduct(null);
    }
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
    const userNormalizado = normalizarUsuario(user);
    setCurrentUser(userNormalizado);
    if (userNormalizado?.rol === 'ADMIN') {
      navigateTo('admin');
      showToast(`¡Bienvenido Administrador(a) ${userNormalizado.nombre}!`);
    } else if (userNormalizado?.rol === 'VENDEDOR') {
      navigateTo('admin');
      showToast(`¡Bienvenido Vendedor(a) ${userNormalizado.nombre}! Publica tus productos y revisa tus estadísticas.`);
    } else {
      navigateTo('catalogo');
      showToast(`¡Bienvenido(a), ${userNormalizado?.nombre || userNormalizado?.email}!`);
    }
  };

  const handleLogout = async () => {
    await logoutUsuario();
    setCurrentUser(null);
    setUsuarios([]);
    setOrdenes([]);
    setReportes([]);
    navigateTo('catalogo');
    showToast('Has cerrado sesión exitosamente.');
  };

  const handleRegisterSuccess = (newUser) => {
    const userNormalizado = normalizarUsuario(newUser);
    setCurrentUser(userNormalizado);
    if (userNormalizado?.rol === 'VENDEDOR' || userNormalizado?.rol === 'ADMIN') {
      navigateTo('admin');
    } else {
      navigateTo('catalogo');
    }
    showToast(`¡Cuenta creada con éxito! Bienvenido(a) ${userNormalizado?.nombre || ''}.`);
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.cantidad, 0);
  const listaNombresCategorias = categoriasObj.length > 0
    ? ['Todas', ...categoriasObj.map(c => c.nombre)]
    : CATEGORIAS;

  return (
    <div className="d-flex flex-column min-vh-100 position-relative" data-testid="app-root">
      <OrchardBackground />
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
        activeView={activeView === 'producto' ? 'catalogo' : activeView}
        setActiveView={(view) => navigateTo(view)}
        cartCount={totalCartCount}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Error global de conexión con el catálogo */}
      {errorCatalogo && (
        <div className="container mt-3">
          <div className="alert alert-danger d-flex justify-content-between align-items-center shadow-sm" role="alert" data-testid="catalog-error-banner">
            <div>
              <i className="bi bi-wifi-off me-2"></i>
              <strong>Error de conexión con la API:</strong> {errorCatalogo}
            </div>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={cargarCatalogoBackend}
              data-testid="btn-retry-catalog"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}

      {/* Vistas según navegación activa */}
      <main className="flex-grow-1 position-relative" style={{ zIndex: 1 }}>
        {activeView === 'inicio' && (
          <>
            <Hero
              productos={productos}
              cargando={cargandoCatalogo}
              onExplore={() => navigateTo('catalogo')}
              onSelectProduct={(codigo) => {
                const prod = productos.find(p => p.codigo === codigo);
                if (prod) handleViewProduct(prod);
              }}
            />

            <GalleryHelix
              productos={productos}
              onSelectProduct={handleViewProduct}
              onAddToCart={handleAddToCart}
              onExploreCatalog={() => navigateTo('catalogo')}
            />

            <section className="container my-5" data-testid="seasonal-harvest-section">
              {(() => {
                const infoEstacion = obtenerInfoEstacion(estacionSeleccionada);
                const productosTemporada = seleccionarProductosPorTemporada(productos, estacionSeleccionada, 4);
                return (
                  <>
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
                      <div>
                        <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                          <h3 className="h4 fw-bold text-dark mb-0">Cosecha Directa de Temporada</h3>
                          <span
                            className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3 py-1"
                            data-testid="season-active-label"
                          >
                            <i className={`bi ${infoEstacion.icono} me-1`}></i>
                            {infoEstacion.nombre} ({infoEstacion.meses})
                          </span>
                        </div>
                        <p className="text-muted small mb-0">{infoEstacion.descripcion}</p>
                      </div>

                      <div className="d-flex flex-wrap align-items-center gap-2">
                        <div
                          className="btn-group btn-group-sm"
                          role="group"
                          aria-label="Selector de estacion"
                          data-testid="season-selector"
                        >
                          {ESTACIONES_TEMPORADA.map((est) => {
                            const activo = est.id === estacionSeleccionada;
                            return (
                              <button
                                key={est.id}
                                type="button"
                                className={`btn ${activo ? 'btn-success' : 'btn-outline-success'} fw-semibold d-inline-flex align-items-center`}
                                onClick={() => setEstacionSeleccionada(est.id)}
                                aria-pressed={activo}
                                data-testid={`season-btn-${est.id}`}
                              >
                                <i className={`bi ${est.icono} me-1`}></i>
                                {est.nombre}
                              </button>
                            );
                          })}
                        </div>

                        <button
                          className="btn btn-outline-success btn-sm fw-semibold d-inline-flex align-items-center"
                          onClick={() => navigateTo('catalogo')}
                        >
                          <GripIcon size={16} className="me-1" /> Ver Todos ({productos.length})
                        </button>
                      </div>
                    </div>

                    {cargandoCatalogo ? (
                      <div className="text-center py-5" data-testid="catalog-loading">
                        <div className="spinner-border text-success mb-2" role="status">
                          <span className="visually-hidden">Cargando productos...</span>
                        </div>
                        <p className="text-muted small mb-0">Cargando productos desde la base de datos...</p>
                      </div>
                    ) : (
                      <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-4" data-testid="seasonal-products-grid">
                        {productosTemporada.map(prod => (
                          <div className="col" key={`${estacionSeleccionada}-${prod.codigo}`}>
                            <ProductCard
                              producto={prod}
                              onAddToCart={handleAddToCart}
                              onViewDetails={(p) => {
                                setOpenReportModal(false);
                                handleViewProduct(p);
                              }}
                              onReportProduct={(p) => {
                                setOpenReportModal(true);
                                handleViewProduct(p);
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}

              <div className="mt-5 p-4 p-md-5 bg-light rounded-4 border text-center shadow-sm">
                <span className="badge bg-success-subtle text-success border border-success-subtle mb-2 px-3 py-2 rounded-pill fw-semibold">
                  <i className="bi bi-box-seam me-1"></i> Variedad Completa
                </span>
                <h4 className="fw-bold text-dark mb-2">Explora nuestro Catálogo Completo</h4>
                <p className="text-muted mb-4 mx-auto" style={{ maxWidth: '600px' }}>
                  Frutas frescas y verduras orgánicas de la V Región directo a tu mesa con despacho en cadena de frío.
                </p>
                <button
                  className="btn btn-success btn-lg px-4 shadow-sm"
                  onClick={() => navigateTo('catalogo')}
                >
                  <GripIcon size={20} className="me-2" /> Ir al Catálogo con Todos los Productos
                </button>
              </div>
            </section>
          </>
        )}

        {(activeView === 'catalogo' || activeView === 'producto') && (
          <div className="py-2">
            {cargandoCatalogo ? (
              <div className="container text-center py-5" data-testid="catalog-loading">
                <div className="spinner-border text-success mb-2" role="status">
                  <span className="visually-hidden">Cargando catálogo...</span>
                </div>
                <p className="text-muted small mb-0">Cargando catálogo desde el servidor...</p>
              </div>
            ) : (
              <ProductList
                productos={productos}
                categorias={listaNombresCategorias}
                onAddToCart={handleAddToCart}
                onViewDetails={(p) => {
                  setOpenReportModal(false);
                  handleViewProduct(p);
                }}
                onReportProduct={(p) => {
                  setOpenReportModal(true);
                  handleViewProduct(p);
                }}
              />
            )}
          </div>
        )}

        {/* Ruta Protegida: solo ADMIN autenticado con sesión válida */}
        {activeView === 'admin' && (
          cargandoSesion ? (
            <div className="container my-5 text-center py-5" data-testid="auth-loading">
              <div className="spinner-border text-success mb-2" role="status">
                <span className="visually-hidden">Verificando sesión...</span>
              </div>
              <p className="text-muted small">Verificando permisos con el servidor...</p>
            </div>
          ) : !currentUser ? (
            <div className="container my-5 text-center" data-testid="protected-route-unauth">
              <div className="alert alert-warning py-4 shadow-sm">
                <i className="bi bi-lock-fill fs-1 text-warning d-block mb-2"></i>
                <h4 className="fw-bold">Acceso Restringido (401)</h4>
                <p className="mb-3 text-muted">
                  Debes iniciar sesión para acceder al panel de administración.
                </p>
                <button className="btn btn-success" onClick={() => navigateTo('login')} data-testid="btn-go-login">
                  Ir a Iniciar Sesión
                </button>
              </div>
            </div>
          ) : !puedeGestionarPanel ? (
            <div className="container my-5 text-center" data-testid="protected-route-forbidden">
              <div className="alert alert-danger py-4 shadow-sm">
                <i className="bi bi-shield-x fs-1 text-danger d-block mb-2"></i>
                <h4 className="fw-bold">Acceso Denegado (403)</h4>
                <p className="mb-3 text-muted">
                  Tu cuenta tiene rol <strong>{currentUser.rol}</strong>. Solo usuarios con rol <strong>ADMIN</strong> o <strong>VENDEDOR</strong> pueden acceder al panel de gestión.
                </p>
                <button className="btn btn-outline-dark" onClick={() => navigateTo('catalogo')} data-testid="btn-back-store">
                  Volver al Catálogo
                </button>
              </div>
            </div>
          ) : (
            <AdminProducts
              currentUser={currentUser}
              productos={productos}
              onAddProduct={handleAddProduct}
              onUpdateProduct={handleUpdateProduct}
              onDeleteProduct={handleDeleteProduct}
              onResetDefaults={handleResetDefaults}
              onExitAdmin={() => navigateTo('catalogo')}
              categoriasObj={categoriasObj}
              onAddCategory={handleAddCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
              usuarios={usuarios}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onToggleUserStatus={handleToggleUserStatus}
              onDeleteUser={handleDeleteUser}
              ordenes={ordenes}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onDeleteOrder={handleDeleteOrder}
              reportes={reportes}
              reportesProductos={reportesProductos}
              dashboardStats={dashboardStats}
              onCreateReport={handleCreateReport}
              onUpdateReport={handleUpdateReport}
              onDeleteReport={handleDeleteReport}
              onUpdateProductReportStatus={async (id, estado) => {
                const actualizado = await actualizarEstadoReporteProducto(id, estado);
                setReportesProductos((prev) => prev.map((r) => (r.id === id ? actualizado : r)));
                showToast(`Reporte #${id} actualizado a ${estado}.`);
              }}
              onDeleteProductReport={async (id) => {
                await eliminarReporteProducto(id);
                setReportesProductos((prev) => prev.filter((r) => r.id !== id));
                showToast(`Reporte #${id} eliminado.`);
              }}
              onRefreshAll={cargarDatosAdminBackend}
              cargandoAdmin={cargandoAdmin}
              errorAdmin={errorAdmin}
            />
          )
        )}

        {activeView === 'carrito' && (
          <Cart
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onContinueShopping={() => navigateTo('catalogo')}
            currentUser={currentUser}
            onCheckout={handleCheckoutOrder}
          />
        )}

        {activeView === 'login' && (
          <LoginForm
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => navigateTo('registro')}
            onAuthenticate={handleAuthenticateUser}
          />
        )}

        {activeView === 'registro' && (
          <RegisterForm
            onRegisterSuccess={handleRegisterSuccess}
            onSwitchToLogin={() => navigateTo('login')}
            onRegister={handleRegisterUser}
          />
        )}
      </main>

      <Footer />

      <AnimatePresence>
        {selectedProduct && (
          <ProductDetail
            producto={selectedProduct}
            onBack={() => {
              setOpenReportModal(false);
              handleBackToCatalog();
            }}
            onAddToCart={handleAddToCart}
            onGoToCart={() => navigateTo('carrito')}
            todosLosProductos={productos}
            onSelectRelated={(prod) => {
              setOpenReportModal(false);
              handleViewProduct(prod);
            }}
            openReportInitially={openReportModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
