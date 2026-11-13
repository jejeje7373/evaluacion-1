import axios from 'axios';
import { normalizarOrigenProducto } from '../data/products.js';

const TOKEN_STORAGE_KEY = 'hh_jwt_token';

const readEnv = (key) => {
  try {
    return (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) || '';
  } catch {
    return '';
  }
};

export const API_ENDPOINTS = {
  USUARIOS: readEnv('VITE_API_USUARIOS_URL'),
  CATEGORIAS: readEnv('VITE_API_CATEGORIAS_URL'),
  PRODUCTOS: readEnv('VITE_API_PRODUCTOS_URL'),
  VENTAS: readEnv('VITE_API_VENTAS_URL'),
  REPORTES: readEnv('VITE_API_REPORTES_URL')
};

export const apiClient = axios.create();

let memoryToken = '';
let unauthorizedHandler = null;

export const getAuthToken = () => {
  if (memoryToken) return memoryToken;
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const stored = window.sessionStorage.getItem(TOKEN_STORAGE_KEY) || '';
      memoryToken = stored;
      return stored;
    }
  } catch {
    return memoryToken;
  }
  return '';
};

export const setAuthToken = (token) => {
  memoryToken = token || '';
  try {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      if (memoryToken) {
        window.sessionStorage.setItem(TOKEN_STORAGE_KEY, memoryToken);
      } else {
        window.sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    }
  } catch {
    // Entorno sin sessionStorage
  }
};

export const clearAuthToken = () => {
  setAuthToken('');
};

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = typeof handler === 'function' ? handler : null;
};

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || '';
    if (status === 401 && !url.includes('/auth/login') && unauthorizedHandler) {
      unauthorizedHandler(error);
    }
    return Promise.reject(error);
  }
);

export const obtenerMensajeError = (error, fallback = 'Ocurrió un error al comunicarse con el servidor.') => {
  const status = error?.response?.status;
  const serverMsg = error?.response?.data?.error || error?.response?.data?.message;
  if (serverMsg) return serverMsg;
  if (status === 401) return 'Tu sesión ha expirado o no estás autenticado (401).';
  if (status === 403) return 'No tienes permisos suficientes para realizar esta acción (403).';
  if (status === 404) return 'El recurso solicitado no fue encontrado (404).';
  if (status === 400) return 'Datos inválidos enviados al servidor (400).';
  return error?.message || fallback;
};

export const normalizarUsuario = (u) => {
  if (!u) return null;
  const rawRole = String(u.rol || u.role || 'CLIENTE').trim().toUpperCase();
  const normalizedRole = rawRole.startsWith('ROLE_') ? rawRole.slice(5) : rawRole;
  const rolFinal = normalizedRole === 'ADMIN'
    ? 'ADMIN'
    : (normalizedRole === 'VENDEDOR' ? 'VENDEDOR' : 'CLIENTE');
  return {
    ...u,
    rol: rolFinal,
    role: rolFinal,
    activo: u.activo !== false
  };
};

// ==========================================
// 1. MICROSERVICIO DE PRODUCTOS
// ==========================================
export const listarProductos = async (categoria = '') => {
  const params = categoria && categoria !== 'Todas' ? { categoria } : {};
  const { data } = await apiClient.get(API_ENDPOINTS.PRODUCTOS, { params });
  return Array.isArray(data) ? data.map(normalizarOrigenProducto) : [];
};

export const obtenerProductoPorCodigo = async (codigo) => {
  const { data } = await apiClient.get(`${API_ENDPOINTS.PRODUCTOS}/${codigo}`);
  return normalizarOrigenProducto(data);
};

export const registrarVisualizacionProducto = async (codigo) => {
  const { data } = await apiClient.post(`${API_ENDPOINTS.PRODUCTOS}/${codigo}/visualizacion`);
  return normalizarOrigenProducto(data);
};

export const crearProducto = async (producto) => {
  const { data } = await apiClient.post(API_ENDPOINTS.PRODUCTOS, producto);
  return normalizarOrigenProducto(data);
};

export const actualizarProducto = async (codigo, producto) => {
  const { data } = await apiClient.put(`${API_ENDPOINTS.PRODUCTOS}/${codigo}`, producto);
  return normalizarOrigenProducto(data);
};

export const eliminarProducto = async (codigo) => {
  await apiClient.delete(`${API_ENDPOINTS.PRODUCTOS}/${codigo}`);
};

export const restaurarCatalogo = async () => {
  const { data } = await apiClient.post(`${API_ENDPOINTS.PRODUCTOS}/reset`);
  return Array.isArray(data) ? data.map(normalizarOrigenProducto) : [];
};

// ==========================================
// 2. MICROSERVICIO DE CATEGORÍAS
// ==========================================
export const listarCategorias = async () => {
  const { data } = await apiClient.get(API_ENDPOINTS.CATEGORIAS);
  return Array.isArray(data) ? data : [];
};

export const crearCategoria = async (categoria) => {
  const { data } = await apiClient.post(API_ENDPOINTS.CATEGORIAS, categoria);
  return data;
};

export const actualizarCategoria = async (id, categoria) => {
  const { data } = await apiClient.put(`${API_ENDPOINTS.CATEGORIAS}/${id}`, categoria);
  return data;
};

