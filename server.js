// Les middlewares du serveur
var http = require('http');
var express = require('express');
var session = require('express-session');
var app = express();
var bodyParser = require('body-parser');

// Les middlewares de l'app
var extLib = require('./public/extLib.js');
var nodemailer = require('nodemailer');
var moment = require('moment');
var NodeGeocoder = require('node-geocoder');
var geocoder = NodeGeocoder({provider: 'google'});
var busboy = require('connect-busboy');
var fs = require('fs');
var distance = require('haversine');
var crypto = require('crypto');
var htmlspecialchars = require('htmlspecialchars');
var connection = require('./config/db');
var users = [];


// Moteur de template
app.set('view engine', 'ejs');
app.set('trust_proxy', 1);

// Lancement du serveur
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use(busboy());
app.use(session({
	secret: 'prout',
	resave: true,
	saveUninitialized: true,
	cookie: {secure: false}
}));
var server = http.Server(app).listen(8080);;


// Les routes
require('./routes/index.js')(app, connection, htmlspecialchars, crypto, distance, users, fs, busboy, extLib, NodeGeocoder, geocoder, moment, nodemailer);


//Le système de notifications via socket
var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {

	//Mise à jour de la liste des utilisateurs connéctés
 	socket.on('newUser', function(data) {
 		data.login = htmlspecialchars(data.login)
 		for (var i = 0; i < users.length; i++) {
 			if (users[i].login == data.login) {
 				users.splice(i, 1);
 			}
 		}
 		users.push(data);
 	});

 	//Ajout d'un nouvel hobbie
 	socket.on('hobbie', function(data) {
 		data.hobbie = htmlspecialchars(data.hobbie)
		var connection = require('./config/db');
 		connection.query('SELECT * 	FROM hobbies WHERE hobbie = ?', [data.hobbie], function(err, result) {
			if (err) {
				throw err;
			}
			if (result[0]) {
				io.to(data.id).emit('hobbieUsers', {hobbieUsers: result});
			}
		});
 	});

 	//Mise à jour de la localisation
 	socket.on('newLoc', function(data) {		
 		data.loc = JSON.parse(data.loc)
 		if ((parseInt(data.loc.lat) != NaN) && (parseInt(data.loc.lon) != NaN))
 		{
	 		data.loc = JSON.stringify(data.loc)
	 		data.login = htmlspecialchars(data.login)
			var connection = require('./config/db');
	 		connection.query('UPDATE userdatas SET loc = ? WHERE login = ?', [data.loc, data.login], function(err, rows) {
				if (err) {
					throw err;
				}
			});
 		}
 	});

 	//Event de consultation des notifs
 	socket.on('readNotifs', function(data) {
		var connection = require('./config/db');
		data.user = htmlspecialchars(data.user)
		var read = htmlspecialchars(data.read);
		if (data.delChat) {
			connection.query('UPDATE notifs SET unread = ? WHERE user2 = ? AND content = ?', ['n', data.user, read+' vous a envoyé un message.'], function(err, rows) {
				if (err) {
					throw err;
				}
			});
		}
		else {
			connection.query('UPDATE notifs SET unread = ? WHERE user2 = ?', ['n', read], function(err, rows) {
				if (err) {
					throw err;
				}
			});
		}
 	});

 	//Event d'enregistrement d'une nouvelle visite
 	socket.on('newVisit', function(data) {
		var connection = require('./config/db');
 		var visited = htmlspecialchars(data.visited);
 		var visitor = htmlspecialchars(data.visitor);
		if (visited !== visitor) {
			var date = Date.now();
			connection.query('SELECT * FROM visits WHERE visitor = ? AND visited = ?', [visitor, visited], function(err, rows) {
				if (rows[0]) {
					connection.query('UPDATE visits SET date = ? WHERE visitor = ? AND visited = ?', [date, visitor, visited], function(err, res) {
						if (err) {
							throw err;
						}
					});
				}
				else {
					connection.query('INSERT INTO visits SET visitor = ?, visited = ?, date = ?', [visitor, visited, date], function(err, res) {
						if (err) {
							throw err;
						}
					});
				}
				connection.query('INSERT INTO notifs SET user1 = ?, user2 = ?, content = ?, unread = ?', [visitor, visited, visitor+" a visité votre profil.", "y"], function(err, rows) {
					if (err) {
						throw err;
					}
				});
			});
		}
 	});

 	//Event de vérification d'un match entre deux utilisateurs
 	socket.on('checkMatcha', function(data) {
 		data.user1 = htmlspecialchars(data.user1)
 		data.user2 = htmlspecialchars(data.user2)
		var connection = require('./config/db');
 		connection.query('SELECT * 	FROM likes WHERE login = ? AND liked = ?', [data.user1, data.user2], function(err, result) {
			if (err) {
				throw err;
			}
			if (result[0]) {
				connection.query('SELECT * 	FROM likes WHERE login = ? AND liked = ?', [data.user2 , data.user1], function(err, result) {
					if (err) {
						throw err;
					}
					var id = '';
					for (var i = 0; i < users.length; i++) {
						if (users[i].login == data.user1) {
							id = users[i].id;
						}
					}
					if (result[0]) {
						io.to(id).emit('checkedMatcha', {matcha: 'yes'});
					}
					else {
						io.to(id).emit('checkedMatcha', {matcha: 'no'});
					}
				});
			}
		});
 	});

 	//Event d'envoi d'un message
    socket.on('sentMsg', function(data) {
    	data.user = htmlspecialchars(data.user)
    	data.dest = htmlspecialchars(data.dest)
    	data.room = htmlspecialchars(data.room)
    	data.content = htmlspecialchars(data.content);
    	var content = extLib.escapeQuotes(data.content);
		var connection = require('./config/db');
		connection.query('SELECT * FROM chat WHERE (user1 = ? AND user2 = ?) OR (user1 = ? AND user2 = ?)', [data.user, data.dest, data.dest, data.user], function(err, rows) {
	    	if (err) {
				throw err;
			}
			if (rows[0]) {
				if (rows[0].content == '') {
					var chat = [];
				}
				else {
					var chat = JSON.parse(rows[0].content);
				}
				var msg = {'author': data.user, 'text': content};
				chat.push(msg);
				connection.query('UPDATE chat SET content = ? WHERE user1 = ? AND user2 = ?', [JSON.stringify(chat), rows[0].user1, rows[0].user2], function(err, res) {
					if (err) {
						throw err;
					}
				});

		    	io.sockets.in(socket.room).emit('newNotif', {type: 'msg', content: content, dest: data.dest, author: data.user, room: socket.room, newNotif: data.user+" vous a envoyé un message.", href: "/profile?login="+data.user});
		    	
		    	var id = '';
				for (var i = 0; i < users.length; i++) {
					if (users[i].login == data.dest) {
						id = users[i].id;
					}
				}
				io.to(id).emit('newNotif', {type: 'msg', content: content, dest: data.dest, author: data.user, room: data.room, newNotif: data.user+" vous a envoyé un message.", href: "/profile?login="+data.user});
		 
		    	connection.query('INSERT INTO notifs SET user1 = ?, user2 = ?, content = ?, unread = ?', [data.user, data.dest, data.user+" vous a envoyé un message.", "y"], function(err, rows) {
					if (err) {
						throw err;
					}
				});

			}
	    });

    });

    //Event d'envoi d'une notif
    socket.on('sendNotif', function(data) {
    	data.user = htmlspecialchars(data.user)
    	data.dest = htmlspecialchars(data.dest)
    	data.room = htmlspecialchars(data.room)
		var id = '';
		for (var i = 0; i < users.length; i++) {
			if (users[i].login == data.dest) {
				id = users[i].id;
			}
		}
    	if (data.type == 'visit') {
    		io.to(id).emit('newNotif', {type: 'visit', dest: data.dest, author: data.user, room: data.room, newNotif: data.user+" a visité votre profil.", href: "/profile?login="+data.user});
    	}
    	else if (data.type == 'like') {
    		io.to(id).emit('newNotif', {type: 'like', dest: data.dest, author: data.user, room: data.room, newNotif: data.user+" vous a matché.", href: "/profile?login="+data.user});
    	}
    	else if (data.type == 'likeboth') {
    		io.to(id).emit('newNotif', {type: 'likeboth', dest: data.dest, author: data.user, room: data.room, newNotif: data.user+" vous a matché en retour, vous pouvez chatter ensemble!", href: "/profile?login="+data.user});
    	}
    	else if (data.type == 'unlike') {
    		io.to(id).emit('newNotif', {type: 'unlike', dest: data.dest, author: data.user, room: data.room, newNotif: data.user+" ne vous matche plus.", href: "/profile?login="+data.user});
			
			io.sockets.in(socket.room).emit('noChat');
	    	var id = '';
			for (var i = 0; i < users.length; i++) {
				if (users[i].login == data.dest) {
					id = users[i].id;
					io.to(id).emit('noChat');
				}
			}
    	}
    });

    //Event d'enregistrement d'un signalement
    socket.on('newReport', function(data){
    	data.reported = htmlspecialchars(data.reported)
    	data.reporter = htmlspecialchars(data.reporter)
    	connection.query('SELECT COUNT (*) AS count FROM reports WHERE reported = ?', [data.reported], function(err, rows) {
    		if (err) {
				throw err;
			}
			var newCount = rows[0].count + 1;
			connection.query('SELECT * FROM reports WHERE reported = ? AND reporter = ?', [data.reported, data.reporter], function(err, rows) {
				if (!rows[0]) {
					if (newCount < 10) {
						connection.query('INSERT INTO reports SET reported = ?, reporter = ?', [data.reported, data.reporter], function(err, res) {
							if (err) {
								throw err;
							}
						});
					}
					else {
						connection.query('INSERT INTO blocks SET blocker= ?, blocked = ?', ['all', data.reported], function(err, res) {
							if (err) {
								throw err;
							}
						});
					}
				}
			});
    	});
    });

    //Event d'enregistrement d'un bloquage
    socket.on('newBlock', function(data){
    	data.blocked = htmlspecialchars(data.blocked)
    	data.blocker = htmlspecialchars(data.blocker)
		connection.query('SELECT * FROM blocks WHERE blocked = ? AND blocker = ?', [data.blocked, data.blocker], function(err, rows) {
			if (!rows[0]) {
				connection.query('INSERT INTO blocks SET blocked = ?, blocker = ?', [data.blocked, data.blocker], function(err, res) {
					if (err) {
						throw err;
					}
				});
			}
		});
    });
});


app.use(function(req, res, next){
    res.setHeader('Content-Type', 'text/plain');
    res.status(404).send('Page introuvable !');
});