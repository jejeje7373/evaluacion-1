/**
 * Calcula métricas consolidadas y desglose por producto (ventas + visualizaciones + conversión)
 * a partir del catálogo, órdenes de venta y dashboard opcional de ms-reportes.
 */
export function calcularEstadisticasDetalladas({ productos = [], ordenes = [], dashboardStats = null }) {
  const ordenesActivas = Array.isArray(ordenes)
    ? ordenes.filter(o => (o.estado || 'CONFIRMADA') !== 'CANCELADA')
    : [];

  const ingresosCalculados = ordenesActivas.reduce((acc, o) => acc + (Number(o.total) || 0), 0);
  const ventasPorCodigo = new Map();
  let unidadesCalculadas = 0;

  ordenesActivas.forEach((orden) => {
    (orden.detalles || []).forEach((det) => {
      const codigo = det.codigoProducto || 'SIN-COD';
      const cantidad = Number(det.cantidad) || 0;
      const precioUnit = Number(det.precioUnitario) || 0;
      const subtotal = cantidad * precioUnit;
      unidadesCalculadas += cantidad;

      const previo = ventasPorCodigo.get(codigo) || {
        codigo,
        nombre: det.nombreProducto || codigo,
        cantidadVendida: 0,
        ingresos: 0
      };
      previo.cantidadVendida += cantidad;
      previo.ingresos += subtotal;
      ventasPorCodigo.set(codigo, previo);
    });
  });

  // Combinar con estadísticas por producto si existen en dashboardStats.detalleProductos
  const detalleBackendMap = new Map();
  if (Array.isArray(dashboardStats?.detalleProductos)) {
    dashboardStats.detalleProductos.forEach((d) => {
      if (d?.codigo) detalleBackendMap.set(d.codigo, d);
    });
  }

  const codigosVistos = new Set();
  const detalleProductos = [];

  (productos || []).forEach((prod) => {
    codigosVistos.add(prod.codigo);
    const localVenta = ventasPorCodigo.get(prod.codigo);
    const backRow = detalleBackendMap.get(prod.codigo);
    const visualizaciones = Math.max(
      Number(prod.visualizaciones) || 0,
      Number(backRow?.visualizaciones) || 0
    );
    const cantidadVendida = localVenta
      ? localVenta.cantidadVendida
      : (Number(backRow?.cantidadVendida) || 0);
    const ingresos = localVenta
      ? localVenta.ingresos
      : (Number(backRow?.ingresos) || 0);
    const tasaConversion = visualizaciones > 0
      ? Number(((cantidadVendida / visualizaciones) * 100).toFixed(2))
      : 0;

    detalleProductos.push({
      codigo: prod.codigo,
      nombre: prod.nombre,
      categoria: prod.categoria || 'Sin Categoría',
      origen: prod.atributo || 'V Región',
      precio: Number(prod.precio) || 0,
      stockActual: Number(prod.stock) || 0,
      visualizaciones,
      cantidadVendida,
      ingresos,
      tasaConversion
    });
  });

  // Incluir productos presentes solo en órdenes/backend histórico si no están en catálogo actual
  ventasPorCodigo.forEach((v, codigo) => {
    if (!codigosVistos.has(codigo)) {
      detalleProductos.push({
        codigo,
        nombre: v.nombre,
        categoria: 'Otros',
        origen: 'V Región',
        precio: 0,
        stockActual: 0,
        visualizaciones: 0,
        cantidadVendida: v.cantidadVendida,
        ingresos: v.ingresos,
        tasaConversion: 0
      });
    }
  });

  const totalVisualizacionesLocal = detalleProductos.reduce((acc, p) => acc + p.visualizaciones, 0);
  const totalVisualizaciones = Math.max(
    totalVisualizacionesLocal,
    Number(dashboardStats?.totalVisualizaciones) || 0
  );

  const ordenadoPorVentas = [...detalleProductos].sort((a, b) => b.cantidadVendida - a.cantidadVendida);
  const topVendido = ordenadoPorVentas[0];

  const ordenadoPorVistas = [...detalleProductos].sort((a, b) => b.visualizaciones - a.visualizaciones);
  const topVisto = ordenadoPorVistas[0];

  const totalOrdenes = dashboardStats?.totalOrdenes ?? ordenesActivas.length;
  const totalIngresos = dashboardStats?.totalIngresos ?? ingresosCalculados;
  const totalUnidadesVendidas = dashboardStats?.totalUnidadesVendidas ?? unidadesCalculadas;

  const tasaConversionGlobal = totalVisualizaciones > 0
    ? Number(((totalUnidadesVendidas / totalVisualizaciones) * 100).toFixed(2))
    : 0;

  return {
    totalIngresos,
    totalOrdenes,
    totalUnidadesVendidas,
    totalVisualizaciones,
    tasaConversionGlobal,
    ticketPromedio: ordenesActivas.length > 0 ? Math.round(ingresosCalculados / ordenesActivas.length) : 0,
    productoMasVendido: topVendido && topVendido.cantidadVendida > 0
      ? `${topVendido.nombre} (${topVendido.cantidadVendida} unid.)`
      : (productos[0]?.nombre || 'Sin ventas registradas'),
    productoMasVisto: topVisto && topVisto.visualizaciones > 0
      ? `${topVisto.nombre} (${topVisto.visualizaciones} vistas)`
      : 'Sin visualizaciones registradas',
    detalleProductos,
    ordenesActivas
  };
}

