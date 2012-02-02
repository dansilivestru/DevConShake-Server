var express = require('express');

var app = module.exports = express.createServer();

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

var totalShake = 0;

app.get('/', function(req, res) {
  var shake = req.query.shake;
  if (shake) {
    var val = parseInt(shake);
    if (!isNaN(val)) {
      totalShake += val;
      console.log('Server shake value: ' + totalShake);
      res.send('{success:true}');
    }
  }
  res.send('{success:false}');
});

app.listen(3000);

console.log('Listening at localhost:3000');
console.log('Server shake value starts at 0.');
