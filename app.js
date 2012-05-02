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
    threshold = 50,
    totalClients = 0,
    peeps = {};

function outputPeeps(p) {
    var a = [];
    for (var i in p) {
        if (p.hasOwnProperty(i)) {
            a.push(i);
        }
    }
    return a;
}

app.get('/reset', function(req, res) {
  totalShake = 0;
  res.send('reset shake to 0');
});

function dropNickAfterDelay(n) {
  peeps[n] = setTimeout(function() {
    console.log('user ' + n + ' timed out');
    clearTimeout(peeps[n]);
    delete peeps[n];
  }, 10000);
}

// Handle socket (client) connection
io.sockets.on('connection', function(socket) {
  totalClients++;
  console.log('Connection, total clients: ' + totalClients);

  // Handset client will emit "shake" events
  socket.on('shake', function(data) {
    var s = data.value;
    var nick = data.nick;
    if (s !== 0) {
        clearTimeout(peeps[nick]);
        delete peeps[nick];
        dropNickAfterDelay(nick);
        totalShake += s;
    }
    console.log('Shake is at ' + totalShake);
  });

  // Webpage client will emit "get" event on load
  socket.on('get', function() {
    io.sockets.emit('dashboard', {value:totalShake, peeps:outputPeeps(peeps)});
  });

  socket.on('nick', function(nick) {
    console.log('Setting up ' + nick);
    dropNickAfterDelay(nick);
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
  io.sockets.emit('dashboard', {value:totalShake,peeps:outputPeeps(peeps)});
  if (totalShake >= threshold) {
    io.sockets.emit('booya');
  }
}, 1000);

var port = process.env.PORT || 3000;

app.listen(port);

console.log('Listening on port ' + port);
console.log('Server shake value starts at 0.');
