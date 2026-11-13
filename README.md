<p align="center">
  <img src="icons/icono.svg" alt="Icono de PowerPick: un rayo dentro de un escudo" width="140">
</p>

<h1 align="center">PowerPick</h1>

<p align="center">Elige bien: los números mandan.</p>

## Qué es

PowerPick es un juego de superhéroes para el navegador basado en los atributos de cada personaje: inteligencia, fuerza, velocidad, resistencia, poder y combate. Se puede instalar en el móvil o en el ordenador y jugar sin internet.

## Jugar

**<https://peter1323.github.io/PowerPick/>**

## Los dos modos

### Más o menos

Sale un personaje con un atributo a la vista y otro con el número oculto. Tienes que decir si el segundo tiene más o menos. Si aciertas, el segundo pasa a ser la referencia, sale uno nuevo y cambia el atributo. Si fallas, se acaba la partida. El empate cuenta como acierto.

Incluye un **reto diario**: una secuencia igual para todo el mundo ese día, con un solo intento.

### Draft

Para un jugador, o para dos pasando el móvil. Son 5 rondas: en cada una salen 3 personajes y fichas a uno; los descartados no vuelven a salir. Al final se puntúa el equipo:

| Concepto | Regla | Puntos |
|---|---|---|
| Base | Suma de los seis atributos de los cinco personajes | hasta 3000 |
| Equilibrio | Los seis atributos con media de equipo de 60 o más | +200 |
| Equilibrio | Los seis con media de 50 o más, si no llega a 60 | +100 |
| Equilibrio | Por cada atributo con media por debajo de 35 | −75 |
| Sinergia | Todos de la misma editorial | +250 |
| Sinergia | Todos villanos | +200 |
| Sinergia | Todos héroes | +150 |

La pantalla de resultado enseña el equipo, el desglose de puntos y, con dos jugadores, quién gana. El equipo se puede descargar como imagen para compartirlo.

## Características

- 556 personajes con foto, ficha y seis atributos.
- Filtro común a los dos modos: todos, solo Marvel, solo DC o solo villanos.
- Perfil con el récord de racha, el mejor equipo del Draft y las partidas jugadas, con un botón para borrar los datos.
- Modo claro y modo oscuro.
- Sin cuentas ni servidor: todo se guarda en tu dispositivo.
- Instalable como aplicación y jugable sin internet una vez cargada. Las fotos de los personajes se guardan según las vas viendo.
- Hecho con HTML, CSS y JavaScript, sin frameworks.

## Origen de los datos

Los datos y las imágenes de los personajes vienen de [akabab/superhero-api](https://github.com/akabab/superhero-api), publicada bajo licencia MIT (© 2018 Yoann Cribier). El archivo original está en `data/all.json` y la versión filtrada que usa el juego, en `data/heroes.json`.

## Aviso

PowerPick es una app de fan no oficial. No tiene relación con Marvel, DC ni ninguna otra editorial, ni está patrocinada o aprobada por ellas. Los personajes, nombres e imágenes pertenecen a sus respectivos dueños.

---

Creado por [peter1323](https://github.com/peter1323)
