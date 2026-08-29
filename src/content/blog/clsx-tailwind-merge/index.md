---
title: ¿Por qué usar clsx y tailwind-merge junto con Tailwind CSS?
description: 'Descubre cómo combinar clsx y tailwind-merge en Tailwind CSS para gestionar clases condicionales, resolver conflictos y crear una función cn().'
publishedAt: '2024-12-06T19:54:40'
updatedAt: '2024-12-20T19:10:22'
featuredImage: ./thumb-cn-tailwind.jpg
featuredImageAlt: ¿Por qué usar clsx y tailwind-merge junto con Tailwind CSS?
categories:
  - Guías NextJS
---

Tailwind CSS tiene muchas ventajas, pero también puede complicarnos cuando intentamos sobrescribir estilos o gestionar clases condicionales demasiado largas. ¿Te ha pasado que tus nuevos estilos no se aplican o que tu clases condicionales se vuelven difíciles de leer? Hoy te enseñaré cómo solucionar estos problemas con dos librerías ligeras.

Para esta guía te recomiendo crear un proyecto de Next.js (con Typescript y Tailwind).

```bash
npx create-next-app@latest
```

## ¿Qué soluciona tailwind-merge?

Tienes un componente `Button` con clases de Tailwind, y ahora quieres utilizarlo en un componente diferente, pero asignándole nuevas clases de Tailwind. Y para tu sorpresa, algunos estilos se aplican y otros pareciera que se ignoran. ¿Por que sucede esto?

Analicemos esto definiendo los 2 componentes:

```javascript
// components/Button.tsx
type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button(props: Props) {
  return (
    <button className={`text-white bg-red-500 px-20 py-10 ${props.className}`}>
      {props.children}
    </button>
  );
};

// app/page.tsx
export default function Home() {
  return (
    <main className="flex h-screen items-center justify-center">
      <Button className="bg-blue-700 p-2">
        Click Me
      </Button>
    </main>
  );
}
```

Quieres aplicar los estilos `"bg-blue-700 p-2"` a la instancia de `Button`. En el DOM la representación sería:

```xml
<button class="text-white bg-red-500 px-20 py-10 bg-blue-700 p-2">
  Click Me
</button>
```

Como puedes apreciar, las clases se suman a las anteriores. Y es muy probable que el botón no tenga los estilos que se asignaron en la instancia `Button`.

¿En este tormento de clases quién define que estilos se aplicarán a `<button>`? Pues, dependerá del algoritmo de cascada de CSS:

-   En el archivo .css generado por Tailwind, si `bg-blue-700` se definió primero y después el `bg-red-500`, entonces se ignorará el `bg-blue-700` y el botón se mantendrá en `bg-red-500`.
-   Como `px-20` y `py-10` son propiedades específicas, CSS les da mayor peso, por este motivo ignorará la propiedad mas general `"p-2"`.

Para abordar este problema, necesitamos una herramienta que gestione las clases de manera que se prioricen según el orden en que se asignan en el atributo `class`. Esta herramienta debe eliminar las clases previas que afectan la misma propiedad, manteniendo únicamente la última, sin importar su especificidad. De esta forma, conseguiremos que nuestras clases finales queden de la siguiente manera:

```xml
<button class="text-white bg-blue-700 p-2">
  Click Me
</button>
```

