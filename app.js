//Express-module einbinden
var express = require('express');
//http-module einbinden
var http = require('http');
//body-parser-module einbinden
var bodyParser = require('body-parser');
//mongoose-module einbinden
var mongoose = require('mongoose');
//Firebase-Auth Admin-module einbinden
var admin = require('firebase-admin');
//cors-module einbinden für Cross-Origin-Requests
var cors = require('cors');
//express-session-module einbinden für das Nutzen von express-socket.io-session
var session = require('express-session')({
    secret: 'my-secret',
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 86400
    },
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
//express-socket.io-session-module einbinden zum Teilen von Daten zwischen express und socket.io
var sharedSession = require('express-socket.io-session');
var app = express();
var server = http.createServer(app);
//socket.io einbinden und mit Express verknüpfen
var io = require('socket.io')(server);

//Datenbankverbindung zu mLab
mongoose.connect('mongodb://ducle:mongoshutappsweb@ds133465.mlab.com:33465/shutappsweb');

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("DB connected!");
});

var Schema = mongoose.Schema;

//Datenstruktur der User-Daten
var userSchema = new Schema({
    uid: String,
    name: String,
    picture: String,
    connection: String,
    toJoinedRoom: String,
    contacts: [{
        _id: false,
        uid: String,
        timeSpent: String
    }]
});

//Datenstruktur der Socket-Daten
var socketSchema = new Schema({
    id: String
});

var User = mongoose.model('User', userSchema);
var Socket = mongoose.model('Socket', socketSchema);

//App-Konfigurationen
//Zugriff auf die statischen HTML-Seiten
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(session);
app.use(cors({origin: 'http://localhost:8888'}));

//socket.io mit express-socket.io-session verknüpfen
io.use(sharedSession(session, {
    autoSave: true
}));

//Firebase Auth Admin initialisieren
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

