import {
  API_ENDPOINTS,
  apiClient,
  setAuthToken,
  getAuthToken,
  clearAuthToken,
  setUnauthorizedHandler,
  obtenerMensajeError,
  normalizarUsuario,
  loginUsuario,
  registrarUsuario,
  obtenerUsuarioActual,
  logoutUsuario,
  listarProductos,
  obtenerProductoPorCodigo,
  registrarVisualizacionProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  cambiarEstadoUsuario,
  eliminarUsuario
} from '../src/services/api.js';

describe('Capa de Servicios API (JWT, Interceptores y Endpoints por Entorno)', () => {
  beforeEach(() => {
    clearAuthToken();
    sessionStorage.clear();
    localStorage.clear();
    setUnauthorizedHandler(null);
  });

  afterEach(() => {
    clearAuthToken();
    sessionStorage.clear();
    setUnauthorizedHandler(null);
  });

  it('1. Debe resolver las URLs base de los microservicios desde variables de entorno sin localhost fijo', () => {
    expect(API_ENDPOINTS.USUARIOS).toBe('http://api.test/usuarios/api');
    expect(API_ENDPOINTS.PRODUCTOS).toBe('http://api.test/productos/api/products');
    expect(API_ENDPOINTS.CATEGORIAS).toBe('http://api.test/categorias/api/categories');
    expect(API_ENDPOINTS.VENTAS).toBe('http://api.test/ventas/api/orders');
    expect(API_ENDPOINTS.REPORTES).toBe('http://api.test/reportes/api/reports');
  });

  it('2. Debe almacenar y limpiar el token JWT usando sessionStorage y nunca localStorage', () => {
    setAuthToken('jwt-secreto-abc');
    expect(getAuthToken()).toBe('jwt-secreto-abc');
    expect(sessionStorage.getItem('hh_jwt_token')).toBe('jwt-secreto-abc');
    expect(localStorage.length).toBe(0);

    clearAuthToken();
    expect(getAuthToken()).toBe('');
    expect(sessionStorage.getItem('hh_jwt_token')).toBeNull();
  });

  it('3. Debe normalizar roles a ADMIN o CLIENTE correctamente', () => {
    expect(normalizarUsuario({ id: 1, role: 'ROLE_ADMIN' }).rol).toBe('ADMIN');
    expect(normalizarUsuario({ id: 2, rol: 'admin' }).role).toBe('ADMIN');
    expect(normalizarUsuario({ id: 3, role: 'cliente' }).rol).toBe('CLIENTE');
    expect(normalizarUsuario({ id: 4, activo: false }).activo).toBe(false);
  });

  it('4. loginUsuario debe guardar token JWT y normalizar el usuario autenticado', async () => {
    const postSpy = spyOn(apiClient, 'post').and.resolveTo({
      data: {
        token: 'jwt-login-999',
        type: 'Bearer',
        user: { id: 1, nombre: 'Admin', email: 'admin@huertohogar.cl', role: 'ADMIN' }
      }
    });

    const res = await loginUsuario('admin@huertohogar.cl', 'Admin123*');

    expect(postSpy).toHaveBeenCalledWith(
      'http://api.test/usuarios/api/auth/login',
      { email: 'admin@huertohogar.cl', password: 'Admin123*' }
    );
    expect(res.token).toBe('jwt-login-999');
    expect(res.user.rol).toBe('ADMIN');
    expect(getAuthToken()).toBe('jwt-login-999');
  });

  it('5. registrarUsuario debe forzar rol CLIENTE y almacenar el token devuelto', async () => {
    const postSpy = spyOn(apiClient, 'post').and.resolveTo({
      data: {
        token: 'jwt-reg-111',
        user: { id: 7, nombre: 'Rosa', email: 'rosa@huerto.cl', role: 'CLIENTE' }
      }
    });

    const res = await registrarUsuario({
      nombre: 'Rosa',
      email: 'rosa@huerto.cl',
      password: 'Password123*',
      role: 'ADMIN'
    });

    expect(postSpy).toHaveBeenCalledWith(
      'http://api.test/usuarios/api/auth/register',
      jasmine.objectContaining({ role: 'CLIENTE' })
    );
    expect(res.user.rol).toBe('CLIENTE');
    expect(getAuthToken()).toBe('jwt-reg-111');
  });

  it('6. El interceptor de request debe inyectar el header Authorization Bearer cuando existe JWT', async () => {
    setAuthToken('jwt-header-token');
    const interceptor = apiClient.interceptors.request.handlers[0].fulfilled;
    const config = await interceptor({ headers: {} });
    expect(config.headers.Authorization).toBe('Bearer jwt-header-token');
  });

  it('7. El interceptor de response debe invocar unauthorizedHandler ante respuestas HTTP 401', async () => {
    const handlerSpy = jasmine.createSpy('unauthorizedHandler');
    setUnauthorizedHandler(handlerSpy);

    const errInterceptor = apiClient.interceptors.response.handlers[0].rejected;
    const err401 = { response: { status: 401 }, config: { url: '/api/users' } };

    let capturado = null;
    try {
      await errInterceptor(err401);
    } catch (e) {
      capturado = e;
    }

    expect(capturado).toBe(err401);
    expect(handlerSpy).toHaveBeenCalledTimes(1);
  });

  it('8. Debe ejecutar CRUD de productos y detalle contra el endpoint configurado', async () => {
    const getSpy = spyOn(apiClient, 'get').and.callFake((url) => {
      if (url.endsWith('/FR001')) {
        return Promise.resolve({ data: { codigo: 'FR001', nombre: 'Manzanas', atributo: 'Limache' } });
      }
      return Promise.resolve({ data: [{ codigo: 'FR001', nombre: 'Manzanas', atributo: 'Limache' }] });
    });
    const postSpy = spyOn(apiClient, 'post').and.resolveTo({ data: { codigo: 'VR999', nombre: 'Apio' } });
    const putSpy = spyOn(apiClient, 'put').and.resolveTo({ data: { codigo: 'VR999', nombre: 'Apio Editado' } });
    const delSpy = spyOn(apiClient, 'delete').and.resolveTo({});

    const lista = await listarProductos();
    const detalle = await obtenerProductoPorCodigo('FR001');
    const creado = await crearProducto({ codigo: 'VR999', nombre: 'Apio' });
    const editado = await actualizarProducto('VR999', { nombre: 'Apio Editado' });
    await eliminarProducto('VR999');

    expect(getSpy).toHaveBeenCalledTimes(2);
    expect(lista.length).toBe(1);
    expect(detalle.codigo).toBe('FR001');
    expect(postSpy).toHaveBeenCalledWith('http://api.test/productos/api/products', { codigo: 'VR999', nombre: 'Apio' });
    expect(creado.codigo).toBe('VR999');
    expect(putSpy).toHaveBeenCalledWith('http://api.test/productos/api/products/VR999', { nombre: 'Apio Editado' });
    expect(editado.nombre).toBe('Apio Editado');
    expect(delSpy).toHaveBeenCalledWith('http://api.test/productos/api/products/VR999');
  });

  it('9. Debe ejecutar CRUD de usuarios y PATCH de estado activo/inactivo y logout', async () => {
    setAuthToken('jwt-admin');
    const getSpy = spyOn(apiClient, 'get').and.callFake((url) => {
      if (url.endsWith('/auth/me')) {
        return Promise.resolve({ data: { id: 1, email: 'admin@huertohogar.cl', role: 'ADMIN' } });
      }
      return Promise.resolve({ data: [{ id: 2, email: 'c@h.cl', role: 'CLIENTE', activo: true }] });
    });
    const postSpy = spyOn(apiClient, 'post').and.resolveTo({ data: { id: 3, role: 'ADMIN' } });
    const putSpy = spyOn(apiClient, 'put').and.resolveTo({ data: { id: 2, role: 'ADMIN' } });
    const patchSpy = spyOn(apiClient, 'patch').and.resolveTo({ data: { id: 2, role: 'CLIENTE', activo: false } });
    const delSpy = spyOn(apiClient, 'delete').and.resolveTo({});

    const actual = await obtenerUsuarioActual();
    const lista = await listarUsuarios();
    const creado = await crearUsuario({ nombre: 'Op', email: 'op@h.cl', rol: 'ADMIN' });
    const editado = await actualizarUsuario(2, { nombre: 'Op2', rol: 'ADMIN' });
    const estado = await cambiarEstadoUsuario(2, false);
    await eliminarUsuario(2);
    await logoutUsuario();

    expect(actual.rol).toBe('ADMIN');
    expect(lista[0].rol).toBe('CLIENTE');
    expect(creado.rol).toBe('ADMIN');
    expect(editado.rol).toBe('ADMIN');
    expect(patchSpy).toHaveBeenCalledWith('http://api.test/usuarios/api/users/2/estado', { activo: false });
    expect(estado.activo).toBe(false);
    expect(delSpy).toHaveBeenCalledWith('http://api.test/usuarios/api/users/2');
    expect(postSpy).toHaveBeenCalledWith('http://api.test/usuarios/api/auth/logout');
    expect(getAuthToken()).toBe('');
    expect(getSpy).toHaveBeenCalledTimes(2);
  });

  it('10. obtenerMensajeError debe interpretar códigos HTTP 401, 403, 404 y mensajes del backend', () => {
    expect(obtenerMensajeError({ response: { status: 403, data: {} } })).toContain('403');
    expect(obtenerMensajeError({ response: { status: 401, data: {} } })).toContain('401');
    expect(obtenerMensajeError({ response: { status: 404, data: {} } })).toContain('404');
    expect(obtenerMensajeError({ response: { status: 400, data: { error: 'Stock insuficiente' } } })).toBe('Stock insuficiente');
  });

  it('11. Debe registrar rol VENDEDOR cuando se selecciona y sumar visualizaciones vía POST', async () => {
    const postSpy = spyOn(apiClient, 'post').and.callFake((url) => {
      if (url.endsWith('/visualizacion')) {
        return Promise.resolve({ data: { codigo: 'FR001', visualizaciones: 421, atributo: 'San Felipe' } });
      }
      return Promise.resolve({
        data: { token: 'jwt-vend', user: { id: 8, nombre: 'Pedro', role: 'VENDEDOR' } }
      });
    });

    const reg = await registrarUsuario({ nombre: 'Pedro', email: 'v@h.cl', password: 'Password123*', role: 'VENDEDOR' });
    const vis = await registrarVisualizacionProducto('FR001');

    expect(reg.user.rol).toBe('VENDEDOR');
    expect(postSpy).toHaveBeenCalledWith('http://api.test/productos/api/products/FR001/visualizacion');
    expect(vis.visualizaciones).toBe(421);
  });
});
