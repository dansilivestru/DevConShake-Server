var express = require('express');

var app = module.exports = express.createServer();

var io = require('socket.io').listen(app);

// Express Configuration

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/static'));
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
    var s = data.value;
    totalShake += s;
    console.log('Shake is at ' + totalShake);
  });

  socket.on('disconnect', function() {
    totalClients--;
    console.log('Disconnect, total clients: ' + totalClients);
  });
});

// Broadcast an update for the dashboard every second, and add a decay to the total shake.
// TODO: dont broadcast if shake value hasnt changed
setInterval(function() {
  totalShake -= 0.2;
  if (totalShake < 0) totalShake = 0;
  io.sockets.emit('dashboard', {value:totalShake});
}, 1000);

var port = process.env.PORT || 3000;

app.listen(port);

console.log('Listening on port ' + port);
console.log('Server shake value starts at 0.');
