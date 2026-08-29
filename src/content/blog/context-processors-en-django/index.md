---
title: Como crear Context Processors en Django
description: 'Aprende qué son los context processors de Django y cómo crear uno para compartir variables globales entre múltiples templates de tu proyecto.'
publishedAt: '2022-07-16T21:06:22'
updatedAt: '2023-08-10T17:45:48'
featuredImageAlt: ''
categories:
  - Guías Django
---

El contexto es un «conjunto de variables» que envías a tus templates a través de las vistas. Estas variables solo pueden ser accedidas por un template específico. Pero, que sucede si nuestro proyecto requiere variables que estén disponibles en todos los templates. No conviene estar agregando el mismo conjunto de elementos en cada contexto de cada vista. Lo que necesitamos es crear un contexto global, es decir, un conjunto de variables globales que todas las plantillas podrán usar.

Entonces, ¿cómo se creo un contexto global? Aquí los context processors entran al rescate.

## ¿Qué son los Context Processors?

Un procesador de contexto es sencillamente una función que recibe un argumento `request` y retorna un diccionario de elementos (contexto).

```python
def mi_context_processor(request):
    return {
        "foo": "bar",
    }
```

La variable `user` es un ejemplo de variable global definida en un context processor. Esta nos retorna el usuario que se encuentra logueado actualmente. Puedes acceder a esta variable desde cualquier template de tu proyecto. ¡Pruébalo!

```xml
<h1>{{ user.username }}</h1>
```

El context processor `auth` contiene un conjunto de variables, entre ellas esta la variable `user` que usamos anteriormente. Puedes encontrarla en tu `settings.py` de esta forma:

```bash
django.contrib.auth.context_processors.auth
```

## Crea tu propio Context Processor

Crearemos una variable global que nos retorne el año actual.

Primero crea un archivo `context_processors.py` y luego definamos nuestro context processor `get_current_year`:

```python
# context_processors.py

import datetime

def get_current_year(request):
    current_year = datetime.datetime.now().year

    return {
        "current_year": current_year
    }
```

Finalmente, debes agregar tu nuevo context processor en la configuración `TEMPLATES` para que puedas fusionarlo con el contexto global. De esta forma, podrás acceder a los elementos en todas las plantillas.

```php
# settings.py

TEMPLATES = [
    {
        # ...
        "OPTIONS":
            {
                "context_processors":
                    [
                        "django.template.context_processors.debug",
                        "django.template.context_processors.request",
                        "django.contrib.auth.context_processors.auth",
                        "django.contrib.messages.context_processors.messages",
                        "myapp.context_processors.get_current_year",
                    ],
            },
    },
]
```

Y listo, puedes usar la nueva variable `current_year` desde cualquier plantilla de tu proyecto.

```xml
<h1>{{ current_year }}</h1>
```

Gracias por leer el artículo, para cualquier duda deja un comentario.
