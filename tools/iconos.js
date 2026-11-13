// Genera el icono (un rayo dentro de un escudo) en SVG y en los tamaños PNG
// de la PWA, sin dependencias. Uso: node tools/iconos.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const dir = path.join(__dirname, '..', 'icons');
fs.mkdirSync(dir, { recursive: true });

const TINTA = '#111111';
const ROJO = '#e63946';
const AMARILLO = '#ffd60a';

// El dibujo se define en un lienzo de 512 x 512.
// Escudo: mitad derecha (el lado curvo es una curva de Bézier) y su espejo.
function escudo() {
  const derecha = [[256, 36], [436, 92], [436, 262]];
  const [p0, p1, p2] = [[436, 262], [424, 404], [256, 480]];
  for (let i = 1; i <= 12; i++) {
    const t = i / 12;
    derecha.push([0, 1].map(k => (1 - t) ** 2 * p0[k] + 2 * (1 - t) * t * p1[k] + t ** 2 * p2[k]));
  }
  const izquierda = derecha.slice(1, -1).reverse().map(([x, y]) => [512 - x, y]);
  return [...derecha, ...izquierda];
}

const escalar = (puntos, f, cx = 256, cy = 262) =>
  puntos.map(([x, y]) => [cx + (x - cx) * f, cy + (y - cy) * f]);

const RAYO = escalar([[300, 96], [168, 286], [244, 286], [208, 424], [346, 222], [268, 222]], 0.86, 256, 256);

// Capas de abajo arriba. "borde" engorda la forma esos píxeles (contorno).
const CAPAS = [
  { puntos: escudo(), color: TINTA },
  { puntos: escalar(escudo(), 0.88), color: ROJO },
  { puntos: RAYO, color: TINTA, borde: 16 },
  { puntos: RAYO, color: AMARILLO },
];

// ---------- SVG ----------

const lista = puntos => puntos.map(p => p.map(n => Math.round(n * 10) / 10).join(',')).join(' ');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <title>PowerPick</title>
  <polygon points="${lista(CAPAS[0].puntos)}" fill="${TINTA}"/>
  <polygon points="${lista(CAPAS[1].puntos)}" fill="${ROJO}"/>
  <polygon points="${lista(RAYO)}" fill="${AMARILLO}" stroke="${TINTA}" stroke-width="32" stroke-linejoin="round" paint-order="stroke"/>
</svg>
`;
fs.writeFileSync(path.join(dir, 'icono.svg'), svg);

// ---------- PNG ----------

function dentro(puntos, x, y) {
  let d = false;
  for (let i = 0, j = puntos.length - 1; i < puntos.length; j = i++) {
    const [xi, yi] = puntos[i];
    const [xj, yj] = puntos[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) d = !d;
  }
  return d;
}

function cercaDelBorde(puntos, x, y, distancia) {
  for (let i = 0, j = puntos.length - 1; i < puntos.length; j = i++) {
    const [ax, ay] = puntos[j];
    const [bx, by] = puntos[i];
    const t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / ((bx - ax) ** 2 + (by - ay) ** 2)));
    if (Math.hypot(x - ax - t * (bx - ax), y - ay - t * (by - ay)) <= distancia) return true;
  }
  return false;
}

const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));

// Pinta el icono. Con fondo, el dibujo se encoge para caber en la zona
// segura de los iconos "maskable" (el sistema puede recortar los bordes).
function pintar(tamano, fondo) {
  const escala = fondo ? 0.72 : 1;
  const MUESTRAS = 3; // suavizado de bordes
  const pixeles = Buffer.alloc(tamano * tamano * 4);
  for (let py = 0; py < tamano; py++) {
    for (let px = 0; px < tamano; px++) {
      const suma = [0, 0, 0, 0];
      for (let sy = 0; sy < MUESTRAS; sy++) {
        for (let sx = 0; sx < MUESTRAS; sx++) {
          // Coordenadas de la muestra en el lienzo de 512.
          const x = 256 + ((px + (sx + 0.5) / MUESTRAS) / tamano * 512 - 256) / escala;
          const y = 256 + ((py + (sy + 0.5) / MUESTRAS) / tamano * 512 - 256) / escala;
          let color = fondo ? rgb(fondo) : null;
          for (const capa of CAPAS) {
            if (dentro(capa.puntos, x, y) || (capa.borde && cercaDelBorde(capa.puntos, x, y, capa.borde))) {
              color = rgb(capa.color);
            }
          }
          if (color) {
            suma[0] += color[0]; suma[1] += color[1]; suma[2] += color[2]; suma[3] += 1;
          }
        }
      }
      const i = (py * tamano + px) * 4;
      if (suma[3]) {
        pixeles[i] = suma[0] / suma[3];
        pixeles[i + 1] = suma[1] / suma[3];
        pixeles[i + 2] = suma[2] / suma[3];
        pixeles[i + 3] = suma[3] / (MUESTRAS * MUESTRAS) * 255;
      }
    }
  }
  return pixeles;
}

function png(tamano, pixeles) {
  const trozo = (tipo, datos) => {
    const cuerpo = Buffer.concat([Buffer.from(tipo), datos]);
    const largo = Buffer.alloc(4);
    largo.writeUInt32BE(datos.length);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(zlib.crc32(cuerpo));
    return Buffer.concat([largo, cuerpo, crc]);
  };
  const cabecera = Buffer.alloc(13);
  cabecera.writeUInt32BE(tamano, 0);
  cabecera.writeUInt32BE(tamano, 4);
  cabecera.set([8, 6, 0, 0, 0], 8); // 8 bits, RGBA
  // Cada fila empieza con un byte de filtro (0 = ninguno).
  const filas = Buffer.alloc(tamano * (tamano * 4 + 1));
  for (let y = 0; y < tamano; y++) {
    pixeles.copy(filas, y * (tamano * 4 + 1) + 1, y * tamano * 4, (y + 1) * tamano * 4);
  }
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    trozo('IHDR', cabecera),
    trozo('IDAT', zlib.deflateSync(filas, { level: 9 })),
    trozo('IEND', Buffer.alloc(0)),
  ]);
}

[
  ['icono-192.png', 192, null],
  ['icono-512.png', 512, null],
  ['icono-maskable-512.png', 512, AMARILLO],
  ['icono-apple-180.png', 180, AMARILLO],
].forEach(([nombre, tamano, fondo]) => {
  fs.writeFileSync(path.join(dir, nombre), png(tamano, pintar(tamano, fondo)));
  console.log(nombre);
});
