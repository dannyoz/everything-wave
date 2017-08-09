const express = require('express');
const js = express();
const env = require('dotenv').config();
const bodyParser = require('body-parser');
const swig = require('swig');

const environment = process.env.NODE_ENV || 'development';
const envPath     = __dirname+'/environments/'+environment+'/';
const routes      = require(__dirname+'/express/routing').routes;
const getRoutes   = require(__dirname+'/express/get-routes');
const postRoutes  = require(__dirname+'/express/post-routes');
const staticDirs  = require(__dirname+'/express/routing').staticDirs;
const err404      = require(__dirname+'/express/routing').err404;

//Templating settings
js.engine('html', swig.renderFile);
js.set('view engine', 'html');
js.set('views', envPath + 'views');

// js.get('/test', function(req,res) {
//   res.render('test');
// });

js.set('port', (process.env.PORT || 5000));
js.use(bodyParser.json());

routes.forEach(function (route){
  js.get(route.path,function(req,res){
    res.setHeader('Content-Type', 'text/html');
    res.sendFile(envPath+'views/index.html');
  });
});

staticDirs.forEach(function (dir){
  js.use('/'+dir, express.static(envPath+dir));
});

for (var route in getRoutes) {
	js.get(route, getRoutes[route]);
}

for (var route in postRoutes) {
	js.post(route, postRoutes[route]);
}

//if (environment === 'development') {
	js.get('/env', function(req, res) {
		res.status(200).send(process.env);
	});
//}

js.use(err404);

js.listen(js.get('port'), function() {
  console.log('Everythin wave app is running on port', js.get('port'));
});
