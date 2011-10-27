/**
 * Module dependencies.
 */

var express = require('express');
var app = module.exports = express.createServer();
var io = require('socket.io').listen(app);
var jobs = require('./jobs');
jobs.init(app, io);

// Configuration

app.configure(function(){
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(require('stylus').middleware({ src: __dirname + '/public' }));
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
    port = 3000
});

app.configure('production', function(){
    app.use(express.errorHandler());
    port = process.env.PORT;
});

// Routes

app.get('/', function(req, res){
    title = "Jobs Digger - Tmeister Labs"
    res.render('index', {});

});

app.listen(port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
