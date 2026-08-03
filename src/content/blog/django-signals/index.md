---
title: Cómo usar Django Signals
description: 'Aprende cómo funcionan las señales de Django: emisores, receptores, señales integradas y personalizadas, decoradores y un caso con post_save.'
publishedAt: '2022-06-21T22:15:33'
updatedAt: '2024-12-22T10:57:23'
featuredImage: ./Django-Signals.png
featuredImageAlt: Cómo usar Django Signals
categories:
  - Guías Django
readingTime: 9
sourceUrl: https://diegoamorin.com/django-signals/
---

Para aprender a usar las [señales de Django](https://docs.djangoproject.com/en/dev/topics/signals/) primero debemos saber cual es su función, cual es el motivo de su existencia. Por esta razón, tomaré un fragmento de la documentación que va a aclarar algunas de nuestras dudas:

> Django incluye un «despachador de señales» que ayuda a que las aplicaciones desacopladas reciban notificaciones cuando ocurren acciones en otras partes del framework. En pocas palabras, las señales permiten que ciertos «*emisores*» notifiquen a un conjunto de «*receptores*» que se ha producido alguna acción. Son especialmente útiles cuando muchos fragmentos de código pueden estar interesados ​​en los mismos eventos.
>
> Documentación Django

Antes de comenzar, es recomendable que conozcas los conceptos básicos de Django y que tengas un proyecto vacío donde puedas practicar lo que aprenderás en esta guía. Aunque, también puedes adaptarlo a tu proyecto.

Estructura básica para esta guía:

```
myproject/
    settings.py
    urls.py
    ...
myapp/
    migrations/
    models.py
    ...
```

## Conceptos clave

A continuación, tres conceptos para entender el funcionamiento de las señales:

1.  **El emisor:** Es una clase de Python (en la mayoría de los casos) y es el responsable de enviar la señal cuando ocurre una acción.
2.  **El receptor:** Es una función o método de Python, que será invocada cuando reciba la señal. También llamada función receptora.
3.  **Señal / Despachador de señal:** Es una instancia de la clase `Signal` y cuenta con 2 funciones principales, el método `send()` para enviar la señal y el método `connect()` para escuchar señales.

## Uso básico

Django ya posee un conjunto de señales integradas. En la gran mayoría de casos, no será necesario crear señales extra. Solo debemos preocuparnos en crear nuestro «receptor» y algunas veces un «emisor», porque el framework por *default* emite señales que esperan a ser escuchadas.

En este ejemplo, necesitamos que cada vez que se finalice una solicitud HTTP se imprima en consola «Solicitud Finalizada». Para conseguirlo, usaremos una señal integrada `request_finished` que se llama después de que finalice una solicitud HTTP.

Primero, creemos nuestro receptor en `myapp/views.py`. Ojo solo para probar, luego verás como organizar mejor tu código:

```python
def mi_receptor(sender, **kwargs):
    print("Solicitud Finalizada")
```

Recuerda que cada receptor necesita un argumento `sender` y la `**kwargs` para recibir algunos [argumentos con nombres](https://realpython.com/python-kwargs-and-args/) que puede enviar una señal.

Ahora, para que nuestra función escuche la señal `request_finished` y se ejecute, debemos registrarla con el método `connect()` de la señal:

```python
from django.core.signals import request_finished

def mi_receptor(sender, **kwargs):
    print("Solicitud Finalizada")

request_finished.connect(mi_receptor)
```

Alternativamente, en reemplazo de `connect()` también puedes registrar a la función con el decorador `@receiver`. Recuerda pasar como primer argumento la señal.

```python
from django.core.signals import request_finished
from django.dispatch import receiver

@receiver(request_finished)
def mi_receptor(sender, **kwargs):
    print("Solicitud Finalizada")
```

Ahora, cada vez que se finalice una solicitud HTTP en tu app, la función `mi_receptor` se va a ejecutar. Pero que sucede si queremos que nuestra función se ejecute cuando inicia y cuando termina una solicitud HTTP. Es decir, queremos escuchar 2 señales a la vez. Esto se puede lograr pasando una lista de señales al decorador, de esta forma:

```python
@receiver([request_started, request_finished])
```

El `request_started` es otra de las señalas integradas en Django, en la siguiente sección conocerás mas sobre ellas y para que te pueden servir.

## Señales integradas

Como ya mencioné anteriormente, Django posee [señales integradas](https://docs.djangoproject.com/en/dev/ref/signals/) que nos servirán para la gran mayoría de casos. A continuación, verás solo algunas de las señales que posee el framework:

Señales enviadas cuando inicia o termina una solicitud HTTP:

```python
from django.core.signals import request_started
from django.core.signals import request_finished
```

Señales enviadas antes o después de ejecutar el método `save()` de un modelo:

```python
from django.db.models.signals import pre_save
from django.db.models.signals import post_save
```

Señales enviadas antes o después de llamar al método `delete()` de un modelo o al método `delete()` de queryset:

```python
from django.db.models.signals import pre_delete
from django.db.models.signals import post_delete
```

Puedes ver la lista completa de señales integradas en [la documentación](https://docs.djangoproject.com/en/dev/topics/signals/), pero con las señales anteriores tendrías suficiente para desenvolverte bien en Django.

Ya entiendes como funciona. Ahora, es momento de ver un ejemplo más práctico, más real.

## Caso práctico

En este caso queremos extender el modelo `User` de Django por medio de la relación «uno a uno» para poder almacenar datos de artistas.

Comencemos creando un modelo `Artista` que extiende del modelo `User`:

```python
from django.db import models
from django.contrib.auth.models import User

class Artista(models.Model):
    usuario = models.OneToOneField(User, on_delete=models.CASCADE)
    nombre_artistico = models.CharField(max_length=100, blank=True)
    biografia = models.TextField(blank=True)
    sitio_web = models.URLField(max_length=100, blank=True)
```

Ahora, necesitamos que cada vez que se registre un usuario en la app, automáticamente también se cree su perfil `Artista`; en otras palabras, cada vez que se cree un `User` queremos que se cree un `Artista`. Para ello, debemos buscar una señal integrada que se llama cuando se ejecuta el método `save()`. Si te fijas en la sección «señales integradas», notarás que la señal `post_save` es perfecta para este caso.

Lo único que debemos hacer es crear una función receptora abajo de nuestro modelo `Artista`. La llamaremos `crear_usuario_artista()` y luego con el decorador escucharemos la señal `post_save`, de esta forma:

```python
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def crear_usuario_artista(sender, instance, created, **kwargs):
    if created:
        Artista.objects.create(usuario=instance)

# post_save.connect(crear_usuario_artista, sender=User) <-- Sin decorador
```

Si lo has notado, ahora hay un atributo `sender` a la hora de registrar la función. Esto nos servirá para que la función no se ejecute cada vez que se guarda un modelo del proyecto, sino que se ejecute solo cuando un modelo específico se guarda. En este caso queremos escuchar cuando el modelo `User` se guarde, entonces `sender=User`. Además, cabe mencionar que la señal integrada `post_save` envía el argumento `created` que nos servirá para saber si se creó el nuevo usuario.

Con la anterior función receptora, nuestra aplicación va a crear un Artista cada vez que un Usuario se registre. Como un paso adicional la siguiente señal nos permitirá **actualizar** un Artista cuando el User también lo haga.

```python
@receiver(post_save, sender=User)
def guardar_usuario_artista(sender, instance, **kwargs):
    instance.artista.save()
```

Genial, creaste tus primeras 2 señales para solucionar el problema anterior. En la siguiente sección verás como organizar todas las señales de tu proyecto.

## ¿Donde debería vivir el código?

Según la documentación de Django, el código de las señales pueden vivir donde se te de la gana, aunque a veces pueden ocurrir efectos secundarios de la importación de código. Como no queremos que eso suceda, debemos buscar la manera de cargar los receptores antes de que los emisores se carguen. En esta sección, te mostraré la forma óptima para organizar tu código.

En tu aplicación agrega el archivo `receivers.py` en mi caso quedaría algo así:

```
myapp/
    migrations/
    models.py
    receivers.py <-- Aqui
    ...
```

Puede que encuentres tutoriales que usen el nombre `signals.py` para almacenar sus funciones receptoras, pero en nuestro caso usaremos el nombre `receivers.py` porque es mas explícito y también porque el archivo `signals.py` lo usaremos para almacenar nuestras señales personalizadas. Si deseas combinar tus señales personalizadas y funciones receptoras en un solo archivo puede que tengas problemas de importación circular.

Una vez aclarado esto, ahora toca ordenar nuestros receptores. En caso de que hayas registrado tus funciones receptoras con un decorador lee el «Caso 1» si los registrarte con `connect()` pasa al «Caso 2».

### Caso 1: Registro con decorador

En `myapp/receivers.py` agrega todos tus receptores:

```python
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Artista

@receiver(post_save, sender=User)
def crear_usuario_artista(sender, instance, created, **kwargs):
    if created:
        Artista.objects.create(usuario=instance)

@receiver(post_save, sender=User)
def guardar_usuario_artista(sender, instance, **kwargs):
    instance.artista.save()
```

En `myapp/apps.py`:

```python
from django.apps import AppConfig

class MyappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'myapp'

    def ready(self):
        from . import receivers
```

La función [`ready()`](https://docs.djangoproject.com/en/4.1/ref/applications/#django.apps.AppConfig.ready) sirve para hacer tareas de inicialización, en este caso cargar nuestras señales.

Y por último asegúrate de cargar tu `AppConfig` en tu `INSTALLED_APPS` de `settings.py`. En caso de que no quieras hacerlo, también puedes agregar lo siguiente en tu `myapp/__init__.py`:

```python
default_app_config = 'myapp.apps.MyappConfig'
```

### Caso 2: Registro sin decorador

En `myapp/receivers.py` colocas tus funciones receptoras sin registrarlas aún:

```python
from .models import Artista

def crear_usuario_artista(sender, instance, created, **kwargs):
    if created:
        Artista.objects.create(usuario=instance)

def guardar_usuario_artista(sender, instance, **kwargs):
    instance.artista.save()
```

En `myapp/apps.py` registras tus funciones receptoras a las señal `post_save`:

```python
from django.apps import AppConfig
from django.db.models.signals import post_save

class MyappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'myapp'

    def ready(self):
        from django.contrib.auth.models import User
        from .receivers import crear_usuario_artista, guardar_usuario_artista

        post_save.connect(crear_usuario_artista, sender=User)
        post_save.connect(guardar_usuario_artista, sender=User)
```

Y finalmente en `myapp/__init__.py`:

```javascript
default_app_config = 'myapp.apps.MyappConfig'
```

Finalmente, si deseas que otras aplicaciones escuchen tus señales, o quieres aprender más sobre la organización de las señales en un proyecto, te recomiendo este [pequeño debate en StackOverflow](https://stackoverflow.com/questions/2719038/where-should-signal-handlers-live-in-a-django-project).

## Señales personalizadas

Recuerda que cada señal es una instancia de la clase `Signal`. Crea un archivo `myapp/signals.py` y definamos la señal `album_lanzado` para notificar cuando el álbum de un artista se haya lanzado.

```python
from django.dispatch import Signal

album_lanzado = Signal()
```

Para enviar una señal debemos usar el método `Signal.send()`. Procedamos a crear un modelo `Album` en nuestro `myapp/models.py` con una función `lanzar_album()` que se encargará de enviar la señal:

```python
from .signals import album_lanzado

class Album(models.Model):
    artista = models.ForeignKey(Artista, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=100)
    fecha_lanzamiento = models.DateField()
    numero_estrellas = models.IntegerField()

    def lanzar_album(self):
        album_lanzado.send(
            sender=self.__class__, nombre=self.nombre, fecha=self.fecha_lanzamiento
        )
```

Ya tenemos nuestra señal y nuestro emisor. Solo nos falta la función receptora que «enviará un email» a la disquera Sony Music para distribuir el nuevo Álbum.

En tu `receivers.py` agrega lo siguiente

```python
from .signals import album_lanzado
from .models import Album

@receiver(album_lanzado, sender=Album)
def email_album_lanzado(sender, nombre, fecha, **kwargs):
    print("Para: Sony Music\nEl album %s fue lanzado el dia %s" % (nombre, fecha))
```

Y por último, fíjate si en tu `myapp/apps.py` has importado tus funciones receptoras:

```python
class MyappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'myapp'

    def ready(self):
        from . import receivers
```

¡Listo! Cada vez que tengas una instancia `Album` y llames a su método `lanzar_album()` este emitirá la señal `album_lanzado` y luego nuestra función receptora imprimirá en consola.

## ¿Cuándo lo voy a usar?

Ya debes estar preguntándote si toda esta lógica sería mas sencilla si lo implementamos dentro de una vista o anulando los métodos `save()` o `delete()` de un modelo. Y tiene sentido, por ejemplo, en el caso del `Artista`, podemos crear una vista para «registrar usuarios» y ahí mismo agregamos código para crear un Usuario y un Artista. Nada de otro mundo. Sin embargo, vamos a tener que estar pendientes de que cada vez que creamos un `User` también creemos un `Artista`. Lo ideal sería que esto se ejecute de manera automática a través de una señal.

Pero ¿qué sucede en el caso del Álbum?

El caso del álbum claramente se puede implementar dentro de una vista. Aunque, si muchas partes del proyecto necesitan ejecutar una misma función cuando ocurre la señal `album_lanzado` es mejor crear tu propia señal.

**A continuación, algunas recomendaciones de uso para las señales:**

-   Lo vas a usar cuando muchos fragmentos de código estén interesados en los mismo eventos.
-   Lo vas a usar cuando interactúes con otras aplicaciones desacopladas, ya sea del core de Django o de terceros, como por ejemplo `django.contrib.auth` y su modelo `User`.

¡Muchas gracias por leer este artículo! Ahora tienes en tu caja de herramientas las «Django Signals». Cuando empieces a crear aplicaciones mas exigentes, confía en las recomendaciones que te ofrecí anteriormente y también en tu instinto para saber si tal problema necesitará una «Django Signal» para ser resuelta.