export const eliminarCategoria = async (id) => {
  await apiClient.delete(`${API_ENDPOINTS.CATEGORIAS}/${id}`);
};

// ==========================================
// 3. MICROSERVICIO DE USUARIOS Y AUTH
// ==========================================
export const loginUsuario = async (email, password) => {
  const { data } = await apiClient.post(`${API_ENDPOINTS.USUARIOS}/auth/login`, { email, password });
  if (data?.token) {
    setAuthToken(data.token);
  }
  const user = normalizarUsuario(data?.user || data);
  return {
    token: data?.token || '',
    type: data?.type || 'Bearer',
    user
  };
};

export const registrarUsuario = async (usuario) => {
  const rolSolicitado = String(usuario.rol || usuario.role || 'CLIENTE').trim().toUpperCase();
  const rolPublico = rolSolicitado === 'VENDEDOR' ? 'VENDEDOR' : 'CLIENTE';
  const payload = {
    ...usuario,
    role: rolPublico
  };
  const { data } = await apiClient.post(`${API_ENDPOINTS.USUARIOS}/auth/register`, payload);
  if (data?.token) {
    setAuthToken(data.token);
  }
  const user = normalizarUsuario(data?.user || data);
  return {
    token: data?.token || '',
    type: data?.type || 'Bearer',
    user
  };
};

export const obtenerUsuarioActual = async () => {
  const { data } = await apiClient.get(`${API_ENDPOINTS.USUARIOS}/auth/me`);
  return normalizarUsuario(data);
};

export const logoutUsuario = async () => {
  const token = getAuthToken();
  try {
    if (token) {
      await apiClient.post(`${API_ENDPOINTS.USUARIOS}/auth/logout`);
    }
  } finally {
    clearAuthToken();
  }
};

export const listarUsuarios = async () => {
  const { data } = await apiClient.get(`${API_ENDPOINTS.USUARIOS}/users`);
  return Array.isArray(data) ? data.map(normalizarUsuario) : [];
};

export const crearUsuario = async (usuario) => {
  const rol = String(usuario.rol || usuario.role || 'CLIENTE').trim().toUpperCase();
  const rolValido = rol === 'ADMIN' ? 'ADMIN' : (rol === 'VENDEDOR' ? 'VENDEDOR' : 'CLIENTE');
  const payload = {
    ...usuario,
    role: rolValido
  };
  const { data } = await apiClient.post(`${API_ENDPOINTS.USUARIOS}/users`, payload);
  return normalizarUsuario(data);
};

export const actualizarUsuario = async (id, usuario) => {
  const rol = String(usuario.rol || usuario.role || 'CLIENTE').trim().toUpperCase();
  const rolValido = rol === 'ADMIN' ? 'ADMIN' : (rol === 'VENDEDOR' ? 'VENDEDOR' : 'CLIENTE');
  const payload = {
    ...usuario,
    role: rolValido
  };
  const { data } = await apiClient.put(`${API_ENDPOINTS.USUARIOS}/users/${id}`, payload);
  return normalizarUsuario(data);
};

export const cambiarEstadoUsuario = async (id, activo) => {
  const { data } = await apiClient.patch(`${API_ENDPOINTS.USUARIOS}/users/${id}/estado`, { activo: Boolean(activo) });
  return normalizarUsuario(data);
};

export const eliminarUsuario = async (id) => {
  await apiClient.delete(`${API_ENDPOINTS.USUARIOS}/users/${id}`);
};

// ==========================================
// 4. MICROSERVICIO DE VENTAS / ÓRDENES
// ==========================================
export const listarOrdenes = async () => {
  const { data } = await apiClient.get(API_ENDPOINTS.VENTAS);
  return Array.isArray(data) ? data : [];
};

export const obtenerEstadisticasVentas = async () => {
  const { data } = await apiClient.get(`${API_ENDPOINTS.VENTAS}/stats`);
  return data;
};

export const crearOrdenCheckout = async (orden) => {
  const { data } = await apiClient.post(`${API_ENDPOINTS.VENTAS}/checkout`, orden);
  return data;
};

export const actualizarEstadoOrden = async (id, estado) => {
  const { data } = await apiClient.put(`${API_ENDPOINTS.VENTAS}/${id}`, { estado });
  return data;
};

export const eliminarOrden = async (id) => {
  await apiClient.delete(`${API_ENDPOINTS.VENTAS}/${id}`);
};

// ==========================================
// 5. MICROSERVICIO DE REPORTES
// ==========================================
export const obtenerDashboardReportes = async () => {
  const { data } = await apiClient.get(`${API_ENDPOINTS.REPORTES}/dashboard`);
  return data;
};

export const listarReportes = async () => {
  const { data } = await apiClient.get(API_ENDPOINTS.REPORTES);
  return Array.isArray(data) ? data : [];
};

export const crearReporte = async (reporte) => {
  const { data } = await apiClient.post(API_ENDPOINTS.REPORTES, reporte);
  return data;
};

export const actualizarReporte = async (id, reporte) => {
  const { data } = await apiClient.put(`${API_ENDPOINTS.REPORTES}/${id}`, reporte);
  return data;
};

export const eliminarReporte = async (id) => {
  await apiClient.delete(`${API_ENDPOINTS.REPORTES}/${id}`);
};
