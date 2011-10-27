exports.version = '0.0.1';

/******************************************************************************
* CONFIGURACIÓN
* ****************************************************************************/

var twitter_user = "";
var twitter_pass = "";
var hashtags = "#jobs, #job, #trabajo, #trabajos";
var db_host = ""; //mongodb://localhost/jobs

var TwitterNode = require('twitter-node').TwitterNode;
var $
, 	app
,	io
,	twit
,	socket
,	job;

exports.init = function(app, io){
	$ = this;
	$.app = app;
	$.io  = io;
	startSocket();
	startLoging();
};

startLoging = function () {
	$.twit = new TwitterNode({
		user: twitter_user,
		password: twitter_pass
	});

	$.twit.track( hashtags );
	$.twit.addListener('error', function(error){
		console.log(error.message);
	});
	$.twit.addListener('tweet', function(tweet){
		/**********************************************************************
        * Solo aquellos tweets que tengan geolocalizacion
        **********************************************************************/
		if( ! tweet.retweeted){
			if( tweet.place != null ){
                /**************************************************************
                * Almacenamos para futuras busquedas internas
                * ************************************************************/
                var job = new Job({
						tweet 	: tweet
					,	tags 	: tweet.text.split(" ")
					,	city 	: tweet.place.name
					,	country : tweet.place.country
					,	c_code 	: tweet.place.country_code
				}).save();
                /**************************************************************
                * Enviamos el tweet al cliente
                * ************************************************************/
                $.io.sockets.emit('tweet', {tweet: tweet});
			}

		}
	});
	$.twit.stream();
}

send_last = function(socket, count){
	Job.find()
		.desc('date')
		.limit(count)
		.exec(function(error, jobs){
			if(error == null){
			socket.emit('lasts', {tweets: jobs.reverse()});
			}
		});
}

startSocket = function () {
	$.io.sockets.on('connection', function(socket){
		/**********************************************************************
		* Se conecto el cliente, envia los ultimos 14 tweets en la DB;
 		**********************************************************************/
 		send_last(socket, 25)
 		/**********************************************************************
		* Esperamos por alguna busqueda y mandamos los ultimos 20 resultados.
 		**********************************************************************/
 		socket.on('search', function(obj){
 			Job.find({city:obj.keyword})
	 			.desc('date')
	 			.limit(20)
	 			.exec(function(error, jobs){
	 				if(error == null){
						socket.emit('results', {tweets: jobs.reverse()});
	 				}
	 			});
 		});
		/**********************************************************************
		* Startover, envia de nuevo los ultimos 25 tweets en la DB
 		**********************************************************************/
 		socket.on('star_over', function(){
 			send_last(socket, 25)
 		});

	});
}

/******************************************************************************
* Models - MongoDB - Mongoose
******************************************************************************/
var mongoose = require('mongoose');
mongoose.connect(db_host);

var	Schema = mongoose.Schema;
var JobsSchema = new Schema({
		tweet 	: { }
	,	tags	: { type: Array }
	,	date	: { type: Date, default: Date.now }
	,	city	: { type: String }
	,	country : { type: String }
	,	c_code  : { type: Array }
});

var Job = mongoose.model('Jobs', JobsSchema);