//Kommunikation durch socket.io
io.on('connection', function(socket) {
    
    console.log('connected: ' + socket.id);
    var data = {
        id: socket.id
    };
    var saveSocket = new Socket(data);
    //Speichern der aktiven Sockets auf der Datenbank
    saveSocket.save(function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log(socket.id + " wurde gespeichert");
        }
    });
    
    socket.counter = 0;
    
    callListeners();
    
    //Alle Ereignisse, die in der App genutzt werden, werde in die callListeners()-Funktion gepackt
    function callListeners() {
        //Registiert und horcht auf das auth-Ereignis
        socket.on('auth', function(data) {
            var idToken = data.idToken;
            //ID-Token ist authentifiziert
            admin.auth().verifyIdToken(idToken)
                .then(function(decodedToken) {
                var uid = decodedToken.uid;
                var standardPic = "https://scontent.xx.fbcdn.net/v/t1.0-1/c29.0.100.100/p100x100/10354686_10150004552801856_220367501106153455_n.jpg?oh=049ecfece14dfe681a2cc083eeaabc6f&oe=5AA0FC77";
                console.log(decodedToken);
                var users = {};

                //User-Daten werden erstellt
                users.uid = decodedToken.uid;
                //Je nach Login über Facebook oder Firebase werden die User-Daten variiert
                if(decodedToken.firebase.sign_in_provider == "facebook.com") {
                    users.name = decodedToken.name;
                    users.picture = decodedToken.picture;
                } else {
                    users.name = decodedToken.email;
                    users.picture = standardPic;
                }
                users.connection = socket.id;
                users.toJoinedRoom = "";

                //Teilen der authentifizierten User-ID mit Express
                socket.handshake.session.uid = decodedToken.uid;
                socket.handshake.session.save();

                var userProfile = new User(users);
                User.findOne( { uid: decodedToken.uid }, function(err, user) {
                    //Speichern der erstellten User-Daten auf der Datenbank
                    if(!user) {
                        userProfile.save(function(err) {
                            if(err) {
                                console.log(err);
                            } else {
                                console.log('User hinzugefügt');
                            }
                        });
                        //console.log('save');
                    } else { 
                        //console.log(user.toJoinedRoom);
                        //ein aktiver Socket wird dem Nutzer zugeordnet und in der Datenbank zwischengespeichert
                        User.findOneAndUpdate( {uid: decodedToken.uid}, {$set: {'connection': socket.id}}, function(err, user) {
                            if(err) {
                                console.log(err);
                            } else {

                            }
                        });
                        
                        //In dem Fall, das in toJoinedRoom eine Socket-ID gespeichert ist, wird der Nutzer in diesem Raum zugeordnet
                        if(user.toJoinedRoom !== "") {
                            //Beefehl zum Beitreten
                            socket.join(user.toJoinedRoom);
                            //setzt toJoinedRoom wieder auf einen leeren String
                            User.findOneAndUpdate( {uid: decodedToken.uid}, {$set: {toJoinedRoom: ""}}, function(err, user) {
                                if(err) {
                                    console.log(err);
                                } else {
                                    console.log(user);
                                }
                            });
                            socket.joinedRoom = user.toJoinedRoom;
                            //Anzeige aller im Raum vorhandenen Clients
                            var clients = io.sockets.adapter.rooms[user.toJoinedRoom].sockets;
                            User.findOne( {connection: socket.id}, function(err, userdata) {
                                if(err) {
                                        
                                } else {
                                    User.findOne( {connection: user.toJoinedRoom.replace("room", "")}, function(err, owner) {
                                        if(owner) {
                                            var ownerData = {
                                                name: owner.name,
                                                picture: owner.picture
                                            };
                                        }
                                        if(userdata) {
                                            var userData = {
                                                name: userdata.name,
                                                picture: userdata.picture
                                            }
                                        }
                                        //show join notification for joined user
                                        //Darstellung der im Raum befindenen Nutzer aus Sicht des neuen Nutzers
                                        socket.emit('clients', ownerData);
                                        //show join notification for all others user in the room
                                        //Darstellung der im Raum befindenen Nutzer aus Sicht der anderen Nutzer
                                        io.to(user.toJoinedRoom).emit('clients', userData);
                                    });
                                }    
                            });
                        }
                    }
                });
            }).catch(function(error) {
                console.log(error);
            });
        });

        //Registiert und horcht auf das create-Ereignis
        socket.on('create', function(client) {
            var roomId = 'room' + client;
            //Da jeder Nutzer einen Raum mit seiner socket.id hat, wird der Nutzer erst aus dem Raum geworfen
            //und anschließend in dem neuen Raum mit der neuen ID zugeordnet
            if(socket.counter == 0) {
                socket.leave(client);
                socket.join(roomId);
                socket.joinedRoom = roomId;
                var clients = io.sockets.adapter.rooms[roomId].sockets;
                for(var key in clients) {
                    User.findOne( {connection: key}, function(err, user) {
                        if(err) {

                        } else {
                            if(user) {
                                var userData = {
                                    name: user.name,
                                    picture: user.picture
                                }
                                io.to(roomId).emit('clients', userData);
                            }
                        }
                    });
                };
            }
            //Senden der Raum-ID zum Client für das Erstellen des QR-Codes
            socket.emit('roomId', roomId);
        });

        //Registiert und horcht auf start-Ereignis
        socket.on('start', function(session) {
            //console.log(session);
            //Server weiß Bescheid und sendet endgültigen Befehl zum Starten des Timers
            io.to(session).emit('startCounter', "startCounter");
        });

        //Registiert und horcht auf counter-Ereignis
        //aktuelle Zeit des laufenden Timers wird zwischengespeichert
        socket.on('counter', function(counter) {
            //console.log(counter);
            socket.counter = counter;
        });

        //registiert und horcht auf disconnect-Ereignis
        //wird jedes Mal ausgeführt, sobald eine aktuelle Socket-Verbindung getrennt wird
        socket.on('disconnect', function() {
            if(socket.counter > 0) {
                //Kontrolle, ob der Socket während der Verbindung in einem Raum war
                if(socket.joinedRoom !== undefined) {
                    if(io.sockets.adapter.rooms[socket.joinedRoom] !== undefined) {
                        var clients = io.sockets.adapter.rooms[socket.joinedRoom].sockets;
                        var tempArray = [];
                        var i = 0;
                        var j = 0;
                        //Berechnung der verbrachten Zeit in einem Raum
                        for(var key in clients) {
                            tempArray.push(key);
                            User.findOne( {uid: socket.handshake.session.uid}, function(err, contact) {
                                if(err) {
                                    console.log(err);
                                } else {
                                    //console.log(tempArray[i++]);
                                    //Berechnung der verbrachten Zeit aus der Sicht 1:n
                                    User.findOne( {connection: tempArray[i++]}, function(err, userdata) {
                                        if(userdata) {
                                            User.findOne( {uid: socket.handshake.session.uid, 'contacts.uid': userdata.uid}, function(err, contacts) {
                                                //wenn contacts mit einer bestimmten uid noch nicht vorhanden ist
                                                //neuer Eintrag wird erstellt
                                                //console.log(contacts);
                                                if(!contacts) {
                                                    User.update( {uid: socket.handshake.session.uid}, {$push: {contacts: {uid: userdata.uid, timeSpent: socket.counter}}}, function(err, user) {
                                                        if(err) {
                                                            console.log(err);
                                                        } else {

                                                        }
                                                    });
                                                //wenn contacts mit bestimmter uid vorhanden ist
                                                //auf vorhandenen Eintrag zugreifen und Zeit aktualisieren
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
                            //Berechnung der verbrachten Zeit aus der Sicht n:1
                            User.findOne( {connection: tempArray[j], 'contacts.uid': socket.handshake.session.uid}, function(err, userdata) {
                                if(err) {
                                    console.log(err);
                                } else {
                                    //der verlassende Client ist noch nicht im contacts-Array vorhanden
                                    //neuer Eintrag wird erstellt
                                    if(!userdata) {
                                        User.update( {connection: tempArray[j++]}, {$push: {contacts: {uid: socket.handshake.session.uid, timeSpent: socket.counter}}}, function(err, user) {
                                            if(err) {
                                                console.log(err); 
                                            } else {

                                            }
                                        });
                                    //der verlassende Client ist im contacts-Array vorhanden
                                    } else {
                                        //Warte bis die vorherige Berechnung durchgeführt wurde
                                        setTimeout(function() {
                                            User.findOne( {uid: socket.handshake.session.uid, 'contacts.uid': userdata.uid}, function(err, contacts) {
                                                var tempItem = contacts.contacts.filter(function(item) {
                                                    return item.uid === userdata.uid;
                                                });
                                                User.update( {connection: tempArray[j++], 'contacts.uid': socket.handshake.session.uid}, {$set: {'contacts.$.timeSpent': tempItem[0].timeSpent}}, function(err, user) {
                                                    if(err) {
                                                        console.log(err);
                                                    } else {
                                                        console.log(user);
                                                    }
                                                });
                                            });
                                        }, 750);
                                    }
                                }
                            }); 
                        };
                    }
                    //dieser Client verlässt den Raum
                    socket.leave(socket.joinedRoom);
                }
            }
            //entfernt den geschlossenen Socket aus der Datenbank
            Socket.findOneAndRemove( {id: socket.id}, function(err, socket) {
                if(err) {
                    console.log(err);
                }
            });
            console.log('user disconnected ' + socket.joinedRoom + " " + socket.id);
            //console.log(socket.joinedRoom);
            User.findOne( {connection: socket.id}, function(err, user) {
                if(err) {
                
                } else {
                    if(user) {
                        //Benachrichtigung der im Raum verbleibenen Clients über das Verlassen dieses Clients
                        io.to(socket.joinedRoom).emit('leave', {clientId: user.name, counter: socket.counter});
                    }
                }
            });
            
            //Wert von toJoinedRoom wird auf einen leeren String gesetzt, wenn das nicht bereits schon getan wurde
            User.findOneAndUpdate( {uid: socket.handshake.session.uid}, {$set: {toJoinedRoom: ""}}, function(err, user) {
                if(err) {
                    console.log(err);
                } else {
                    //console.log(user);
                }
            });
        });
    }
});

//Route '/': Weiterleitung auf /login
app.get('/', function(req, res) {
    res.redirect('/login');
});

//Route '/login': Präsentiert die statische HTML-Seite login.html
app.get('/login', function(req, res) {
    res.sendFile(__dirname + '/public/html/login.html');
    //res.sendFile(__dirname + '/index.html');
});

//Route '/home': Präsentiert die statische HTML-Seite index.html
app.get('/home', function(req, res) {
    //console.log(io.socket);
    res.sendFile(__dirname + '/index.html');
});

//Route '/contacts': Präsentiert die statische HTML-Seite contacts.html
app.get('/contacts', function(req, res) {
    res.sendFile(__dirname + '/public/html/contacts.html');
});

//Route '/users': Präsentiert alle in der Datenbank gespeichert User
app.get('/users', function(req, res) {
    User.find({}, function(err, user) {
        if(err) {
            res.status(500);
        } else {
            res.status(200);
            res.send(user);
        }
    });
});

//Route '/users/:uid': Präsentiert einen bestimmten User mit der User-ID uid
app.get('/users/:uid', function(req, res) {
    User.findOne( {uid: req.params.uid}, function(err, user) {
        if(err) {
        
        } else {
            res.status(200);
            res.send(user);
        }
    });
});
        
//Route '/users/:uid' zum Aktualisieren des Users uid
app.put('/users/:uid', function(req, res) {
    User.findOneAndUpdate( {uid: req.params.uid}, {$set: req.body}, function(err, user) {
        if(err) {
            
        } else {
            res.status(200);
            res.send("User aktualisiert");
        }
    });
});
    
//Route '/users/:uid' zum Löschen des Users uid
app.delete('/users/:uid', function(req, res) {
    User.findOneAndRemove( {uid: req.params.uid}, function(err, user) {
        if(err) {
            
        } else {
            res.status(200);
            res.send("User gelöscht");
        }
    });
});

//Route '/home/:roomid' zur Anfrage zum Beitreten eines Raumes
app.get('/home/:roomid', function(req, res) {
    if(req.params.roomid !== undefined) {
        var toCheckedId = req.params.roomid.replace("room", "");
        //Kontrolle, ob die in der Raum-ID gespeicherten Socket-ID vorhanden ist
        Socket.findOne( {id: toCheckedId}, function(err, socket) {
            //Socket-ID ist vorhanden
            if(socket) {
                //console.log('verified');
                //console.log(req.session.uid);
                //Speichern der zu beitretenden Raum-ID in toJoinedRoom des anfragenden Clients
                User.findOneAndUpdate( {uid: req.session.uid}, {$set: {toJoinedRoom: req.params.roomid}}, function(err, user) {
                    if(err) {
                        console.log(err);
                    } else {
                        console.log(user);
                    }
                });
            //Socket-ID nicht vorhanden
            } else {
                //console.log('not verified');
            }
        });
    }
    //Weiterleitung auf die Route /home
    res.redirect('/home');
});

//Port-Einstellungen
//Der Server horcht auf den Port 8888.
server.listen(process.env.PORT || 8888, function() {
    console.log('Server listens on Port 8888');
});