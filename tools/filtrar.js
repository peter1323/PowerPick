// Genera data/heroes.json a partir de data/all.json (akabab/superhero-api).
// Uso: node tools/filtrar.js
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'data');
const todos = JSON.parse(fs.readFileSync(path.join(dir, 'all.json'), 'utf8'));

const ATRIBUTOS = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'];

// Razas más habituales en español; el resto se deja tal cual (son nombres propios).
const RAZAS = {
  'Human': 'Humano', 'Mutant': 'Mutante', 'Human / Radiation': 'Humano alterado por radiación',
  'Cyborg': 'Cíborg', 'God / Eternal': 'Dios / Eterno', 'Android': 'Androide', 'Symbiote': 'Simbionte',
  'Alien': 'Alienígena', 'Kryptonian': 'Kryptoniano', 'Demon': 'Demonio', 'Atlantean': 'Atlante',
  'Asgardian': 'Asgardiano', 'Cosmic Entity': 'Entidad cósmica', 'Inhuman': 'Inhumano',
  'New God': 'Nuevo Dios', 'Human / Altered': 'Humano alterado', 'Animal': 'Animal',
  'Vampire': 'Vampiro', 'Metahuman': 'Metahumano', 'Human / Cosmic': 'Humano cósmico',
  'Demi-God': 'Semidiós', 'Eternal': 'Eterno', 'Frost Giant': 'Gigante de hielo',
  'Human / Clone': 'Clon humano', 'Clone': 'Clon', 'Mutant / Clone': 'Clon mutante',
  'Martian': 'Marciano', 'Zombie': 'Zombi', 'Amazon': 'Amazona', 'Gorilla': 'Gorila',
};

// En unos 50 personajes la base trae un alias en el campo de editorial
// (por ejemplo "Superman Prime One-Million" en Superman). Se corrige aquí:
// todo lo que no sea una editorial real es de DC si el personaje está en
// esta lista, y de Marvel en caso contrario.
const EDITORIALES_REALES = /Comics|George Lucas|NBC|Star Trek|SyFy|ABC|IDW|Shueisha|Sony|Wildstorm|South Park|Universal|Rowling|Titan Books|Rebellion|Microsoft|Tolkien/;
const ALIAS_DE_DC = ['Batgirl', 'Batgirl VI', 'Batman II', 'Flash II', 'Flash III', 'Flash IV',
  'Huntress', 'Impulse', 'Misfit', 'Nightwing', 'Oracle', 'Red Hood', 'Red Robin', 'Robin',
  'Robin II', 'Robin III', 'Spectre', 'Superman'];

function editorial(p) {
  const e = texto(p.biography.publisher);
  if (!e) return 'Otra';
  if (EDITORIALES_REALES.test(e)) return e;
  return ALIAS_DE_DC.includes(p.name) ? 'DC Comics' : 'Marvel Comics';
}

// Devuelve el texto limpio o undefined si viene vacío ("", "-", "null").
function texto(valor) {
  const t = String(valor || '').trim();
  return t && t !== '-' && t !== 'null' ? t : undefined;
}

const heroes = todos
  .filter(p => {
    const s = p.powerstats || {};
    const statsOk = ATRIBUTOS.every(a => Number.isFinite(s[a]) && s[a] > 0);
    const img = p.images && p.images.md;
    return statsOk && img && !/no-portrait/.test(img);
  })
  .map(p => ({
    id: p.id,
    nombre: p.name,
    imagen: p.images.md,
    editorial: editorial(p),
    alineacion: p.biography.alignment === 'good' ? 'bueno'
      : p.biography.alignment === 'bad' ? 'malo' : 'neutral',
    // orden: inteligencia, fuerza, velocidad, resistencia, poder, combate
    stats: ATRIBUTOS.map(a => p.powerstats[a]),
    // Ficha breve (los campos vacíos no se guardan).
    real: texto(p.biography.fullName) === p.name ? undefined : texto(p.biography.fullName),
    raza: RAZAS[p.appearance.race] || texto(p.appearance.race),
    // Algunas "primeras apariciones" de la base son párrafos enteros: se omiten.
    debut: (texto(p.biography.firstAppearance) || '').length <= 70 ? texto(p.biography.firstAppearance) : undefined,
  }));

fs.writeFileSync(path.join(dir, 'heroes.json'), JSON.stringify(heroes));

const cuenta = f => heroes.filter(f).length;
console.log('Original:', todos.length, '-> Filtrados:', heroes.length);
console.log('Marvel:', cuenta(h => h.editorial === 'Marvel Comics'),
  '| DC:', cuenta(h => h.editorial === 'DC Comics'),
  '| Villanos:', cuenta(h => h.alineacion === 'malo'),
  '| Buenos:', cuenta(h => h.alineacion === 'bueno'),
  '| Neutrales:', cuenta(h => h.alineacion === 'neutral'));
console.log('Ejemplo:', JSON.stringify(heroes.find(h => h.nombre === 'Spider-Man') || heroes[0], null, 2));