const escaparCsv = (val) => {
  const txt = String(val ?? '').replace(/"/g, '""');
  return `"${txt}"`;
};

/**
 * Genera el contenido CSV detallado con BOM UTF-8 (compatible con Excel),
 * incluyendo resumen ejecutivo, detalle de ventas/visualizaciones por producto e historial de órdenes.
 */
export function generarCsvEstadisticasDetalladas(stats, usuarioNombre = 'Vendedor/Admin') {
  const fechaEmision = new Date().toISOString();
  const lineas = [];

  lineas.push('REPORTE DETALLADO DE VENTAS Y VISUALIZACIONES - HUERTOHOGAR');
  lineas.push(`Generado por,${escaparCsv(usuarioNombre)},Fecha,${escaparCsv(fechaEmision)}`);
  lineas.push('');
  lineas.push('RESUMEN EJECUTIVO');
  lineas.push('Metrica,Valor');
  lineas.push(`Ingresos Totales (CLP),${stats.totalIngresos}`);
  lineas.push(`Ordenes Activas,${stats.totalOrdenes}`);
  lineas.push(`Unidades Vendidas,${stats.totalUnidadesVendidas}`);
  lineas.push(`Visualizaciones Totales de Productos,${stats.totalVisualizaciones}`);
  lineas.push(`Tasa de Conversion Global (%),${stats.tasaConversionGlobal}%`);
  lineas.push(`Ticket Promedio (CLP),${stats.ticketPromedio}`);
  lineas.push(`Producto Mas Vendido,${escaparCsv(stats.productoMasVendido)}`);
  lineas.push(`Producto Mas Visto,${escaparCsv(stats.productoMasVisto)}`);
  lineas.push('');
  lineas.push('DETALLE POR PRODUCTO (VENTAS Y VISUALIZACIONES)');
  lineas.push('Codigo,Producto,Categoria,Origen (V Region),Precio Unitario (CLP),Stock Actual,Visualizaciones,Unidades Vendidas,Ingresos Generados (CLP),Tasa Conversion (%)');

  (stats.detalleProductos || []).forEach((p) => {
    lineas.push([
      escaparCsv(p.codigo),
      escaparCsv(p.nombre),
      escaparCsv(p.categoria),
      escaparCsv(p.origen),
      p.precio,
      p.stockActual,
      p.visualizaciones,
      p.cantidadVendida,
      p.ingresos,
      `${p.tasaConversion}%`
    ].join(','));
  });

  lineas.push('');
  lineas.push('HISTORIAL DE ORDENES');
  lineas.push('ID Orden,Fecha,Cliente,Email,Destino,Estado,Total (CLP),Detalle Productos');

  (stats.ordenesActivas || []).forEach((o) => {
    const detalleTexto = (o.detalles || [])
      .map(d => `${d.cantidad}x ${d.nombreProducto || d.codigoProducto}`)
      .join(' | ');
    lineas.push([
      escaparCsv(`HH-${String(o.id).padStart(6, '0')}`),
      escaparCsv(o.fecha || ''),
      escaparCsv(o.nombreCliente || 'Cliente'),
      escaparCsv(o.emailCliente || ''),
      escaparCsv(`${o.comunaDestino || ''}, ${o.regionDestino || ''}`),
      escaparCsv(o.estado || 'CONFIRMADA'),
      Number(o.total) || 0,
      escaparCsv(detalleTexto)
    ].join(','));
  });

  return '\uFEFF' + lineas.join('\n');
}
