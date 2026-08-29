---
title: Crear botones para compartir en redes sociales con HTML
description: 'Crea botones HTML para compartir contenido en Facebook, X, WhatsApp, Telegram, LinkedIn, Reddit y correo usando las URL de cada plataforma.'
publishedAt: '2024-06-30T16:59:45'
updatedAt: '2024-12-22T12:44:38'
featuredImage: ./botones-de-compatir-en-redes-sociales.jpg
featuredImageAlt: Crear botones para compartir en redes sociales con HTML
categories:
  - Guías HTML, CSS y JS
---

Los botones de compartir no son más que una etiqueta «a» con una URL. Esta URL posee una estructura definida por la plataforma en la que se quiere compartir.

Y para que estas etiquetas `<a>` se parezcan a un botón, solo se usa CSS.

En esta guía te ofreceré las URLs para compartir en cada plataforma y códigos para implementarlo en tu web, ya sea que tengas una web de contenido estático, o de contenido dinámico.

## Facebook

Facebook solo te permite definir la URL que deseas compartir.

```bash
https://www.facebook.com/sharer/sharer.php?u=URL
```

-   `URL`: La URL que quieres compartir.

**Compartir URL estática**

```xml
<a href="https://www.facebook.com/sharer/sharer.php?u=https://diegoamorin.com">
    Compartir en Facebook
</a>
```

**Compartir URL dinámica**

```xml
<a href="" id="facebook-share">Compartir en Facebook</a>
<script>
    let currentUrl = window.location.href;
    let facebookShareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(currentUrl);
    document.getElementById('facebook-share').href = facebookShareUrl;
</script>
```

## X (anteriormente Twitter)

X permite compartir una URL y definir un texto inicial para el tweet, además de otros parámetros opcionales.

```bash
https://twitter.com/intent/tweet?url=URL&text=TEXT&via=USERNAME&hashtags=HASHTAG1,HASHTAG2
```

-   `URL`: La URL que quieres compartir.
-   `TEXT`: El texto que quieres incluir en el tweet.
-   `USERNAME`: El nombre de usuario para mencionar en el tweet. (Opcional)
-   `HASHTAG1, HASHTAG2, ...`: Hashtags para incluir en el tweet. (Opcional)

**Compartir URL estática**

```xml
<a href="https://twitter.com/intent/tweet?url=https://diegoamorin.com&text=¡Mira%20esto!">
    Compartir en X
</a>
```

**Compartir URL dinámica**

```xml
<a href="" id="twitter-share">Compartir en X</a>
<script>
    let currentUrl = window.location.href;
    let text = '¡Mira esto!';
    let twitterShareUrl = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(currentUrl) + '&text=' + encodeURIComponent(text);
    document.getElementById('twitter-share').href = twitterShareUrl;
</script>
```

> En las URL, los espacios se representan usualmente con `%20`, que es la codificación en URL para el espacio.

## WhatsApp

WhatsApp permite compartir un mensaje donde puedes incluir la URL.

```bash
https://wa.me/?text=TEXT
```

-   `TEXT`: El texto que quieres incluir en el mensaje.

**Compartir URL estática**

```xml
<a href="https://wa.me/?text=¡Mira%20esto!%20https://diegoamorin.com">
    Compartir en WhatsApp
</a>
```

**Compartir URL dinámica**

```xml
<a href="" id="whatsapp-share">Compartir en WhatsApp</a>
<script>
    let currentUrl = window.location.href;
    let text = '¡Mira esto! ' + currentUrl;
    let whatsappShareUrl = 'https://wa.me/?text=' + encodeURIComponent(text);
    document.getElementById('whatsapp-share').href = whatsappShareUrl;
</script>
```

## Telegram

Telegram permite compartir una URL y un mensaje inicial.

```bash
https://t.me/share/url?url=URL&text=TEXT
```

-   `URL`: La URL que quieres compartir.
-   `TEXT`: El texto que quieres incluir en el mensaje.

**Compartir URL estática**

```xml
<a href="https://t.me/share/url?url=https://diegoamorin.com&text=¡Mira%20esto!">
    Compartir en Telegram
</a>
```

**Compartir URL dinámica**

```xml
<a href="" id="telegram-share">Compartir en Telegram</a>
<script>
    let currentUrl = window.location.href;
    let text = '¡Mira esto!';
    let telegramShareUrl = 'https://t.me/share/url?url=' + encodeURIComponent(currentUrl) + '&text=' + encodeURIComponent(text);
    document.getElementById('telegram-share').href = telegramShareUrl;
</script>
```

## Correo

Para compartir por correo electrónico, puedes usar un enlace `mailto` ([Leer guía completa](/como-crear-un-enlace-mailto/)).

```bash
mailto:?subject=SUBJECT&body=BODY%20URL
```

-   `SUBJECT`: El asunto del correo.
-   `BODY`: El cuerpo del correo.
-   `URL`: La URL que quieres compartir.

**Compartir URL estática**

```xml
<a href="mailto:?subject=¡Mira esto!&body=¡Echa un vistazo a este enlace!%20https://diegoamorin.com">
    Compartir por correo electrónico
</a>
```

**Compartir URL dinámica**

```xml
<a href="" id="email-share">Compartir por correo electrónico</a>
<script>
    let currentUrl = window.location.href;
    let subject = '¡Mira esto!';
    let body = '¡Echa un vistazo a este enlace! ' + currentUrl;
    let emailShareUrl = 'mailto:?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    document.getElementById('email-share').href = emailShareUrl;
</script>
```

## LinkedIn

LinkedIn permite compartir una URL y agregar un título y una fuente opcional.

```bash
https://www.linkedin.com/shareArticle?mini=true&url=URL&title=TITLE&source=SOURCE
```

-   `URL`: La URL que quieres compartir.
-   `TITLE`: El título del artículo.
-   `SOURCE`: La fuente del artículo (opcional).

**Compartir URL estática**

```xml
<a href="https://www.linkedin.com/shareArticle?mini=true&url=https://diegoamorin.com&title=¡Mira esto!&source=MiSitioWeb">
    Compartir en LinkedIn
</a>
```

**Compartir URL dinámica**

```xml
<a href="" id="linkedin-share">Compartir en LinkedIn</a>
<script>
    let currentUrl = window.location.href;
    let title = '¡Mira esto!';
    let source = 'MiSitioWeb';
    let linkedinShareUrl = 'https://www.linkedin.com/shareArticle?mini=true&url=' + encodeURIComponent(currentUrl) + '&title=' + encodeURIComponent(title) + '&source=' + encodeURIComponent(source);
    document.getElementById('linkedin-share').href = linkedinShareUrl;
</script>
```

## Reddit

Reddit permite compartir una URL y agregar un título.

```bash
https://www.reddit.com/submit?url=URL&title=TITLE
```

-   `URL`: La URL que quieres compartir.
-   `TITLE`: El título del artículo.

**Compartir URL estática**

```xml
<a href="https://www.reddit.com/submit?url=https://diegoamorin.com&title=¡Mira%20esto!">
    Compartir en Reddit
</a>
```

**Compartir URL dinámica**

```xml
<a href="" id="reddit-share">Compartir en Reddit</a>
<script>
    let currentUrl = window.location.href;
    let title = '¡Mira esto!';
    let redditShareUrl = 'https://www.reddit.com/submit?url=' + encodeURIComponent(currentUrl) + '&title=' + encodeURIComponent(title);
    document.getElementById('reddit-share').href = redditShareUrl;
</script>
```
