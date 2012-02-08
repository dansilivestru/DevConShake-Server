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
    lastShake = 0,
    threshold = 10,
    totalClients = 0;

// Handle socket (client) connection
io.sockets.on('connection', function(socket) {
  totalClients++;
  console.log('Connection, total clients: ' + totalClients);

  // Handset client will emit "shake" events
  socket.on('shake', function(data) {
    var s = data.value;
    totalShake += s;
    console.log('Shake is at ' + totalShake);
  });

  // Webpage client will emit "get" event to get
  // latest shake reading on initial load
  socket.on('get', function() {
    totalShake = 0;
    io.sockets.emit('dashboard', {value:totalShake});
  });

  socket.on('disconnect', function() {
    totalClients--;
    console.log('Disconnect, total clients: ' + totalClients);
  });
});

// Broadcast an update for the dashboard every second if
// the shake value has changed by a whole number
// also add a decay to the total shake.
setInterval(function() {
  totalShake -= 0.2;
  if (totalShake < 0) totalShake = 0;
  if (Math.floor(lastShake) != Math.floor(totalShake)) {
    lastShake = totalShake;
    io.sockets.emit('dashboard', {value:totalShake});
    if (totalShake >= threshold) {
      io.sockets.emit('booya');
    }
  }
}, 1000);

var port = process.env.PORT || 3000;

app.listen(port);

console.log('Listening on port ' + port);
console.log('Server shake value starts at 0.');
