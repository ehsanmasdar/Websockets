var express = require('express');
var app = require('express')();
var router = express.Router();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
console.log("called");
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.engine('html', require('ejs').renderFile);
app.use("/styles", express.static(__dirname + '/styles'));

app.get( '/', function(req, res){
  res.render('index.html');
});
app.get('/admin', function(req, res){
  res.render('admin.html');
});
var users = {};
var userNumber = 1;
var totalusers = 0;
var red = 0;
var blue = 0;
var pointreq = 3;
var gamerunning = false;
io.on('connection', function(socket){
  console.log('a user connected');
  console.log(totalusers);
  var myNumber = userNumber++;
  var myName = 'user#' + myNumber;
  users[myName] = socket;
  if (myNumber%2 == 0){
	socket.emit('hello', { hello: myName, team: "Red"});
  }
  else{
	socket.emit('hello', { hello: myName, team: "Blue" });
	}
  socket.on('room', function(data){
	socket.join(data.room);
	console.log("Joined " + data.room);
	if (data.room == "user"){
		totalusers++;
		io.to('admin').emit('users', {users:totalusers});
	}
	io.to('admin').emit('users', {users:totalusers});
  });
  socket.on('answer', function(data){
	if(data.answer == 1){
		if(gamerunning){
			if (data.team == "Red")
				red++
			else
				blue++
		}
	}
	io.to('admin').emit('scoreboard', {red:red, blue:blue});
	if (red >= pointreq){
		io.emit('gameend', {winner:"Red",red:red, blue:blue});
		gamerunning = false;
	}
	else if (blue >= pointreq){
		io.emit('gameend', {winner:"Blue", red:red, blue:blue});
		gamerunning = false;
	}
  });
  socket.on('disconnect', function () {
    console.log('user disconnected');
    users[myName] = null;
	io.to('admin').emit('users', {users:totalusers});
  });
  socket.on('start', function(){
	totalusers--;
	console.log("Recieved start");
	red = 0;
	blue = 0;
	gamerunning = true;
	io.to('user').emit('prompt', {prompt:'prompt'});
	io.to('admin').emit('scoreboard', {red:red, blue:blue});
  });
});
module.exports = router;
var server = http.listen(3000);
console.log(http.address());