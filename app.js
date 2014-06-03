var express = require('express');
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use("/styles", express.static(__dirname + '/styles'));
app.get('/greatideas', function(req, res){
  res.sendfile('index.html');
});
app.get('/greatideas/admin', function(req, res){
  res.sendfile('admin.html');
});
var users = [];
var userNumber = 0;
var totalusers = 0;
var red = 0;
var blue = 0;
var pointreq = 50;
var gamerunning = false;
io.on('connection', function(socket){
  var myNumber = userNumber;
  userNumber++;
  totalusers++;
  var myName = 'Player: ' + myNumber;
  console.log( 'user ' + myNumber + '  connected');
  users[myNumber] = socket;
  if (myNumber%2 == 0){
	socket.emit('hello', { hello: myName, team: "Red"});
  }
  else{
	socket.emit('hello', { hello: myName, team: "Blue" });
	}
  socket.on('room', function(data){
	socket.join(data.room);
	console.log("Joined " + data.room);
	io.to('admin').emit('users', {users:totalusers});
	if (data.room == "user"){
		if (gamerunning){
			var question = getQuestion(myNumber);
			users[myNumber].answer = question.answer;
			io.to('user').emit('prompt', {prompt: question.text});
		}
	}
	io.to('admin').emit('scoreboard', {red:red, blue:blue});
	users[myNumber].type = data.room;
  });
  socket.on('answer', function(data){
	console.log("Answer: " + data.answer); 
	if(data.answer.toLowerCase() == socket.answer.toLowerCase()){
		if(gamerunning){
			if (data.team == "Red")
				red+=2;
			else
				blue+=2;
			var question = getQuestion(myNumber);

				users[myNumber].answer = question.answer;
			socket.emit('prompt', {prompt: question.text});
		}
		socket.emit('correct');
	}
	else{
		socket.emit('incorrect');
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
	console.log( 'user ' + myNumber + '  disconnected');
	totalusers--;
	io.to('admin').emit('users', {users:totalusers});
  });
  socket.on('start', function(){
	console.log("Recieved start");
	red = 0;
	blue = 0;
	gamerunning = true;
	for (var i = 0; i < users.length; i++){
		var question = getQuestion(myNumber);
		if (users[i] != null){
			users[i].emit('prompt', {prompt: question.text });
			users[i].answer = question.answer;
		}
		else{
			users.splice(i, 1);
		}
	}
	io.to('admin').emit('scoreboard', {red:red, blue:blue});
  });
  function getQuestion(id) {
	var questionarray = [
{"text":"What is the capital of the United Arab Emirates?","answer":"Abu Dhabi"}, 
{"text":"What is the capital of the Netherlands?","answer":"Amsterdam"}, 
{"text":"What is the capital of China?","answer":"Beijing"}, 
{"text":"What is the capital of Finland?","answer":"Helsinki"}, 
{"text":"What is the capital of Cuba?","answer":"Havana"}, 
{"text":"What is the capital of Pakistan?","answer":"Islamabad"}, 
{"text":"What is the capital of Ukraine?","answer":"Kiev"}, 
{"text":"What is the capital of Malaysia?","answer":"Kuala Lumpur"}, 
{"text":"What is the capital of the United Kingdom?","answer":"London"}, 
{"text":"What is the capital of the Philippines?","answer":"Manila"}, 
{"text":"What is the capital of Mexico?","answer":"Mexico City"}, 
{"text":"What is the capital of Russia?","answer":"Moscow"}, 
{"text":"What is the capital of India?","answer":"New Delhi"}, 
{"text":"What is the capital of Norway?","answer":"Oslo"}, 
{"text":"What is the capital of Canada?","answer":"Ottawa"}, 
{"text":"What is the capital of France?","answer":"Paris"}, 
{"text":"What is the capital of Italy?","answer":"Rome"}, 
{"text":"What is the capital of Austria?","answer":"Vienna"}, 
{"text":"What is the capital of Poland?","answer":"Warsaw"}, 
{"text":"What is the capital of Iraq?","answer":"Baghdad"}, 
{"text":"What is the capital of Iran?","answer":"Tehran"}, 
{"text":"What is the capital of Belgium?","answer":"Brussels"}, 
{"text":"What is the capital of Algeria?","answer":"Algiers"}, 
{"text":"What is the capital of Turkey?","answer":"Ankara"}, 
{"text":"What is the capital of Brazil?","answer":"Brasilia"}, 
{"text":"What is the capital of Algeria?","answer":"Algiers"}, 
{"text":"What is the capital of Spain?","answer":"Madrid"}, 
{"text":"What is the capital of Luxembourg?","answer":"Luxembourg"}, 
{"text":"What is the capital of Algeria?","answer":"Algiers"}, 
{"text":"What is the capital of Spain?","answer":"Madrid"}, 
{"text":"What is the capital of Luxembourg?","answer":"Luxembourg"}, 
{"text":"What is the capital of Iraq?","answer":"Baghdad"}, 
{"text":"What is the capital of Iran?","answer":"Tehran"}, 
{"text":"What is the capital of Belgium?","answer":"Brussels"}, 
{"text":"What is the capital of Algeria?","answer":"Algiers"}
];
		var randomselection = Math.round((Math.random()*(questionarray.length-1)));
		var question = questionarray[randomselection];
		console.log(question);
		return question;
	}
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