Aquí es donde entra [tailwind-merge](https://www.npmjs.com/package/tailwind-merge), una herramienta que hace exactamente lo que describí en el anterior párrafo. Instalémoslo.

```
npm install tailwind-merge
```

Probemos la función de `twMerge()` de tailwind-merge. Puedes hacer un `console.log()` para ver si hace lo que esperamos:

```javascript
console.log(twMerge("text-white bg-red-500 px-20 py-10 bg-blue-700 p-2"));
// salida: text-white bg-blue-700 p-2
```

`twMerge()` puede recibir varios tipos de parámetros que tratará de analizarlos en conjunto para definir las clases que prevalecerán. Puedes ahondar más en su [documentación](https://github.com/dcastil/tailwind-merge).

Por ahora, envuelve tus clases con la función `twMerge()`:

```javascript
import { twMerge } from "tailwind-merge";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button(props: Props) {
  return (
    <button className={twMerge("text-white bg-red-500 px-20 py-10", props.className)}>
      {props.children}
    </button>
  );
};
```

Y listo, puedes ver que la instancia `Button` se renderiza con las clases de Tailwind esperadas: `"bg-blue-700 p-2"`.

## ¿Qué soluciona clsx?

[CLSX](https://www.npmjs.com/package/clsx) resuelve un problema sencillo pero común: Las clases condicionales. Siempre usamos los condicionales de operador ternario o condicionales de operador corto-circuito. Pero analicemos que problemas que nos traen ambos:

No necesitas codificar lo siguiente, solo es una explicación.

**Condicionales con Operador Ternario**

```javascript
<div className={`text-white p-2 ${isLoading ? 'bg-red-500 rounded' : 'bg-blue-700'}`}></div>
```

Esta condicional es fácil de leer mientras dependa de una sola variable: `isLoading`. Otro detalle es que el operador ternario te obliga a asignar un «else». Si a este «else» le asignas un [valor falsy](https://developer.mozilla.org/en-US/docs/Glossary/Falsy) (cadena vacía, null, undefined, etc.), también aparecerá en el `class` de tu elemento HTML:

```javascript
<div className={`text-white p-2 bg-blue-700 ${isLoading ? 'bg-red-500 rounded' : ''}`}></div>
// isLoading = false
// Resultado 'text-white p-2 bg-blue '  <-- espacio final innecesario
```

**Condicionales con Operador Corto-Circuito**

```javascript
<div className={`text-white p-2 bg-blue-700 ${isLoading && 'bg-red-500 rounded'}`}></div>
```

Esta condicional es más concisa, y si dependemos de muchas variables entonces resultará un poco más fácil de leer comparado con el operador ternario. Pero tiene el mismo problema de los ternarios, si la condición es falsa, también se refleja un *falsy* en el resultado final:

```javascript
<div className={`text-white p-2 bg-blue-700 ${isLoading && 'bg-red-500 rounded'}`}></div>
// isLoading = false
// Resultado 'text-white p-2 bg-blue-700 false'
```

Entonces, necesitamos una herramienta que nos ayude a agregar clases condicionales que sean fáciles de leer, incluso si son muchas. Y también, que elimine los *falsy*.

Y la herramienta que se encargará de todo ello, se llama clsx. Instalémoslo.

```
npm install clsx
```

A la función `clsx()` le puedes enviar strings, objetos, arrays, booleanos. Puedes ver más detalles en su [documentación](https://www.npmjs.com/package/clsx). En nuestro caso le pasaremos un string y un objeto. Cambia tu `Button.tsx`:

```javascript
import { clsx } from "clsx";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button(props: Props) {
  const isLoading = true;
  const isBig = false;

  return (
    <button
      className={clsx("text-white p-2 bg-blue-700", {
        "bg-red-500 rounded": isLoading,
        "text-2xl": isBig,
      })}
    >
      {props.children}
    </button>
  );
}
```

La función analizará si algún valor es *falsy*, y lo quitará. De esta forma, todos los problemas que temíamos en esta sección, se solucionaron. Juega con los valores de `isLoading` e `isBig`.

**Nota:** No estoy agregando el `className` que se recibe en los `props`, para concentrarnos solo en las clases condicionales, pero puedes agregarlo a la función `clsx()` como un argumento más, al final.

Te habrás dado cuenta que `bg-blue-700` y `bg-red-500` se juntan en el atributo `class`, cuando `isLoading` es verdadero. ¡Ya sabemos como arreglarlo! Con tailwind-merge. En la siguiente sección las combinaremos.

## Juntar tailwind-merge y clsx

La función `clsx()` evaluará tus clases condicionales y retornará un string, ese string se lo mandamos a `twMerge()` y en caso de encontrar clases conflictivas, priorizará las últimas:

```javascript
export function Button(props: Props) {
  const isLoading = true;
  const isBig = true;

  return (
    <button
      className={twMerge(clsx("text-white p-2 bg-blue-700", {
        "bg-red-500 rounded": isLoading,
        "text-2xl": isBig,
      }))}
    >
      {props.children}
    </button>
  );
}
```

Lo admito, se ve feo. Y encima tendríamos que estar repitiendo esto en cada `className`, que pereza. Solucionemos esto con una función llamada `cn()`.

## Una función para todo: cn()

La función `cn()` busca unir ambas bibliotecas para dar solución a todos los problemas que te comente a lo largo del artículo. Esta función se esta volviendo como una «convención» cuando se trabaja con Tailwind. Y si no me equivoco, fue la biblioteca [shadcn](https://ui.shadcn.com/) quién la popularizo.

Para definir esta función. Crea una carpeta `lib/` y dentro crea un archivo `utils.ts`. Agrega el siguiente script:

```javascript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Básicamente, `cn()` recibe los mismos argumentos que `clsx()`, agrupados en el parámetro `...inputs: ClassValue[]`. Y con esto, ya estaría. Ahora nuestro componente `Button` se vería así:

```javascript
export function Button(props: Props) {
  const isLoading = true;
  const isBig = true;

  return (
    <button
      className={cn("text-white p-2 bg-blue-700", {
        "bg-red-500 rounded": isLoading,
        "text-2xl": isBig,
      })}
    >
      {props.children}
    </button>
  );
}
```

Esta bonito, una sola función que soluciona todo lo mencionado.

## Resumen para nuevos proyectos

Al final todo se reduce a 2 instalaciones:

```
npm install tailwind-merge clsx
```

Y crear la función `cn()` en `lib/utils.ts`, y listo.

```javascript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**Nota:** Si en tu proyecto implementas [shadcn](https://ui.shadcn.com/). Instala ambas bibliotecas y la función `cn()` ya esta disponible.
