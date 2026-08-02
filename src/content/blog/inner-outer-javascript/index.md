---
title: Diferencia entre innerHTML, outerHTML, innerText y outerText en Javascript
description: Las siguientes propiedades sirven para seleccionar y/o reemplazar un elemento HTML o su contenido. Selecciona elementos internos Las propiedades innerHTML y innerText sirven para seleccionar o reemplazar el CONTENIDO INT
publishedAt: '2023-11-09T18:14:15'
updatedAt: '2024-12-22T15:28:55'
featuredImageAlt: ''
categories:
  - Guías HTML, CSS y JS
readingTime: 3
sourceUrl: https://diegoamorin.com/inner-outer-javascript/
---

Las siguientes propiedades sirven para seleccionar y/o reemplazar un elemento HTML o su contenido.

## Selecciona elementos internos

Las propiedades `innerHTML` y `innerText` sirven para seleccionar o reemplazar el CONTENIDO INTERNO de un elemento HTML seleccionado.

### innerHTML

Con esta propiedad puedes seleccionar o asignar contenido HTML a un elemento. Por ejemplo, tenemos lo siguiente:

```xml
<div class="mi-contenedor">
    <h1>Hola a todos</h1>
</div>
```

Seleccionamos a «.mi-contenedor» y asignamos contenido a través de `innerHTML`

```javascript
const contenedor = document.querySelector('.mi-contenedor');
contenedor.innerHTML = '<span>Adiós a todos</span>';
```

Y el HTML se actualiza a:

```xml
<div class="mi-contenedor">
    <span>Adiós a todos</span>
</div>
```

Como puedes apreciar, el contenido interno es el que se actualiza.

### innerText

Cuando se accede a `innerText`, solo se recupera el texto visible dentro del elemento, excluyendo las etiquetas HTML y su contenido. Sin embargo, al asignar un valor a `innerText`, se produce una modificación directa del contenido del elemento, sustituyendo todo su contenido, incluyendo cualquier HTML interno que pueda existir: etiquetas, [entidades](https://developer.mozilla.org/es/docs/Glossary/Entity), etc.

Para esta propiedad haré 2 ejemplos para tenerlo más claro. Uno de recuperar contenido y otro de asignar contenido.

**Ejemplo 1: Recuperar contenido con** `innerText`

Tenemos el siguiente HTML

```xml
<div class="mi-contenedor">
    <h1>&copy; Copyright <span>2019</span></h1>
</div>
```

Seleccionamos «.mi-contenedor» y vemos el texto interior a través de `innerText`

```javascript
const contenedor = document.querySelector('.mi-contenedor');
console.log(contenedor.innerText);
```

La salida en consola será:

```
© Copyright 2019
```

**Ejemplo 2: Asignar contenido a través de** `innerText`

Tenemos el siguiente HTML

```xml
<div class="mi-contenedor">
    <h1>Hola a todos</h1>
</div>
```

Seleccionamos a «.mi-contenedor» y asignamos contenido a través de `innerText`.

```javascript
const contenedor = document.querySelector('.mi-contenedor');
contenedor.innerText = '<span>Adiós a todos</span>';
```

Esta propiedad espera texto, así que si le metes HTML (lo hago para ver todas las posibilidades), no lo procesará como HTML, y verás el texto con las etiquetas en el navegador.

```bash
<span>Adiós a todos</span>
```

Y el HTML se actualiza a lo siguiente.

```xml
<div class="mi-contenedor">
  &lt;span&gt;Adiós a todos&lt;/span&gt;
</div>
```

## Selecciona todo el elemento

A diferencia de las propiedades anteriores. Las propiedades `outerHTML` y `outerText`, no solo seleccionan los hijos sino también al elemento que las contiene.

### outerHTML

Tenemos el siguiente HTML

```xml
<div class="mi-contenedor">
    <h1>Hola a todos</h1>
</div>
```

Seleccionamos a «.mi-contenedor» y asignamos contenido a través de `outerHTML`.

```javascript
const contenedor = document.querySelector('.mi-contenedor');
contenedor.outerHTML = '<span>Adiós a todos</span>';
```

Todo el HTML anterior se reemplaza por:

```xml
<span>Adiós a todos</span>
```

Como puedes ver, el `outerHTML` incluye al contenedor, no solo al contenido. Entonces, al asignarle el nuevo HTML, cambia todo el elemento.

### outerText

Tiene el mismo concepto del `innerText`, lo único que cambia aquí es el alcance. Tenemos el siguiente HTML:

```xml
<div class="mi-contenedor">
    <h1>Hola a todos</h1>
</div>
```

Seleccionamos a «.mi-contenedor» y asignamos contenido a través de `outerText`.

```javascript
const contenedor = document.querySelector('.mi-contenedor');
contenedor.outerText = '<span>Adiós a todos</span>';
```

Todo el HTML anterior se reemplazaría por una cadena de texto:

```xml
&lt;span&gt;Adiós a todos&lt;/span&gt;
```

## Consideraciones de seguridad

Si solo vas a seleccionar o agregar texto no uses `innerHTML` y `outerHTML`, ya que estas propiedades permiten agregar HTML, eso quiere decir que pueden agregar Javascript dentro de HTML, y modificar el comportamiento de tu web.

Te recomiento investigar sobre [Cross-site scripting](https://es.wikipedia.org/wiki/Cross-site_scripting).
