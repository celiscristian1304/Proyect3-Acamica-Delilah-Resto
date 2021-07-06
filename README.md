# Proyect3-Acamica-Delilah-Resto
Sprint3-Acámica-NodeJS-DelilahResto
1.	Descargue todos los archivos involucrados en el repositorio.
2.	Habrá el IDE con la ruta local de los archivos descargados. 
3.	Configure las variables de entorno para la aplicación, las cuales se encuentran en el archivo “.env”. En este archivo encontrará tres (3) secciones:
    3.1.	Sección 1: Variables de entorno para la base de datos:
      3.1.1.	DB_HOST: host a utilizar para la base de datos. 
      3.1.2.	DB_PORT: Puerto de conexión hacia la base de datos.
      3.1.3.	DB_NAME: Nombre por otorgar a la base de datos. 
      3.1.4.	DB_USER: Usuario por utilizar en la base de datos. 
      3.1.5.	DB_PASSWORD: Contraseña requerida para la conexión de la base de datos. 
    3.2.	Sección 2: Variables de entorno para el servidor:
      3.2.1.	APP_PORT: Puesto de conexión hacia el servidor para tener acceso a los endpoints. 
    3.3.	Sección 3: Variables de entorno para el json web token:
      3.3.1.	KEY_JWT: Contraseña para firmar el json web token. 
    Nota: El archivo ya cuenta con los datos predeterminados, con los cuales se realizó el desarrollo y pruebas de la aplicación. 
4.	Ubíquese desde la terminal en la ruta local de los archivos descargados. 
5.	Ejecute el comando “npm install” en la terminal para instalar todas las dependencias de la aplicación. Luego de esto notará que se crearan dos archivos:
  5.1.	node_modules: Carpeta de almacenamiento para los paquetes de cada dependencia instalada. 
  5.2.	package-lock.json: Librerías requeridas para cada dependencia. 
6.	Ejecute el comando “node app.js” o en su defecto “nodemon app.js” en la terminal para iniciar la aplicación. Una vez iniciada la aplicación notará lo siguiente:
  6.1.	Se crearan cuatro (4) tablas en la base de datos con el nombre que le otorgó desde el archivo “.env” (user, producto, order, itemOrder); y cada una de estas tablas cuenta con información básica para el funcionamiento de la aplicación.
  6.2.	Se utilizarán las conexiones a los puertos indicados en el archivo “.env”. 
7.	Para detener la aplicación, solo ingrese el comando “Ctrl + C” en la terminal para realizar desconexiones de puertos. 
8.	Para el uso de los endpoints, por favor dirigirse al archivo “spec.yml”.
  8.1.	Nota: El usuario administrador posee la siguiente credencial:
    8.1.1.	Usuario: admin
    8.1.2.	Contraseña: Cris123. (punto incluido).
  8.2.	Para conocer las credenciales de los otros dos usuarios, utilizar el endpoint “/user” de acuerdo con la explicación del archivo “spec.yml”. 
