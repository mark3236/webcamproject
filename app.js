var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server);

var request = require('request');
var bodyParser = require('body-parser');
var fs = require('fs');

var port=8000;
server.listen(port);

// Routing
app.use(bodyParser.json({limit:'5mb'}));
//querystring : false, qs library : true
app.use(bodyParser.urlencoded({extended: false, limit:'5mb'}));
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(express.static(__dirname + '/public'));

//proxy from webcam server to avoid CORS complaining
app.get('/stream1',function(req,res){
  var url="http://122.46.145.125:18081/"
  request(url).pipe(res);
});
app.get('/stream2',function(req,res){
  var url="http://camera.nton.lviv.ua/mjpg/video.mjpg"
  request(url).pipe(res);
});

//this part needs to be migrated to raspberry pi.
app.post('/print', function(req,res){
  // string generated by canvas.toDataURL()
  var img = req.body.imgBase64
  // strip off the data: url prefix to get just the base64-encoded bytes
  var data = img.replace(/^data:image\/\w+;base64,/, "");
  var buf = new Buffer(data, 'base64');
  fs.writeFile('image.png', buf);
  console.log('print');
  io.sockets.emit('print');
});


// Socket.io


io.on('connection', function (socket) {

  // when the client emits 'camera capture', this listens and executes
  socket.on('camera capture', function (data) {
    // we broadcast to everyone execute 'camera capture'
    io.sockets.emit('camera capture', {
      username: data
    });
  });

});
