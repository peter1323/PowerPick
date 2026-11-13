// Servidor local mínimo para probar la app. Uso: node tools/servidor.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const TIPOS = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.json': 'application/json', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.png': 'image/png',
};

http.createServer((req, res) => {
  let ruta = decodeURIComponent(req.url.split('?')[0]);
  if (ruta.endsWith('/')) ruta += 'index.html';
  const archivo = path.join(raiz, ruta);
  // No servir nada fuera de la carpeta del proyecto.
  if (!archivo.startsWith(raiz + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(archivo, (error, datos) => {
    if (error) { res.writeHead(404).end('No encontrado'); return; }
    res.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo)] || 'application/octet-stream' });
    res.end(datos);
  });
}).listen(8123, '127.0.0.1', () => console.log('http://localhost:8123'));
