# Web personal de Diego Amorin

Sitio estático e independiente construido con Astro, TypeScript, CSS y JavaScript nativos. Los artículos, proyectos e imágenes se administran directamente en este repositorio.

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
- Servicios del menú: `src/data/services.json`
- Contenido de Inicio: `src/data/site.ts`

Para habilitar un producto, reemplaza su nombre, icono y URL en `src/data/products.json` y cambia `enabled` a `true`.
Los servicios se configuran del mismo modo en `src/data/services.json`; `icon` e `iconColor` controlan sus estados normal y hover.

Los campos `projectUrl` y `projectUrlStatus` de cada proyecto controlan el botón externo. Usa `active` cuando la URL siga disponible e `inactive` para mostrar el aviso de baja.

## Deploy en Cloudflare

El sitio se publica como un Worker con recursos estáticos. La configuración está en `wrangler.jsonc`.

```bash
pnpm install
pnpm build
pnpm dlx wrangler@latest deploy
```

Para probar localmente el mismo build antes de publicarlo:

```bash
pnpm build
pnpm dlx wrangler@latest dev
```

Consulta la [guía oficial de Astro para desplegar en Cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/) para la autenticación inicial, CI/CD y opciones avanzadas.
