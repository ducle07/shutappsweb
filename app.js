var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var uuid = require('uuid');
var mongoose = require('mongoose');
var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);

/*mongoose.connect('mongodb://localhost:27017/ControllingApps');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("DB connected!");
});

var Schema = mongoose.Schema;

var sessionSchema = new Schema({
    session_id: {type: Schema.Types.ObjectId},
    users: [Schema.Types.ObjectId]
});

var userSchema = new Schema({
    user_id: {type: Schema.Types.ObjectId},
    name: String
});

var Session = mongoose.model('Session', sessionSchema);
var User = mongoose.model('User', userSchema);
*/

var savedSockets;

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

io.on('connection', function(socket) {
    
    console.log('connected: ' + socket.id);
    savedSockets = socket;
    
    socket.on('create', function(client) {
        var roomId = 'room' + client;
        socket.leave(client);
        socket.join(roomId);
        socket.joinedRoom = roomId;
        socket.emit('roomId', roomId);
        var clients = io.sockets.adapter.rooms[roomId].sockets;
        var tempArray = [];
        for(var key in clients) {
            tempArray.push(key);
        };
        io.to(roomId).emit('clients', tempArray);
    });
    
    socket.on('join', function(roomId) {
        var clientId = roomId.replace("room", "");
        socket.leave(clientId);
        
        socket.join(roomId);
        socket.joinedRoom = roomId;
        socket.emit('joinedRoom', roomId);
        var clients = io.sockets.adapter.rooms[roomId].sockets;
        //console.log(io.sockets.adapter.rooms);
        var tempArray = [];
        for(var key in clients) {
            tempArray.push(key);
        };
        io.to(roomId).emit('clients', tempArray);
    });
    
    socket.on('start', function(session) {
        //console.log(session);
        io.to(session).emit('startCounter', "startCounter");
        //console.log(io.sockets.adapter.rooms);
    });
    
    socket.on('counter', function(counter) {
        socket.counter = counter;
    });
    
    socket.on('pause', function(session) {
        io.to(session).emit('pauseCounter', "pauseCounter");
    });
    
    socket.on('leave', function(session) {
        var clientId = session.id;
        var roomId = session.roomId;
        if(io.sockets.adapter.sids[socket.id][roomId]) {
            socket.leave(roomId);
            io.to(roomId).emit('leave', {clientId: clientId, counter: socket.counter});
        }
    });
    
    socket.on('disconnect', function() {
        console.log('user disconnected ' + socket.joinedRoom + " " + socket.id);
        io.to(socket.joinedRoom).emit('leave', {clientId: socket.id, counter: socket.counter});
        socket.leave(socket.joinedRoom);
    });
});


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/join', function(req, res) {
    console.log("vor: " + savedSockets.id);
    res.redirect('/');
    console.log("nach: " + savedSockets.id);
});

/*app.get('/:roomid', function(req, res) {
    console.log(savedSockets.id);
    var roomId = req.params.roomid;
    savedSockets.join(roomId);
    savedSockets.emit('joinedRoom', roomId);
    var clients = io.sockets.adapter.rooms[roomId].sockets;
    var tempArray = [];
    for(var key in clients) {
        tempArray.push(key);
    };
    io.to(roomId).emit('clients', tempArray);
    res.sendFile(__dirname + '/index.html');
});*/

//Port-Einstellungen
//Der Server horcht auf den Port 8888.
server.listen(process.env.PORT || 8888, function() {
    console.log('Server listens on Port 8888');
});