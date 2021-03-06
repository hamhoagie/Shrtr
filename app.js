/**
 * Module dependencies.
 */

var express = require("express"), 
    http = require("http"),
    shrtr = require("./api/shrtr");

var app = express(),
    server = http.createServer(app);

// Configuration
var port = process.env.PORT || 3000;

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', 'test', function(){
  // during local development we assume redis defaults on localhost
  var redis = require("redis").createClient();
  var s = shrtr({ db: redis, app: app});
  app.use(express.errorHandler({ 
    dumpExceptions: true, 
    showStack: true }
  )); 
});

app.configure('production', function(){
  // heroku deploy uses REDISTOGO
  var rtg = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis").createClient(rtg.port, rtg.hostname);
  redis.auth(rtg.auth.split(":")[1]);
  var s = shrtr({ db: redis, app: app });
  app.use(express.errorHandler()); 
});

// Startup 
server.listen(port, function(){
  console.log("Shrtr server listening on port %d in %s mode", 
    port, 
    app.settings.env
  );
});
