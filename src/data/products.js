export const UBICACIONES_ORIGEN = [
  'Quillota, V Región',
  'Limache, V Región',
  'Olmué, V Región',
  'Hijuelas, V Región',
  'La Cruz, V Región',
  'La Calera, V Región',
  'Valle de Aconcagua, San Felipe',
  'San Felipe, V Región',
  'Los Andes, V Región',
  'Casablanca, V Región',
  'Valparaíso, V Región',
  'Viña del Mar, V Región',
  'Quilpué, V Región',
  'Villa Alemana, V Región',
  'Concón, V Región',
  'San Antonio, V Región',
  'Petorca, V Región',
  'La Ligua, V Región',
  'Cabildo, V Región',
  'Putaendo, V Región',
  'Llay-Llay, V Región',
  'Catemu, V Región',
  'Panquehue, V Región',
  'Nogales, V Región',
  'Santo Domingo, V Región',
  'Isla de Pascua, V Región'
];

const LOCALIDADES_QUINTA_REGION = [
  'valparaiso',
  'vina del mar',
  'concon',
  'casablanca',
  'quintero',
  'puchuncavi',
  'juan fernandez',
  'isla de pascua',
  'rapa nui',
  'los andes',
  'calle larga',
  'rinconada',
  'san esteban',
  'la ligua',
  'cabildo',
  'papudo',
  'petorca',
  'zapallar',
  'quillota',
  'la calera',
  'calera',
  'hijuelas',
  'la cruz',
  'nogales',
  'san antonio',
  'algarrobo',
  'cartagena',
  'el quisco',
  'el tabo',
  'santo domingo',
  'san felipe',
  'catemu',
  'llay llay',
  'llay-llay',
  'llaillay',
  'panquehue',
  'putaendo',
  'santa maria',
  'aconcagua',
  'quilpue',
  'limache',
  'olmue',
  'villa alemana',
  'marga marga',
  'placilla',
  'curauma',
  'renaca'
];

const REGIONES_Y_PAISES_EXCLUIDOS = [
  'santiago',
  'metropolitana',
  'melipilla',
  'curacavi',
  'maipu',
  'providencia',
  'puente alto',
  'maule',
  'talca',
  'curico',
  'linares',
  'ohiggins',
  "o'higgins",
  'rancagua',
  'colchagua',
  'paredones',
  'coquimbo',
  'elqui',
  'serena',
  'ovalle',
  'arica',
  'azapa',
  'parinacota',
  'tarapaca',
  'iquique',
  'antofagasta',
  'calama',
  'atacama',
  'copiapo',
  'huasco',
  'biobio',
  'concepcion',
  'talcahuano',
  'nuble',
  'chillan',
  'araucania',
  'temuco',
  'villarrica',
  'pucon',
  'angol',
  'los rios',
  'valdivia',
  'los lagos',
  'osorno',
  'puerto montt',
  'puerto varas',
  'chiloe',
  'castro',
  'aysen',
  'coyhaique',
  'magallanes',
  'punta arenas',
  'peru',
  'argentina',
  'mendoza',
  'bolivia',
  'brasil',
  'ecuador',
  'colombia',
  'mexico',
  'espana',
  'estados unidos',
  'china',
  'vitamina',
  'potasio',
  'hidroponico',
  'invernadero'
];

/**
 * Valida que el origen ingresado pertenezca exclusivamente a la V Región de Valparaíso.
 */
export const esOrigenValidoQuintaRegion = (texto = '') => {
  const limpio = texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  if (!limpio || limpio.length < 3) return false;

  // Rechazar si menciona otra región de Chile, otro país o texto no geográfico
  const contieneExcluido = REGIONES_Y_PAISES_EXCLUIDOS.some(excl => limpio.includes(excl));
  if (contieneExcluido) return false;

  // Debe coincidir con al menos una comuna o valle de la 5ª Región
  return LOCALIDADES_QUINTA_REGION.some(loc => limpio.includes(loc));
};

// Mapa de corrección para atributos antiguos o de otras regiones hacia la V Región
export const MAPA_CORRECCION_ORIGEN = {
  'Valle del Maule': 'Valle de Aconcagua, San Felipe',
  'Ricas en Vitamina C': 'Hijuelas, V Región',
  'Valle del Elqui, Coquimbo': 'Hijuelas, V Región',
  'Ricos en Potasio': 'Isla de Pascua, V Región',
  'Valle de Azapa, Arica': 'Isla de Pascua, V Región',
  "Región de O'Higgins": 'Limache, V Región',
  'Cultivo Hidropónico': 'Olmué, V Región',
  'Curacaví, Región Metropolitana': 'Olmué, V Región',
  'Invernaderos Solares': 'Quillota, V Región',
  'Quillota, Región de Valparaíso': 'Quillota, V Región',
  'Bosque Nativo del Sur': 'Casablanca, V Región',
  'Villarrica, Región de La Araucanía': 'Casablanca, V Región',
  'Grano Andino Ancestral': 'Petorca, V Región',
  'Altiplano de Tarapacá': 'Petorca, V Región'
};

