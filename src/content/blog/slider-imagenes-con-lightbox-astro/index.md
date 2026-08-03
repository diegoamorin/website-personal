---
title: 'Astro: Crea un Slider de imágenes con Lightbox'
description: 'Crea en Astro un slider de imágenes responsive con lightbox usando Swiper y PhotoSwipe, desde la instalación hasta la personalización de flechas.'
publishedAt: '2024-02-16T11:00:57'
updatedAt: '2024-03-10T15:44:50'
featuredImage: ./astro-create-slider-lightbox.jpg
featuredImageAlt: 'Astro: Crea un Slider de imágenes con Lightbox'
categories:
  - Guías Astro
readingTime: 11
sourceUrl: https://diegoamorin.com/slider-imagenes-con-lightbox-astro/
---

Hace unos días necesitaba crear un slider de imágenes con lightbox para una Landing Page con Astro. Encontré 2 librerías de JS que me salvaron la vida y que funcionan muy bien juntas.

[Swiper](https://swiperjs.com/) me ayudo con los slides y [Photoswipe](https://photoswipe.com/) con el lightbox. Había otra alternativa para el lightbox, llamado [LightGallery](https://www.lightgalleryjs.com/), pero se necesitaba pagar una licencia.

Aquí puedes [ver el resultado](/#resultado) de esta guía.

## Preparación del proyecto Astro

Primero crea tu proyecto Astro. En caso de querer implementarlo a un proyecto actual, te recomiendo crear una nueva rama de Git. Además, si estas usando Typescript, no temas, ambas bibliotecas tienen definiciones de tipo.

Ya en tu proyecto, crea una carpeta en `src/` llamado `components/` con un archivo `Gallery.astro` y en la carpeta `public/` crea una carpeta `images/` para guardar tus imágenes. Tu proyecto debería verse similar a esto:

```bash
node_modules/
public/
    images/
        image1.jpeg
        image2.jpeg
        image3.jpeg
        image4.jpeg
src/
   components/
       Gallery.astro
   pages/
```

Ahora, todos los scripts que te mostraré en esta guía los trabajarás en tu componente `Gallery.astro`, luego importas este componente en tu `index.astro` para que puedas visualizar los cambios.

**Nota:** Existen diferentes formas de trabajar con [imágenes en Astro](https://docs.astro.build/es/guides/images/) y varían dependiendo del tipo de proyecto. En este caso lo trabajaremos dentro de la carpeta `public/`

## Instalación de librerías

No usaremos las CDNs de estas librerías. Es mejor instalarlo mediante NPM, principalmente porque Swiper separa sus funcionalidades en diferentes módulos que puedes importar según lo vas necesitando. Si usas la CDN te cargarás todo el core y todas las funcionalidades independientemente si los usas o no.

Instala Swiper y Photoswipe con el siguiente comando:

```
npm install swiper photoswipe
```

## Crear el Slider con Swiper

Primero crearemos el carrousel de imágenes y luego le agregamos el Lightbox. Swiper en su documentación te pide la siguiente estructura HTML para crear los slides.

```xml
<!-- Contenedor principal de Swiper -->
<div class="swiper">
  <!-- Wrapper adicional requerido -->
  <div class="swiper-wrapper">
    <!-- Los slides -->
    <div class="swiper-slide">Slide 1</div>
    <div class="swiper-slide">Slide 2</div>
    <div class="swiper-slide">Slide 3</div>
    ...
  </div>
  <!-- Si necesitamos paginación -->
  <div class="swiper-pagination"></div>

  <!-- Si necesitamos botones de navegación -->
  <div class="swiper-button-prev"></div>
  <div class="swiper-button-next"></div>

  <!-- Si necesitamos scrollbar -->
  <div class="swiper-scrollbar"></div>
</div>
```

Para nuestro ejemplo solo usaremos los botones de navegación, pero hay un montón de formas en las que puedes mostrar tus slides ([Swiper Demos](https://swiperjs.com/demos)), y todos son compatibles con el Lightbox de Photoswipe.

Entonces nuestra estructura HTML debería ser la siguiente:

```xml
<!-- Contenedor principal de Swiper -->
<div class="swiper">
  <!-- Wrapper adicional requerido -->
  <div class="swiper-wrapper">
    <!-- Los slides -->
    <div class="swiper-slide">
      <img src="/images/image1.jpeg" alt="" />
    </div>
    <div class="swiper-slide">
      <img src="/images/image2.jpeg" alt="" />
    </div>
    <div class="swiper-slide">
      <img src="/images/image3.jpeg" alt="" />
    </div>
    <div class="swiper-slide">
      <img src="/images/image4.jpeg" alt="" />
    </div>
  </div>
  <!-- Botones de navegación -->
  <div class="swiper-button-prev"></div>
  <div class="swiper-button-next"></div>
</div>
```

Fíjate que le agregué las imágenes dentro de cada `.swiper-slide`, puedes cambiarlas a las que tu desees.

Ahora debemos inicializar Swiper y configurarlo:

```xml
<script>
  // Core de Swiper y estilos
  import Swiper from 'swiper';
  import 'swiper/css';
  // Módulo Navigation de Swiper y estilos
  import { Navigation } from "swiper/modules";
  import "swiper/css/navigation";

  // Configurar Swiper
  const swiper = new Swiper(".swiper", {
    modules: [Navigation], // definir los módulos a usar
    loop: true,            // definir si los slides estarán en bucle
    slidesPerView: 3,      // agregar número de slides para la pantalla
    spaceBetween: 40,      // separación entre slides en px
    navigation: {          // definir botones next y prev para el módulo Navigation
      prevEl: ".swiper-button-prev",
      nextEl: ".swiper-button-next",
    }
  });
</script>
```

En los comentarios te explico que hace cada línea (opcionalmente puedes visitar la [API de Swiper](https://swiperjs.com/swiper-api)). Si juegas con el `spaceBetween` pensarás que no esta haciendo su chamba, pero si lo hace, solo que las imágenes de cada slide sobrepasan el contenedor. Lo arreglaremos con CSS.

Para nuestro CSS tendríamos lo siguiente:

```xml
<style>
  .swiper-slide {
    height: 600px;
    border-radius: 10px;
    overflow: hidden;
  }
  .swiper-slide img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
</style>
```

Y listo, ya tenemos el slider o carrousel de imágenes. ¿Facilísimo verdad?

## Agregar Lightbox con Photoswipe

Para agregar el Lightbox a nuestro slider, debemos modificar un poco el HTML.

Primero agrega un ID al `div.swiper-wrapper`, porque Photoswipe nos pedirá una referencia hacia nuestras imágenes.

```javascript
<div class="swiper-wrapper" id="my-slider">
```

Luego, cada `<div>` dentro de `.swiper-wrapper` será reemplazado por una etiqueta `<a>` con el siguiente formato:

```xml
<!-- Contenedor principal de Swiper -->
<div class="swiper">
  <!-- Wrapper adicional requerido -->
  <div class="swiper-wrapper" id="my-slider">
    <!-- Los slides -->
    <a
      class="swiper-slide"
      href="/images/image1.jpeg"
      data-pswp-width="800" data-pswp-height="800"
      target="_blank"
      data-cropped="true"
    >
      <img src="/images/image1.jpeg" alt="">
    </a>
    <a
      class="swiper-slide"
      href="/images/image2.jpeg"
      data-pswp-width="800" data-pswp-height="800"
      target="_blank"
      data-cropped="true"
    >
      <img src="/images/image2.jpeg" alt="">
    </a>
    <a
      class="swiper-slide"
      href="/images/image3.jpeg"
      data-pswp-width="800" data-pswp-height="800"
      target="_blank"
      data-cropped="true"
    >
      <img src="/images/image3.jpeg" alt="">
    </a>
    <a
      class="swiper-slide"
      href="/images/image4.jpeg"
      data-pswp-width="800" data-pswp-height="800"
      target="_blank"
      data-cropped="true"
    >
      <img src="/images/image4.jpeg" alt="">
    </a>
  </div>
  <!-- Botones de navegación -->
  <div class="swiper-button-prev"></div>
  <div class="swiper-button-next"></div>
</div>
```

Todos los atributos dentro de la etiqueta `<a>` son requeridas en Photoswipe para abrir el Lightbox y mostrar la imagen en las dimensiones correctas. Exceptuando el atributo `data-cropped="true"` que lo usamos porque nuestro slider nos muestra las imágenes cortadas. Sino fuera así, no necesitaríamos especificar este atributo. Visita la [documentación de Photoswipe](https://photoswipe.com/getting-started/) para más detalles.

Recuerda actualizar el `data-pswp-width` y `data-pswp-height` a las medidas de cada una de tus imágenes. En mi caso, todas mis imágenes tienen las mismas dimensiones: 800×800.

Para finalizar, digámosle a Photoswipe donde están nuestras imágenes, agrega a tu etiqueta `<script>` lo siguiente:

```javascript
// Photoswipe y estilos
import PhotoSwipeLightbox from 'photoswipe/lightbox';
import 'photoswipe/style.css';

// Configurar e inicializar Photoswipe
const lightbox = new PhotoSwipeLightbox({
  gallery: '#my-slider',
  children: 'a',
  pswpModule: () => import('photoswipe')
});
lightbox.init();
```

Ya debería estar funcionando, y podrías dejarlo hasta aquí, a menos que quieras hacer responsive este slider y personalizar esas aburridas flechas de Swiper.

## Hacer responsive nuestro Slider

Lo que necesitamos cambiar en las diferentes pantallas serán el número de slides que se muestran y el espaciado entre ellas. Para lograr esto, Swiper tiene la propiedad `breakpoints`.

Actualiza tu configuración de Swiper a lo siguiente:

```javascript
// Configurar Swiper
const swiper = new Swiper(".swiper", {
  modules: [Navigation],
  loop: true,
  slidesPerView: "auto",
  spaceBetween: 20,
  breakpoints: {
    // Cuando la pantalla es >= 768px
    768: {
      slidesPerView: 2,
      spaceBetween: 30
    },
    // Cuando la pantalla es >= 1024px
    1024: {
      slidesPerView: 3,
      spaceBetween: 40
    }
  },
  navigation: {
    prevEl: ".swiper-button-prev",
    nextEl: ".swiper-button-next",
  }
});
```

Fíjate arriba, actualicé `slidesPerView` y `spaceBetween` (los que están fuera de la propiedad `breakpoints`) como parámetros por defecto. Es decir, que desde 0px hasta antes de 768px (pantallas móviles) tomarán los valores por defecto. Más sobre [breakpoints de Swiper](https://swiperjs.com/swiper-api#param-breakpoints).

Mira que ya tu slider es responsive.

¿Por qué agregué `slidesPerView: "auto"`?

Lo hice porque quiero darle un efecto en móviles donde se muestra la imagen cortada al lado derecho de la pantalla, así doy a entender que hay más imágenes a la derecha. Esta propiedad «auto» tomará por defecto el ancho del 100% para cada elemento del slider, pero podemos modificarlo con CSS. Opcionalmente puedes cambiar «auto» por un número.

En tu etiqueta `<style>` agrega:

```css
@media(max-width: 768px) {
  .swiper-slide {
    width: 70%; /* Útil si la propiedad slidesPerView es "auto" */
    height: 400px;
  }
  .swiper-button-prev,
  .swiper-button-next {
    display: none;
  }
}
```

Si reduces la pantalla a menos de 768px te darás cuenta a que efecto me refería. Con esto ya estaría la versión en celular, tablet y ordenador de nuestro slider. Del Lightbox no te preocupes porque es todo terreno.

Ahora cambiemos esas flechas por si tu jefe o cliente te los pide.

## Personalizar las flechas de Swiper

En caso de que te guste los iconos, puedes darle unos estilos superficiales en CSS sin problemas:

```css
.swiper-button-next,
.swiper-button-prev {
  background-color: white;
  width: 60px;
  height: 60px;
  border-radius: 10px;
}
```

Pero en caso de que quieras cambiar el icono, también lo realizaremos con CSS, ya que no encontré una opción nativa de Swiper. Reemplaza el código anterior a algo similar a esto:

```css
.swiper-button-next,
.swiper-button-prev {
  background-image: url("/svgs/arrow-next.svg");
  background-repeat: no-repeat;
  background-size: 100% auto;
  width: 60px;
  height: 60px;
}
.swiper-button-prev {
  transform: rotate(180deg); /* rotar arrow-next.svg para reutilizar el mismo icono*/
}
.swiper-button-next::after,
.swiper-button-prev::after {
  content: "";
}
```

Recuerda que la `url()` debe apuntar a tu recurso svg, en mi caso esta en `public/svgs/` de mi proyecto Astro.

## Resultado


<video class="article-video" controls preload="metadata" src="./Untitled.webm"></video>
