# Web personal de Diego Amorin

Sitio estático construido con Astro, TypeScript, CSS y JavaScript nativos. Los artículos, proyectos e imágenes se guardan localmente y el sitio no depende de WordPress durante la ejecución.

## Desarrollo

Requisitos: Node.js 22 o posterior y pnpm.

```bash
pnpm install
pnpm dev
```

El servidor mostrará la URL local en la terminal.

## Comandos

```bash
pnpm dev                 # entorno de desarrollo
pnpm check               # validación de Astro y TypeScript
pnpm validate:content    # comprueba Markdown y recursos locales
pnpm build               # genera el sitio estático en dist/
pnpm preview             # sirve el build localmente
```

## Contenido

- Artículos: `src/content/blog/<slug>/index.md`
- Proyectos: `src/content/projects/<slug>/index.md`
- Productos del menú: `src/data/products.json`
- Contenido de Inicio: `src/data/site.ts`

Para habilitar un producto, reemplaza su nombre, icono y URL en `src/data/products.json` y cambia `enabled` a `true`.

Los campos `projectUrl` y `projectUrlStatus` de cada proyecto controlan el botón externo. Usa `active` cuando la URL siga disponible e `inactive` para mostrar el aviso de baja.

## Volver a importar WordPress

La importación normal se detiene si ya existen archivos Markdown, para no sobrescribir ediciones manuales:

```bash
pnpm import:wordpress
```

Para reemplazar completamente las colecciones locales por una nueva copia de WordPress:

```bash
pnpm import:wordpress --force
```

`--force` elimina únicamente `src/content/blog` y `src/content/projects` antes de reconstruirlos. Guarda cualquier cambio manual antes de utilizarlo.
