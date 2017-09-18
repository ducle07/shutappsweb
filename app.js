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

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());

io.on('connection', function(socket) {
    //socket.emit('message', "Hello");
    
    //console.log(io.engine.clientsCount);
    
    socket.on('create', function(room) {
        var roomId = 'room' + room;
        socket.join(roomId);
        socket.emit('roomId', roomId);
    });
    
    socket.on('join', function(roomId) {
        socket.join(roomId);
        socket.emit('joinedRoom', roomId);
    });
    
    socket.on('start', function(session) {
        //console.log(session);
        io.to(session).emit('startCounter', "startCounter");
        //console.log(io.sockets.adapter.rooms);
    });
});



app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/send', function(req, res) {
    
});

//Port-Einstellungen
//Der Server horcht auf den Port 3000.
server.listen(3000, function() {
    console.log('Server listens on Port 3000');
});