export const normalizarOrigenProducto = (producto) => {
  if (!producto) return producto;
  const origenActual = (producto.atributo || '').trim();
  if (MAPA_CORRECCION_ORIGEN[origenActual]) {
    return {
      ...producto,
      atributo: MAPA_CORRECCION_ORIGEN[origenActual]
    };
  }
  if (!esOrigenValidoQuintaRegion(origenActual)) {
    return {
      ...producto,
      atributo: 'Quillota, V Región'
    };
  }
  return {
    ...producto,
    atributo: origenActual
  };
};

export const CATALOGO_PRODUCTOS = [
  {
    codigo: 'FR001',
    nombre: 'Manzanas Fuji',
    categoria: 'Frutas Frescas',
    precio: 1200,
    unidad: 'kilo',
    stock: 150,
    atributo: 'Valle de Aconcagua, San Felipe',
    descripcion: 'Manzanas Fuji crujientes y dulces, cultivadas en el Valle de Aconcagua (V Región). Perfectas para meriendas saludables o repostería natural.',
    imagen: 'assets/img/manzanas.svg'
  },
  {
    codigo: 'FR002',
    nombre: 'Naranjas Valencia',
    categoria: 'Frutas Frescas',
    precio: 1000,
    unidad: 'kilo',
    stock: 200,
    atributo: 'Hijuelas, V Región',
    descripcion: 'Jugosas y aromáticas, estas naranjas Valencia cosechadas en Hijuelas son ideales para zumos frescos matutinos.',
    imagen: 'assets/img/naranjas.svg'
  },
  {
    codigo: 'FR003',
    nombre: 'Plátanos Cavendish',
    categoria: 'Frutas Frescas',
    precio: 800,
    unidad: 'kilo',
    stock: 250,
    atributo: 'Isla de Pascua, V Región',
    descripcion: 'Plátanos maduros y dulces de la V Región, perfectos para el desayuno, batidos o como snack energético para deportistas y niños.',
    imagen: 'assets/img/platanos.svg'
  },
  {
    codigo: 'VR001',
    nombre: 'Zanahorias Orgánicas',
    categoria: 'Verduras Orgánicas',
    precio: 900,
    unidad: 'kilo',
    stock: 100,
    atributo: 'Limache, V Región',
    descripcion: 'Zanahorias crujientes cultivadas sin pesticidas en los fértiles suelos de Limache. Excelente fuente de betacarotenos y fibra.',
    imagen: 'assets/img/zanahorias.svg'
  },
  {
    codigo: 'VR002',
    nombre: 'Espinacas Frescas',
    categoria: 'Verduras Orgánicas',
    precio: 700,
    unidad: 'bolsa 500g',
    stock: 80,
    atributo: 'Olmué, V Región',
    descripcion: 'Hojas tiernas y nutritivas de espinaca recién cosechada en Olmué. Ideales para ensaladas crudas, salteados o batidos verdes détox.',
    imagen: 'assets/img/espinacas.svg'
  },
  {
    codigo: 'VR003',
    nombre: 'Pimientos Tricolores',
    categoria: 'Verduras Orgánicas',
    precio: 1500,
    unidad: 'malla 3 un.',
    stock: 60,
    atributo: 'Quillota, V Región',
    descripcion: 'Trío de pimientos rojo, amarillo y verde cosechados en Quillota. Aportan color, textura crocante y alto contenido de antioxidantes.',
    imagen: 'assets/img/pimientos.svg'
  },
  {
    codigo: 'PO001',
    nombre: 'Miel Orgánica',
    categoria: 'Productos Orgánicos',
    precio: 5000,
    unidad: 'frasco 500g',
    stock: 45,
    atributo: 'Casablanca, V Región',
    descripcion: 'Miel pura de abeja cosechada en apiarios sustentables del valle de Casablanca (V Región). 100% natural, sin aditivos ni azúcares añadidos.',
    imagen: 'assets/img/miel.svg'
  },
  {
    codigo: 'PO003',
    nombre: 'Quinua Orgánica',
    categoria: 'Productos Orgánicos',
    precio: 3200,
    unidad: 'bolsa 1kg',
    stock: 75,
    atributo: 'Petorca, V Región',
    descripcion: 'Quinua blanca prelavada de cultivo ecológico en Petorca (V Región). Superalimento completo con los 9 aminoácidos esenciales, libre de gluten.',
    imagen: 'assets/img/quinua.svg'
  }
];

export const CATEGORIAS = ['Todas', 'Frutas Frescas', 'Verduras Orgánicas', 'Productos Orgánicos'];

