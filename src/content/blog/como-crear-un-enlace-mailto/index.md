---
title: 'Crea un enlace mailto: que abra tu gestor de correos'
description: Para crear un enlace o botón que te dirija a un cliente de correo, es recomendable usar un elemento <a> y que dirija a un enlace de tipo mailto:. Este enlace «mailto» tiene diferentes formatos. Vamos a explorarlos. Inici
publishedAt: '2021-05-09T12:17:28'
updatedAt: '2025-01-06T15:04:25'
featuredImage: ./thumbnail-email.jpg
featuredImageAlt: 'Crea un enlace mailto: que abra tu gestor de correos'
categories:
  - Guías HTML, CSS y JS
readingTime: 2
sourceUrl: https://diegoamorin.com/como-crear-un-enlace-mailto/
---

Para crear un enlace o botón que te dirija a un cliente de correo, es recomendable usar un elemento `<a>` y que dirija a un enlace de tipo `mailto:`. Este enlace «mailto» tiene diferentes formatos. Vamos a explorarlos.

## Iniciar un nuevo correo

Si solo agregas `mailto:`, el enlace abrirá el cliente de correo del usuario, pero el campo de «para» o «destinatario» estará vacío.

```xml
<a href="mailto:">Enviar un email</a>
```

## Correo hacia un destinatario

Posiblemente sea el formato más usado. En este caso, `mailto:` solo recibe un correo electrónico hacia el destinatario.

```xml
<a href="mailto:correo@example.com">Envíame un email</a>
```

## Correo hacia muchos destinatarios

Para agregar más destinatarios puedes separar los correos por comas.

```xml
<a href="mailto:correo1@example.com,correo2@example.com">
    Enviar correo a varios destinatarios
</a>
```

## Correo con un asunto

Para enviar un correo con asunto, agrega el campo `subject` a la url que ya tenemos.

```xml
<a href="mailto:example@example.com?subject=Mas%20detalles%20del%20curso">
    Enviar un correo electrónico con asunto.
</a>
```

> El **%20** es equivalente a un «espacio» entre palabras.

## Correo con asunto y cuerpo de mensaje

Si deseas especificar el cuerpo del correo, debes usar el campo `body`. Por ejemplo:

```xml
<a href="mailto:example@example.com?subject=Mas%20detalles%20del%20curso&body=Este%20es%20el%20cuerpo">
    Enviar un correo electrónico con asunto y cuerpo.
</a>
```

## Correo con Cc y Cco

Para especificar el Cc usas el campo `cc` y para el Cco el campo `bcc`. Por ejemplo:

```xml
<a href="mailto:correo@example.com?cc=correo1@example.com&bcc=correo2@example.com&subject=Mas%20detalles%20del%20curso">
    Enviar un correo electrónico con cc, bcc y asunto.
</a>
```

Si entendiste la dinámica de uso de `mailto`. Puedes combinar los diferentes campos mencionados anteriormente.

## Referencias

-   [Crea hipervínculos MDN Web Docs](https://developer.mozilla.org/es/docs/Learn/HTML/Introduction_to_HTML/Creating_hyperlinks)
