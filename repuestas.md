//Ejercicio 0

$ git push
Enumerating objects: 9, done.
Counting objects: 100% (9/9), done.
Delta compression using up to 8 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (5/5), 474 bytes | 474.00 KiB/s, done.
Total 5 (delta 2), reused 0 (delta 0), pack-reused 0 (from 0)
remote: Resolving deltas: 100% (2/2), completed with 2 local objects.
remote: error: GH013: Repository rule violations found for refs/heads/main.
remote: Review all repository rules at https://github.com/Skybysix/api-fitval/rules?ref=refs%2Fheads%2Fmain
remote: 
remote: - Changes must be made through a pull request.
remote: 
remote: - 2 of 2 required status checks are expected.
remote: 
To https://github.com/Skybysix/api-fitval.git
 ! [remote rejected] main -> main (push declined due to repository rule violations)
error: failed to push some refs to 'https://github.com/Skybysix/api-fitval.git'.

1. ¿qué código recibe el cliente con PostgreSQL parado? ¿Qué ves en la terminal que el cliente no ve? ¿Por qué es mejor así?

Cuando PostgreSQL está parado, el cliente recibe un código 503 (Service Unavailable), porque la API no puede acceder a la base de datos.

En la terminal de NestJS aparece el error de conexión con PostgreSQL, pero el cliente no ve esos detalles.

Es mejor así porque el usuario recibe un mensaje sencillo y no mostramos información interna de nuestra aplicación.

2. ¿cuántas clases salen con cada versión? Explica qué ha pasado con la consulta en la versión mala. Pista: escribe la consulta tal y como le llega a PostgreSQL. -- empieza un comentario en SQL.

En la versión vulnerable sin el $1 devuelve 7 clases y en la otra un array vacío. 

En la mala, OR 1=1 hace que la condición siempre sea verdadera, por eso salen todas. Los -- hacen que el resto se ignore.

En la segura usamos $1 para tratar el texto como un dato y evitar que modifique la consulta SQL.

3. PostgreSQL ya tiene una clave ajena en trainer_id. ¿Para qué comprobamos en la API que el monitor existe? ¿Qué recibiría el cliente si no lo hiciéramos?

Porque así nos devuelve un error 404, que significa que el monitor no existe. Si dejásemos que sea PostgreSQIL el que envíe el mensaje predeterminado, nos devolvería un 500, que es su respuesta por defento a esa petición.

4. ¿por qué borrar una clase con reservas es 409 y no 400?

Porque sería mala practica poner 400. No es una mala petición, sino una que no puede realizarse porque choca con otras tablas de PostgreSQL.

5. pega el token de Ana en jwt.io. ¿Qué datos lleva dentro? ¿Por qué no metemos también el rol?

El token contiene el identificador del usuario (sub), la fecha de creación (iat) y la fecha de expiración (exp). No contiene el rol porque este puede cambiar durante la validez del token. Por seguridad y para mantener la información actualizada, el rol se consulta directamente en la base de datos.

6. el token de recepción se creó cuando todavía era member. ¿Por qué funciona ahora sin volver a hacer login? ¿Qué pasaría si el rol fuera dentro del token?

El token de recepción sigue funcionando porque únicamente contiene el identificador del usuario (sub), no su rol. Cuando se realiza una petición, el AuthGuard valida el token y el StaffGuard consulta el rol actual del usuario directamente en la base de datos.

7. en el Ejercicio 6.4, ¿por qué el test no necesita PostgreSQL? ¿Qué no puede comprobar un test con un Pool fal so?

El test no necesita PostgreSQL porque utiliza un Pool falso que simula la base de datos.

No puede comprobar si las consultas SQL funcionan realmente en PostgreSQL ni si las tablas y relaciones son correctas.

8. ¿por qué el correo lleva Date.now()? ¿Qué pasaría la segunda vez que ejecutas los tests con un correo fijo?

Date.now() genera un correo diferente en cada ejecución para evitar duplicados.

Si usáramos un correo fijo, la segunda ejecución daría un error 409 Conflict porque el usuario ya estaría registrado.

9.  en la Parte 2 rompiste la API pegando un texto dentro del SQL. Aquí el ORDER BY lleva ${...}. ¿Por qué no es peligroso? Prueba ?sort=id;DROP TABLE classes y explica qué lo para.

No es peligroso porque el ${...} no introduce directamente en el SQL lo que escribe el usuario.

En cuanto a ?sort=id;DROP TABLE classes, el parámetro sort se valida mediante @IsIn(), que solo permite startsAt, activity y spots. Order solo permite asc o desc. Este código viene de src\classes\dto\find-classes-query.dto.ts:

@IsIn(['startsAt', 'activity', 'spots'])
sort: 'startsAt' | 'activity' | 'spots' = 'startsAt';

Por tanto, si alguien intenta enviar ?sort=id;DROP TABLE classes, la validación del DTO rechaza la petición con un error 400 antes de ejecutar la consulta SQL.

10. ¿por qué el login tiene un límite más duro que el resto de rutas? ¿Qué ataque frena? ¿Qué pasaría en Render sin app.set('trust proxy', 1)?

Porque un atacante podría intentar iniciar sesión repetidamente probando miles de combinaciones de contraseñas hasta encontrar la correcta. Al limitar los intentos, dificultamos que pueda adivinar una contraseña mediante intentos automatizados.    

En Render, la aplicación funciona detrás de un proxy inverso. Sin app.set('trust proxy', 1), Express podría identificar la IP del proxy en lugar de la IP real del cliente