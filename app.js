var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var uuid = require('uuid');
var mongoose = require('mongoose');
var admin = require('firebase-admin');
var cors = require('cors');
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

//mongoose.set('debug', true);

var Schema = mongoose.Schema;

/*var sessionSchema = new Schema({
    session_id: {type: Schema.Types.ObjectId},
    users: [Schema.Types.ObjectId]
});*/

var userSchema = new Schema({
    uid: String,
    name: String,
    connection: String,
    toJoinedRoom: String,
    contacts: [{
        _id: false,
        uid: String,
        timeSpent: String
    }]
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
app.use(cors({origin: 'http://localhost:8888'}));

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
    
    callListeners();
    //console.log(socket.eventNames());
    
    function callListeners() {
        socket.on('auth', function(data) {
            var idToken = data.idToken;
            admin.auth().verifyIdToken(idToken)
                .then(function(decodedToken) {
                var uid = decodedToken.uid;
                console.log(decodedToken);

                users.uid = decodedToken.uid;
                users.name = decodedToken.email;
                users.connection = socket.id;
                users.toJoinedRoom = "";

                socket.handshake.session.uid = decodedToken.uid;
                socket.handshake.session.save();

                var userProfile = new User(users);
                User.findOne( { uid: decodedToken.uid }, function(err, user) {
                    if(!user) {
                        userProfile.save(function(err) {
                            if(err) {
                                console.log(err);
                            } else {
                                console.log('User hinzugefügt');
                            }
                            console.log("astast");
                        });
                        console.log('save');
                    } else { //1. User neu gespeichert = toJoinedRoom sowieso leer
                        //console.log(user.toJoinedRoom);
                        User.findOneAndUpdate( {uid: decodedToken.uid}, {$set: {'connection': socket.id}}, function(err, user) {
                            if(err) {
                                console.log(err);
                            } else {

                            }
                        });
                        
                        if(user.toJoinedRoom !== "") {
                            socket.join(user.toJoinedRoom);
                            socket.joinedRoom = user.toJoinedRoom;
                            //socket.emit('joinedRoom', user.toJoinedRoom);
                            io.to(user.toJoinedRoom).emit('joinedRoom', user.toJoinedRoom);
                            var clients = io.sockets.adapter.rooms[user.toJoinedRoom].sockets;
                            User.findOne( {connection: socket.id}, function(err, userdata) {
                                if(err) {
                                        
                                } else {
                                    User.findOne( {connection: user.toJoinedRoom.replace("room", "")}, function(err, owner) {
                                        socket.emit('clients', owner.name);
                                        io.to(user.toJoinedRoom).emit('clients', userdata.name);
                                    });
                                }    
                            });
                            User.findOneAndUpdate( {id: decodedToken.uid}, {$set: {toJoinedRoom: ""}}, function(err, user) {
                                if(err) {
                                    console.log(err);
                                } else {
                                    console.log(user);
                                }
                            });
                        }
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
            for(var key in clients) {
                User.findOne( {connection: key}, function(err, user) {
                    if(err) {
                    
                    } else {
                        io.to(roomId).emit('clients', user.name);
                    }    
                });
            };
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

        socket.on('leave', function(session) {
            var clientId = session.id;
            var roomId = session.roomId;
            if(io.sockets.adapter.sids[socket.id][roomId]) {
                socket.leave(roomId);
                io.to(roomId).emit('leave', {clientId: clientId, counter: socket.counter});
            }
        });

        socket.on('disconnect', function() {
            if(socket.joinedRoom !== undefined) {
                if(io.sockets.adapter.rooms[socket.joinedRoom] !== undefined) {
                    var clients = io.sockets.adapter.rooms[socket.joinedRoom].sockets;
                    var tempArray = [];
                    var i = 0;
                    var j = 0;
                    for(var key in clients) {
                        tempArray.push(key);
                        User.findOne( {uid: socket.handshake.session.uid}, function(err, contact) {
                            if(err) {
                                console.log(err);
                            } else {
                                //console.log(tempArray[i++]);
                                User.findOne( {connection: tempArray[i++]}, function(err, userdata) {
                                    if(userdata) {
                                        User.findOne( {uid: socket.handshake.session.uid, 'contacts.uid': userdata.uid}, function(err, contacts) {
                                            //wenn contacts mit einer bestimmten uid nicht vorhanden ist
                                            //console.log(contacts);
                                            if(!contacts) {
                                                //ToDO: zwei Szenarios: der geleavte bekommt Zeit von allen anderen, die zurückgebliebenen bekommen Zeit von geleavten
                                                User.update( {uid: socket.handshake.session.uid}, {$push: {contacts: {uid: userdata.uid, timeSpent: socket.counter}}}, function(err, user) {
                                                    if(err) {
                                                        console.log(err);
                                                    } else {

                                                    }
                                                });
                                            //wenn contacts mit bestimmter uid vorhanden ist
                                            } else {
                                                var tempTime = contacts.contacts.filter(function(item) {
                                                    return item.uid === userdata.uid;
                                                });
                                                var newTimeSpentInt = parseInt(tempTime[0].timeSpent) + parseInt(socket.counter);
                                                var newTimeSpent = newTimeSpentInt.toString();
                                                User.update( {uid: socket.handshake.session.uid, 'contacts.uid': userdata.uid}, {$set: {'contacts.$.timeSpent': newTimeSpent}}, function(err, user) {
                                                    if(err) {
                                                        console.log(err);
                                                    } else {

                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                        //Problem: wenn Zeit aktualisiert wird, wird nciht richtig berechnet

                        User.findOne( {connection: tempArray[j], 'contacts.uid': socket.handshake.session.uid}, function(err, userdata) {
                            if(err) {
                                console.log(err);
                            } else {
                                if(!userdata) {
                                    User.update( {connection: tempArray[j++]}, {$push: {contacts: {uid: socket.handshake.session.uid, timeSpent: socket.counter}}}, function(err, user) {
                                        if(err) {
                                            console.log(err); 
                                        } else {

                                        }
                                    });
                                } else {
                                    /*var tempTime = userdata.contacts.filter(function(item) {
                                        return item.uid === socket.handshake.session.uid;
                                    });
                                    var newTimeSpentInt = parseInt(tempTime[0].timeSpent) + parseInt(socket.counter);
                                    var newTimeSpent = newTimeSpentInt.toString();
                                    console.log(tempArray[j]);
                                    console.log(newTimeSpentInt);*/
                                    User.findOne( {uid: socket.handshake.session.uid, 'contacts.uid': userdata.uid}, function(err, contacts) {
                                        var tempItem = contacts.contacts.filter(function(item) {
                                            return item.uid === userdata.uid;
                                        });
                                        console.log(tempItem);
                                        User.update( {connection: tempArray[j++], 'contacts.uid': socket.handshake.session.uid}, {$set: {'contacts.$.timeSpent': tempItem[0].timeSpent}}, function(err, user) {
                                            if(err) {
                                                console.log(err);
                                            } else {

                                            }
                                        });
                                    });
                                }
                            }
                        });
                    };
                }
            }
            Socket.findOneAndRemove( {id: socket.id}, function(err, socket) {
                if(err) {
                    console.log(err);
                }
            });
            console.log('user disconnected ' + socket.joinedRoom + " " + socket.id);
            console.log(socket.joinedRoom);
            User.findOne( {connection: socket.id}, function(err, user) {
                if(err) {
                
                } else {
                    io.to(socket.joinedRoom).emit('leave', {clientId: user.name, counter: socket.counter});
                }
            });
            socket.leave(socket.joinedRoom);
            socket.emit('left', socket.counter);
        });
    }
});


app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/html/login.html');
    //res.sendFile(__dirname + '/index.html');
});

app.get('/main', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/contacts', function(req, res) {
    res.sendFile(__dirname + '/public/html/contacts.html');
});

app.get('/users/:uid', function(req, res) {
    User.findOne( {uid: req.params.uid}, function(err, user) {
        if(err) {
        
        } else {
            res.status(200);
            res.send(user);
        }
    });
});

app.get('/main/:roomid', function(req, res) {
    if(req.params.roomid !== undefined) {
        var toCheckedId = req.params.roomid.replace("room", "");
        Socket.findOne( {id: toCheckedId}, function(err, socket) {
            if(socket) {
                console.log('verified');
                console.log(req.session.uid);
                User.findOneAndUpdate( {uid: req.session.uid}, {$set: {toJoinedRoom: req.params.roomid}}, function(err, user) {
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
    res.redirect('/main');
});

//Port-Einstellungen
//Der Server horcht auf den Port 8888.
server.listen(process.env.PORT || 8888, function() {
    console.log('Server listens on Port 8888');
});