# Librería asíncrona para jugar akinator

# Ejemplo
```js
    const mech_aki = require("mech-aki");;


    let akinator = new mech_aki("es"); //Crear una instancia del juego en español

    let respuesta = await akinator.empezar(); //Empezar el juego y recibir la primera pregunta. (obligatorio)
    while (akinator.progreso < 85) { //Mientras el progreso sea inferior al 85% seguir respondiendo
        console.log(respuesta.pregunta); //La pregunta que nos está haciendo
        respuesta = await akinator.siguiente(0) // 0: Sí, 1: No, 2: No lo se, 3: Probablemente, 4: Probablemente no
        if (!respuesta) break; //No hay más preguntas disponibles
    }

    let resultados = await akinator.respuestas(); //Obtener los personajes que ha adivinado
    console.log(resultados[0].nombre); //Mostrar el nombre del personaje con más posibilidades
```

### El método siguiente() puede utilizarse cuántas veces se quiera, incluso si ya se han obtenido los resultados

### Idiomas disponibles
```
es
es_animales
en
en_objects
en_animals
ar
cn
de
de_tieren //animales
fr
fr_animaux //animales
fr_objets //objetos
```