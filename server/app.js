var express = require('express');

var app = module.exports = express.createServer();

var io = require('socket.io').listen(app);

// Express Configuration

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

var totalShake = 0,
    totalClients = 0;

io.sockets.on('connection', function(socket) {
  totalClients++;
  console.log('Connection, total clients: ' + totalClients);

  socket.on('shake', function(data) {
    console.log('got a shake msg: ' + data);
    var s = data.value;
    totalShake += s;
    console.log('Shake is at ' + totalShake);
  });

  socket.on('disconnect', function() {
    totalClients--;
    console.log('Disconnect, total clients: ' + totalClients);
  });
  
});

app.get('/', function(req, res) {
  // TODO: Dashboard
});

app.listen(3000);

console.log('Listening at localhost:3000');
console.log('Server shake value starts at 0.');
