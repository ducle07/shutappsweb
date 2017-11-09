var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var uuid = require('uuid');
var mongoose = require('mongoose');
var admin = require('firebase-admin');
var session = require('express-session')({
    secret: 'my-secret',
    resave: true,
    saveUninitialized: true,
    store: new (require('express-sessions')) ({
        storage: 'mongodb',
        instance: mongoose,
        host: 'localhost',
        port: 27017,
        db: 'ControllingApps',
        collections: 'express-session',
        expire: 86400
    })
});
var sharedSession = require('express-socket.io-session');
var app = express();
var server = http.createServer(app);
var io = require('socket.io')(server);

mongoose.connect('mongodb://ducle:mongoshutappsweb@ds133465.mlab.com:33465/shutappsweb');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("DB connected!");
});

var Schema = mongoose.Schema;

/*var sessionSchema = new Schema({
    session_id: {type: Schema.Types.ObjectId},
    users: [Schema.Types.ObjectId]
});*/

var userSchema = new Schema({
    user_id: String,
    id: String,
    name: String,
    connection: [],
    toJoinedRoom: String
});

var socketSchema = new Schema({
    id: String
});

//var Session = mongoose.model('Session', sessionSchema);
var User = mongoose.model('User', userSchema);
var Socket = mongoose.model('Socket', socketSchema);

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(session);

io.use(sharedSession(session, {
    autoSave: true
}));

admin.initializeApp({
  credential: admin.credential.cert({
      "type": "service_account",
      "project_id": "shutappsweb",
      "private_key_id": "98bdfb2ee52b764915f4c34af22d309b27e6ce95",
      "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDgaHNExlQ2zQGG\nzzJTZ6M1Cy8vpO9UYkJqH6PJ3rTp5T77PnCu8Pp82wj0lhvfvCURRye65FacIhrr\nWpC5gz5/aont7+Y/Dm6PpK4wnnNhooDBHjTIFnLFpsIVOFrkiyoZGo3TUGv/J/4B\nfiGPdsuXNmPgJ8PDR9mpFlRwIYX/t4yEy3ZOVNFtxGmGdEweIRa72x6gaav0Qhee\nrR90WGjgsJWoLfR4qBZaJbO6brDwJLwpmmh35XR5r2S0S5Frtz7FzFQjgM5/yPR+\nCeKQtS+ggYlO+Jzq44QidlF39/EsbmYlPWSHfwDdpSxnJMbviEo8/hlLu46UVLwz\nyuWizK55AgMBAAECggEABdJxPs+/m/+IBRD6Kvu0OlJIwP1lgqynxl79Wzr1Ogtr\nLa5GPY8DDAB28Y6KmQHwUGvmd1ozd4qdz2zv9oorHHfoLcVvYC6DYTlqQK4UYQGh\nQhwNeJf21hMq86KSHsi6rhWi5+sNGZIhFvWTEL4UpImMwDeT5AH+FF2VPFFYVkTR\na+IGuE/BALIAbXrlfrlfC3xWBjV93oSUdUkVhhsNE7CFii9Qib9mPMwItM8/TZHB\nKC+XE7lXgdoFAIiC/+D9KoMVopekq/jwu2MDu2GF10GErb5hB4JIsOI229ayBAM3\nZ+ayEosliKHYs51HzO3fs524tJJe14u1ktOhSnB8gQKBgQD1DvwIFOd0Z9EQTOFp\nBRf0VBIxk0pe8zy/pbOLSDk5lof1j1qIX2sTZZMOqF8sLvxBI9ZxwviYo/UW9Z0+\nzVStfVMTEe2RRUp/z4gjC/RDXgnonZa7k1dD6rhaMqrplXoCPuAnATzv0XcE1iIC\nihxlH02/GuHBmAVmpjVrSCR4+QKBgQDqbW46H28cOfAXyho/F5NFxX8ce/Pe31cX\nEBLYdIfy2+6jChyLD6fZsMXJDBH5Le5JFRki2xR1n8J3+Ds5ssGw630dgmE4DeeC\n5FVaGv0zyPWlTu/tFxXHQNV/qn7rSk78ECe08nkivZeayLCyyVS9JkHl0x1AzKyd\nX0fIWPjBgQKBgFXP0nduAoKjm/TORxyEWRgInHpZrnBDUqF1f8KlHszIpoFZmoUo\njJE1P2KhmPoa1eBlkUEy2eRxfXB1v4NvWViLCx0haQQ2tFi/Lle/ZuB0PJoFHPRA\nKw2wUq/bEDhNTHUe2VUvPMxpl/jMlwo2nKzYYlwqKKWm+zUvvIL9ty/ZAoGAKx4R\nhhM+Bn0JkfaUOUKGzfBzXrPVuQpvJEjKjpFwZ9TX4Zj8gv9QKhP/bOkRbTlreHmu\n8+BDtRa7WAGKMySTx4yoqILQitTT3hlNMZOBOsMdm1gXfQ4f7VQZcK/VREWYnXgD\nNZ7bdO5WMhvzlA6/zUJ6IGFiIgcDQLbDpy/mIQECgYA/aXOrNdnzEwR5Lj5/M4s9\nQK5hvp16z8QNhBSwlAA//3So/cCWcjfJS7kmxn945JzlWOnZoAsvWhqVqwZS+PPN\n5oFlk5jXuwu0qBtVO8ep3hTAn59EHaDAvDUKLjE2jdoM19h0SurGP59ia/Ohy+T5\nCDo5AWfvNTU7WE9GTMtKtA==\n-----END PRIVATE KEY-----\n",
      "client_email": "firebase-adminsdk-uk1ds@shutappsweb.iam.gserviceaccount.com",
      "client_id": "114799478227435930606",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://accounts.google.com/o/oauth2/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-uk1ds%40shutappsweb.iam.gserviceaccount.com"
    }),
  databaseURL: "https://shutappsweb.firebaseio.com"
});

