
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , jsdom = require('jsdom')
  , request = require('request')
  , url = require('url')
  , mongodb = require('mongodb');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

var models = {},
	controllers = {};

models.dietas = {
	categorias : {}
}

//var server = new Server('localhost', 27017, {auto_reconnect: true});
var server = new mongodb.Server('localhost', 27017, {auto_reconnect: true});
var dietasdb = new mongodb.Db('dietas', server, {})
 
// abrimos la base pasando el callback para cuando esté lista para usar

controllers.dietas = function(req, res){
	var BASE_URL = "http://www.noalaobesidad.df.gob.mx"
	//var BASE_URL = "http://localhost/html_files"
	jsdom.env({
	  url: BASE_URL + "/index.php?option=com_content&view=article&id=81&Itemid=74",
	  //url: BASE_URL + "/Dietas.html",
	  scripts: ["http://code.jquery.com/jquery.js"],
	  //scripts: [ BASE_URL + "/jquery.min.js"],

	  done: function (errors, window) {
	    var $ = window.$;
	    categorias = [];

	    
	    $("h3").each(function() {
	    	categoria = {};
	    	categoria.label = $(this).find("strong").text() 
	    	categoria.calorias = []
	    	
	    	$(this).next("table").find("ul.arrow a").each(function(){
	    		caloria = {}
	    		caloria.label = $(this).text()
	    		caloria.opciones = []
	    		caloria.recomendaciones = []
	    		caloria.prohibiciones = []

	    		
	    		link = 'http://localhost:3000/dietas/opciones/' + $(this).attr("href").split("?")[1]
	    		//link = "http://www.noalaobesidad.df.gob.mx/"
	    		//console.log(link)
	    		$.get( link , {}, function(data){
				//	caloria.opciones.push(data)
					console.log(data)
				})

	    		categoria.calorias.push( caloria )
	    	})

	    	categorias.push(categoria)
	    });
/*
		dietasdb.open(function(err, db) {
			if (err) throw err;
			collection = new mongodb.Collection(dietasdb, 'categorias');
			collection.insert(categorias);
		});
*/
		res.writeHead(200, {'content-type': 'text/json' });
      	res.write( JSON.stringify(categorias) );
	    
	  }
	});
}
/**/
controllers.opciones = function(req, res) {
	jsdom.env({
	  url : "http://www.noalaobesidad.df.gob.mx/index.php?" + req.params.link,
	  scripts: ["http://code.jquery.com/jquery.js"],
	  done: function (errors, window) {
	    var $ = window.$;
		opciones = []

    	$("div#page tr:eq(2) ul.arrow ").find("a").each(function(){
    		opcion = {}
    		opcion.label = $(this).text()
    		opcion.receta = {}

    		//llenareceta(opcion.receta)
    		opciones.push(opcion)
    		//
    	})
		res.writeHead(200, {'content-type': 'text/json' });
      	res.write( JSON.stringify(opciones) );

	  }
	});
}

controllers.recomendaciones = function(req, res) {
	jsdom.env({
	  url : "http://www.noalaobesidad.df.gob.mx/index.php?" + req.params.link,
	  scripts: ["http://code.jquery.com/jquery.js"],
	  done: function (errors, window) {
	    var $ = window.$;
		recomendaciones = []

    	$("div#page tr:eq(4) ul.arrow ").find("li").each(function(){
    		recomendaciones.push( $(this).text() )
    	})
		res.writeHead(200, {'content-type': 'text/json' });
      	res.write( JSON.stringify( recomendaciones ) );
	  }
	});
}

/**/
controllers.prohibiciones = function(req, res) {
	jsdom.env({
	  url : "http://www.noalaobesidad.df.gob.mx/index.php?" + req.params.link,
	  scripts: ["http://code.jquery.com/jquery.js"],
	  done: function (errors, window) {
	    var $ = window.$;
		prohibiciones = []

    	prohibiciones = $("div#page tr:eq(6) ").text()
		res.writeHead(200, {'content-type': 'text/json' });
      	res.write( JSON.stringify(prohibiciones) );

	  }
	});
}
/**/

controllers.opcion = function(req, res) {
	jsdom.env({
	  url : "http://www.noalaobesidad.df.gob.mx/index.php?" + req.params.link,
	  scripts: ["http://code.jquery.com/jquery.js"],
	  done: function (errors, window) {
	    var $ = window.$;
		opcion = {}

    	opcion.desayuno = $("table:eq(0) tr:eq(3) td:eq(0)").text()
    	opcion.colacion_mat = $("table:eq(0) tr:eq(3) td:eq(1)").text()
    	opcion.comida = $("table:eq(0) tr:eq(3) td:eq(2)").text()

    	opcion.colacion_ves = $("table:eq(0) tr:eq(5) td:eq(0)").text()
    	opcion.cena = $("table:eq(0) tr:eq(5) td:eq(1)").text()
		
		res.writeHead(200, {'content-type': 'text/json' });
      	res.write( JSON.stringify( opcion ) );
	  }
	});
}

/**/
controllers.dieta = function(req, res){
	var base_url = "http://www.noalaobesidad.df.gob.mx/"
	jsdom.env({
	  url: base_url + "index.php?option=com_content&view=article&id=81&Itemid=74",
	  scripts: ["http://code.jquery.com/jquery.js"],

	  done: function (errors, window) {
	    var $ = window.$;
	    res.set('Content-Type', 'text/html');
	    res.end("ola k ase");
	  }
	});
}


app.get('/', routes.index);
app.get('/dietas', controllers.dietas);
app.get('/dietas/opciones/:link?', controllers.opciones);
app.get('/dietas/recomendaciones/:link?', controllers.recomendaciones);
app.get('/dietas/prohibiciones/:link?', controllers.prohibiciones);

app.get('/dietas/opcion/:link?', controllers.opcion);
app.get('/dieta', controllers.dieta);
//app.get('/menu', controllers.menu);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
