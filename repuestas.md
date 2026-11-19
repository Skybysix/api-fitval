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