var users = {};

io.on('connection', function(socket) {
    
    console.log('connected: ' + socket.id);
    var data = {
        id: socket.id
    };
    var saveSocket = new Socket(data);
    saveSocket.save(function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log(socket.id + " wurde gespeichert");
        }
    });
    
    /*socket.on('connect', function() {
        callListeners();
    });*/
    
    callListeners();
    //console.log(socket.eventNames());
    
    function callListeners() {
        socket.on('auth', function(data) {
            var idToken = data.idToken;
            admin.auth().verifyIdToken(idToken)
                .then(function(decodedToken) {
                var uid = decodedToken.uid;
                //console.log(decodedToken);

                var array = [];
                array.push(socket.id);
                users.id = decodedToken.uid;
                users.name = decodedToken.email;
                users.connections = array;
                users.toJoinedRoom = "";

                socket.handshake.session.uid = decodedToken.uid;
                socket.handshake.session.save();

                var userProfile = new User(users);
                User.findOne( { id: decodedToken.uid }, function(err, user) {
                    if(!user) {
                        userProfile.save(function(err) {
                            if(err)
                                console.log(err);
                            else
                                console.log('User hinzugefügt');
                        });
                        console.log('save');
                    } 
                    
                    //console.log(user.toJoinedRoom);
                    if(user.toJoinedRoom !== "") {
                        socket.join(user.toJoinedRoom);
                        //socket.emit('joinedRoom', user.toJoinedRoom);
                        io.to(user.toJoinedRoom).emit('joinedRoom', user.toJoinedRoom);
                        var clients = io.sockets.adapter.rooms[user.toJoinedRoom].sockets;
                        var tempArray = [];
                        for(var key in clients) {
                            tempArray.push(key);
                        };  
                        io.to(user.toJoinedRoom).emit('clients', tempArray);
                        User.findOneAndUpdate( {id: decodedToken.uid}, {$set: {toJoinedRoom: ""}}, function(err, user) {
                            if(err) {
                                console.log(err);
                            } else {
                                console.log(user);
                            }
                        });
                    }
                });
            }).catch(function(error) {
                console.log(error);
            });
        });

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
            //socket.emit('joinedRoom', roomId);
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
            console.log(counter);
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
            Socket.findOneAndRemove( {id: socket.id}, function(err, socket) {

            });
            console.log('user disconnected ' + socket.joinedRoom + " " + socket.id);
            io.to(socket.joinedRoom).emit('leave', {clientId: socket.id, counter: socket.counter});
            socket.leave(socket.joinedRoom);
            socket.emit('left', 'left');
        });
    }
});


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/html/start.html');
    //res.sendFile(__dirname + '/index.html');
});

app.get('/start', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/start/:roomid', function(req, res) {
    if(req.params.roomid !== undefined) {
        var toCheckedId = req.params.roomid.replace("room", "");
        Socket.findOne( {id: toCheckedId}, function(err, socket) {
            if(socket) {
                console.log('verified');
                User.findOneAndUpdate( {id: req.session.uid}, {$set: {toJoinedRoom: req.params.roomid}}, function(err, user) {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log(user);
                    }
                });
            } else {
                console.log('fake');
            }
        });
    }
    res.redirect('/start');
});

//Port-Einstellungen
//Der Server horcht auf den Port 8888.
server.listen(process.env.PORT || 8888, function() {
    console.log('Server listens on Port 8888');
});