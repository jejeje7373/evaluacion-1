export const ESTACIONES_TEMPORADA = [
  {
    id: 'primavera',
    nombre: 'Primavera',
    meses: 'Septiembre - Noviembre',
    icono: 'bi-flower1',
    descripcion: 'Brotes tiernos, hojas verdes y frutas frescas de primavera en la V Region.',
    keywords: ['espinaca', 'pimiento', 'manzana', 'platano', 'lechuga', 'frutilla', 'arandano'],
    offset: 0
  },
  {
    id: 'verano',
    nombre: 'Verano',
    meses: 'Diciembre - Febrero',
    icono: 'bi-sun',
    descripcion: 'Cosecha de sol: frutas dulces, pimientos, miel y granos de verano.',
    keywords: ['pimiento', 'platano', 'miel', 'quinua', 'durazno', 'tomate', 'sandia', 'frutilla'],
    offset: 2
  },
  {
    id: 'otono',
    nombre: 'Otoño',
    meses: 'Marzo - Mayo',
    icono: 'bi-tree',
    descripcion: 'Frutas de guarda, raices organicas, miel pura y granos andinos de otono.',
    keywords: ['manzana', 'zanahoria', 'quinua', 'miel', 'palta', 'nuez', 'pera', 'zapallo'],
    offset: 4
  },
  {
    id: 'invierno',
    nombre: 'Invierno',
    meses: 'Junio - Agosto',
    icono: 'bi-snow',
    descripcion: 'Citricos ricos en vitamina C, zanahorias de invierno y miel organica.',
    keywords: ['naranja', 'zanahoria', 'miel', 'espinaca', 'limon', 'kiwi', 'papa'],
    offset: 6
  }
];

function normalizarTexto(texto = '') {
  return String(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function obtenerEstacionActual(fecha = new Date()) {
  const mes = fecha.getMonth(); // 0 = Enero .. 11 = Diciembre (Hemisferio Sur)
  if (mes === 11 || mes === 0 || mes === 1) return 'verano';
  if (mes >= 2 && mes <= 4) return 'otono';
  if (mes >= 5 && mes <= 7) return 'invierno';
  return 'primavera';
}

export function obtenerInfoEstacion(estacionId = 'primavera') {
  return ESTACIONES_TEMPORADA.find((e) => e.id === estacionId) || ESTACIONES_TEMPORADA[0];
}

export function seleccionarProductosPorTemporada(productos = [], estacionId = 'primavera', limite = 4) {
  if (!Array.isArray(productos) || productos.length === 0) return [];
  if (productos.length <= limite) return productos;

  const info = obtenerInfoEstacion(estacionId);
  const total = productos.length;
  const offset = info.offset % total;

  // Rotamos el catalogo segun la estacion y priorizamos coincidencias estacionales
  const rotados = [...productos.slice(offset), ...productos.slice(0, offset)];

  const puntuados = rotados.map((prod, idx) => {
    const texto = normalizarTexto(`${prod.nombre || ''} ${prod.categoria || ''} ${prod.descripcion || ''}`);
    let score = 0;
    info.keywords.forEach((kw, kIdx) => {
      if (texto.includes(kw)) {
        score += 20 - kIdx;
      }
    });
    return { prod, score, idx };
  });

  puntuados.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.idx - b.idx;
  });

  return puntuados.slice(0, limite).map((item) => item.prod);
}
