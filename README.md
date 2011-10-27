# Jobs Digger Experimento de fin de semana con Nodejs & Socket.io

##Que es

Jobs Digger es una "app" hecha en nodejs cuyo objetivo primordial es buscar en el stream de twitter hashtags y los tweets que contengan esos hashtags ubicarlos geográficamente en un mapa.

##Dependencias.

Esta guia esta enfocada para sistemas *nix, lease Linux/Macintosh lo siento si usan Windows :)

###Nodejs
Lo primero es asegurarse de tener Nodejs instalado. Si usas ubuntu puedes usar:

	sudo apt-get install nodejs

O sigue esta guía [http://joyeur.com/2010/12/10/installing-node-and-npm/](http://joyeur.com/2010/12/10/installing-node-and-npm/)

### NPM
Ademas de usar [Npm](https://github.com/isaacs/npm) el cual es un manejador de paquetes para Node, este es muy útil para declarar nuestras dependencias y al momento de hacer deploy instalarlas.

### MongoDB 

Como base de datos usaremos [MongoDB](http://www.mongodb.org/display/DOCS/Quickstart+Unix)

## Como lo hago funcionar.

Simplemente clona este repo

	mkdir digger
	cd digger
	git clone git@github.com:Tmeister/jobs-digger.git .

### Modifica los datos de tus cuentas en el archivo jobs.js

	var twitter_user = "";
	var twitter_pass = "";
	var hashtags = "#jobs, #job, #trabajo, #trabajos";
	var db_host = ""; //ej. mongodb://localhost/jobs

### Instalamos las dependencias

Desde digger instalamos las dependencias que estan descritas en el archivo package.json usando 

	npm install .

Si todo va bien veremos un log como el siguiente:

	[tmeister digger]$ npm install .
	npm WARN mongodb@0.9.6-22 package.json: bugs['web'] should probably be bugs['url']

	> mongodb@0.9.6-22 install /home/tmeister/Sites/tuto-digger/node_modules/mongoose/node_modules/mongodb
	> bash ./install.sh

	================================================================================
	=                                                                              =
	=  To install with C++ bson parser do <npm install mongodb --mongodb:native>   =
	=  the parser only works for node 0.4.X or lower                               =
	=                                                                              =
	================================================================================
	Not building native library for cygwin
	twitter-node@0.0.2 ./node_modules/twitter-node 
	mongoose@2.3.8 ./node_modules/mongoose 
	--- colors@0.5.0
	--- hooks@0.1.9
	--- mongodb@0.9.6-22
	stylus@0.19.0 ./node_modules/stylus 
	--- growl@1.1.0
	--- mkdirp@0.0.7
	--- cssom@0.2.0
	express@2.4.7 ./node_modules/express 
	--- mkdirp@0.0.7
	--- mime@1.2.4
	--- connect@1.7.2
	--- qs@0.3.1
	socket.io@0.8.6 ./node_modules/socket.io 
	--- policyfile@0.0.4
	--- redis@0.6.7
	--- socket.io-client@0.8.6
	jade@0.16.4 ./node_modules/jade 
	--- mkdirp@0.0.7
	--- commander@0.2.1

Ahora solo ejecutamos nuestra apliación

	node app.js

Y veremos	

	tmeister digger]$ node app.js 
   	info  - socket.io started
	Express server listening on port 3000 in development mode


Listo, ingresamos a la dirección http://localhost:3000 y veremos el resultado, el cual lo pueden ver en linea en [http://digger.tmeister.net](http://digger.tmeister.net)