// Tarjeta del equipo del Draft como imagen PNG descargable.

const FUENTE_TITULOS = 'Impact, Haettenschweiler, "Arial Narrow Bold", "Arial Black", sans-serif';
const FUENTE_TEXTO = '"Trebuchet MS", "Segoe UI", Arial, sans-serif';

// Carga una imagen para el lienzo; si falla (sin internet) usa el retrato genérico.
function cargarImagen(url) {
  return new Promise(resolver => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolver(img);
    img.onerror = () => {
      if (img.src === SIN_FOTO) { resolver(null); return; }
      img.src = SIN_FOTO;
    };
    img.src = url;
  });
}

// Rectángulo de viñeta: sombra dura, relleno y borde negro.
function vinetaLienzo(ctx, x, y, ancho, alto, color, borde = 8, sombra = 12) {
  ctx.fillStyle = '#111';
  ctx.fillRect(x + sombra, y + sombra, ancho, alto);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, ancho, alto);
  ctx.lineWidth = borde;
  ctx.strokeStyle = '#111';
  ctx.strokeRect(x, y, ancho, alto);
}

// Escribe un texto encogiendo la letra hasta que quepa en el ancho dado.
function textoAjustado(ctx, texto, x, y, anchoMax, tamano, fuente, peso = '400') {
  do {
    ctx.font = peso + ' ' + tamano + 'px ' + fuente;
    tamano -= 2;
  } while (ctx.measureText(texto).width > anchoMax && tamano > 12);
  ctx.fillText(texto, x, y, anchoMax);
}

async function dibujarTarjeta(titulo, equipo, puntos) {
  const ANCHO = 1080;
  const ALTO = 1150;
  const lienzo = document.createElement('canvas');
  lienzo.width = ANCHO;
  lienzo.height = ALTO;
  const ctx = lienzo.getContext('2d');
  ctx.textAlign = 'center';

  // Fondo amarillo con trama de puntos.
  ctx.fillStyle = '#ffd60a';
  ctx.fillRect(0, 0, ANCHO, ALTO);
  ctx.fillStyle = 'rgba(0, 0, 0, .14)';
  for (let y = 14; y < ALTO; y += 28) {
    for (let x = 14; x < ANCHO; x += 28) {
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Cabecera con el nombre de la app.
  ctx.fillStyle = '#e63946';
  ctx.fillRect(0, 0, ANCHO, 170);
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 170, ANCHO, 8);
  ctx.font = '400 120px ' + FUENTE_TITULOS;
  const anchoPower = ctx.measureText('POWER').width;
  const inicio = (ANCHO - ctx.measureText('POWERPICK').width) / 2;
  ctx.textAlign = 'left';
  [['POWER', '#ffd60a', inicio], ['PICK', '#fff', inicio + anchoPower]].forEach(([texto, color, x]) => {
    ctx.fillStyle = '#111';
    ctx.fillText(texto, x + 6, 136);
    ctx.fillStyle = color;
    ctx.fillText(texto, x, 130);
  });
  ctx.textAlign = 'center';

  // Panel del equipo.
  vinetaLienzo(ctx, 40, 215, 1000, 840, '#fffdf5');
  ctx.fillStyle = '#111';
  ctx.font = '400 64px ' + FUENTE_TITULOS;
  ctx.fillText(titulo.toUpperCase(), ANCHO / 2, 300);

  const imagenes = await Promise.all(equipo.map(h => cargarImagen(h.imagen)));
  const FOTO_ANCHO = 176;
  const FOTO_ALTO = 220;
  equipo.forEach((heroe, i) => {
    const x = 60 + i * (FOTO_ANCHO + 20);
    const y = 335;
    const img = imagenes[i];
    ctx.fillStyle = '#2ec4f1';
    ctx.fillRect(x, y, FOTO_ANCHO, FOTO_ALTO);
    if (img) {
      // Recorte que llena el hueco, pegado a la parte de arriba de la foto.
      const escala = Math.max(FOTO_ANCHO / img.width, FOTO_ALTO / img.height);
      const anchoOrigen = FOTO_ANCHO / escala;
      ctx.drawImage(img, (img.width - anchoOrigen) / 2, 0, anchoOrigen, FOTO_ALTO / escala,
        x, y, FOTO_ANCHO, FOTO_ALTO);
    }
    ctx.lineWidth = 6;
    ctx.strokeRect(x, y, FOTO_ANCHO, FOTO_ALTO);
    ctx.fillStyle = '#111';
    textoAjustado(ctx, heroe.nombre, x + FOTO_ANCHO / 2, y + FOTO_ALTO + 36, FOTO_ANCHO, 28, FUENTE_TEXTO, 'bold');
  });

  // Total.
  vinetaLienzo(ctx, 190, 635, 700, 130, '#ffd60a', 6, 8);
  ctx.fillStyle = '#111';
  ctx.font = '400 96px ' + FUENTE_TITULOS;
  ctx.fillText(puntos.total + ' PUNTOS', ANCHO / 2, 735);

  // Desglose en tres columnas.
  [['Base', puntos.base], ['Equilibrio', conSigno(puntos.equilibrio)], ['Sinergias', conSigno(puntos.sinergias)]]
    .forEach(([nombre, valor], i) => {
      const x = 215 + i * 325;
      ctx.font = 'bold 30px ' + FUENTE_TEXTO;
      ctx.fillText(nombre, x, 830);
      ctx.font = '400 60px ' + FUENTE_TITULOS;
      ctx.fillText(valor, x, 892);
    });

  // Explicación de bonus y penalizaciones (caben cuatro líneas).
  puntos.detalles.slice(0, 4).forEach((detalle, i) => {
    textoAjustado(ctx, detalle, ANCHO / 2, 942 + i * 32, 940, 26, FUENTE_TEXTO);
  });

  ctx.font = 'bold 26px ' + FUENTE_TEXTO;
  ctx.fillText('App de fan no oficial · peter1323.github.io/PowerPick', ANCHO / 2, 1115);
  return lienzo;
}

async function descargarTarjeta(titulo, equipo, puntos) {
  const lienzo = await dibujarTarjeta(titulo, equipo, puntos);
  lienzo.toBlob(blob => {
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.download = 'powerpick-equipo.png';
    enlace.click();
    setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
  }, 'image/png');
}
