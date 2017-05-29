module.exports = function(app, connection, htmlspecialchars, distance) {

	function getUserDatas(user) {
		connection.query('SELECT * FROM userdatas WHERE login = ?', [user], function(err, rows) {
			if (err) {
				throw err;
			}
			if (rows[0]) {
				return (rows);
			}
		});
	}
	
	app.get('/search', function(request, response) {
		if (request.session.error) {
			response.locals.error = request.session.error;
			request.session.error = undefined;
		}
		connection.query('SELECT * FROM notifs WHERE user2 = ? ORDER BY id DESC LIMIT 100', [request.session.user], function(err, notifs) {
			if (err) {
				throw err;
			}
			connection.query('SELECT COUNT(*) as count FROM notifs WHERE user2 = ? AND unread = ?', [request.session.user, "y"], function(err, count) {
				if (err) {
					throw err;
				}
				connection.query('SELECT * FROM userdatas WHERE login != ?', [request.session.user], function(err, rows) {
					if (err) {
						throw err;
					}
					var selection = rows;
					if (selection[0]) {
						var sessionUserDatas = "";
						connection.query('SELECT * FROM userdatas WHERE login = ?', [request.session.user], function(err, rows) {
							if (err) {
								throw err;
							}
							if (rows[0]) {
								sessionUserDatas = rows[0];
							}
							connection.query('SELECT * FROM blocks', function(err, blockedUsers) {
								if (err) {
									throw err;
								}
								if (request.query.hobbie) {
									connection.query('SELECT * FROM userdatas INNER JOIN hobbies ON userdatas.login = hobbies.login WHERE hobbie = ?', [request.query.hobbie], function(err, rows) {
										if (err) {
											throw err;
										}
										if (rows[0]) {
											response.render('pages/search', {user: request.session.user, sessionUserDatas: sessionUserDatas, users: rows, blockedUsers: blockedUsers, title: "Les profils partageant ce hobbie:", notifs: notifs, count: count[0].count});		
										}
										else {
											response.redirect('/');
										}
									});
								}
								else if (request.query.sort == 'matchedby') {
									connection.query('SELECT * FROM likes WHERE liked = ?', [request.session.user], function(err, rows) {
										if (err) {
											throw err;
										}
										if (rows[0]) {
											connection.query('SELECT * FROM userdatas INNER JOIN likes ON userdatas.login = likes.login WHERE liked = ?', [request.session.user], function(err, rows) {
												if (err) {
													throw err;
												}
												response.render('pages/search', {user: request.session.user, sessionUserDatas: sessionUserDatas, users: rows, blockedUsers: blockedUsers, title: "Les profils qui m'ont matchés:", notifs: notifs, count: count[0].count});		
											});
										}
										else {
											request.session.error = "Personne ne vous a encore matché!";
											response.redirect('/');
										}
									});
								}
								else if (request.query.sort == 'matching') {
									connection.query('SELECT * FROM likes WHERE login = ?', [request.session.user], function(err, rows) {
										if (err) {
											throw err;
										}
										if (rows[0]) {
											connection.query('SELECT * FROM likes INNER JOIN userdatas ON likes.liked = userdatas.login WHERE likes.login = ?', [request.session.user], function(err, rows) {
												if (err) {
													throw err;
												}
												response.render('pages/search', {user: request.session.user, sessionUserDatas: sessionUserDatas, users: rows, blockedUsers: blockedUsers, title: "Les profils que j'ai matchés:", notifs: notifs, count: count[0].count});		
											});
										}
										else {
											request.session.error = "Vous n'avez encore matché personne!";
											response.redirect('/');
										}
									});
								}
								else if ((request.query.sort == 'visitor') || (request.query.sort == 'visited')) {
									connection.query('SELECT * FROM visits WHERE '+request.query.sort+' = ?', [request.session.user], function(err, rows) {
										if (err) {
											throw err;
										}
										if (rows[0] && (request.query.sort == "visited")) {
											connection.query('SELECT * FROM visits INNER JOIN userdatas ON userdatas.login = visits.visitor WHERE visits.visited = ?', [request.session.user], function(err, rows) {
												if (err) {
													throw err;
												}
												if (rows[0]) {
													response.render('pages/search', {user: request.session.user, sessionUserDatas: sessionUserDatas, users: rows, blockedUsers: blockedUsers, title: "Les profils qui m'ont visités:", notifs: notifs, count: count[0].count});
												}
											});		
										}
										else if (rows[0] && (request.query.sort == "visitor")) {
											connection.query('SELECT * FROM visits INNER JOIN userdatas ON userdatas.login = visits.visited WHERE visits.visitor = ?', [request.session.user], function(err, rows) {
												if (err) {
													throw err;
												}
												if (rows[0]) {
													response.render('pages/search', {user: request.session.user, sessionUserDatas: sessionUserDatas, users: rows, blockedUsers: blockedUsers, title: "Les profils que j'ai visités:", notifs: notifs, count: count[0].count});
												}
											});	
										}
										else {
											request.session.error = "Aucun utilisateur ne correspond à votre requête!";
											response.redirect('/');
										}
									});
								}
								else {
									if (sessionUserDatas.loc) {
										var origLoc = JSON.parse(sessionUserDatas.loc);
										
										for (var i = 0; i < selection.length; i++) {
											var destLoc = JSON.parse(selection[i].loc);
											if (origLoc.lat) {
												start = {
												  	latitude: origLoc.lat,
												  	longitude: origLoc.lon
												}
											}
											else if (origLoc.latitude) {
												start = {
												  	latitude: origLoc.latitude,
												  	longitude: origLoc.longitude
												}
											}
											if (destLoc.lat) {
												end = {
												  	latitude: destLoc.lat,
												  	longitude: destLoc.lon
												}
											}
											else if (destLoc.latitude) {
												end = {
												  	latitude: destLoc.latitude,
												  	longitude: destLoc.longitude
												}
											}
											selection[i].distance = Math.round(distance(start, end));
										}
										if ((request.query.sort == 'age') || (request.query.sort == 'popularity') || (request.query.sort == 'distance')) {
											for (var i = 0; i < selection.length; i++) {
												if ((i < selection.length - 1) && (selection[i][request.query.sort] > selection[i + 1][request.query.sort])) {
													var temp = selection[i];
													selection[i] = selection[i + 1];
													selection[i + 1] = temp;
													i = 0;
												}
											}
											if (request.query.sort == 'popularity') {
												selection.reverse();
											}
										}
									}
									response.render('pages/search', {user: request.session.user, sessionUserDatas: getUserDatas(request.session.user), users: selection, blockedUsers: blockedUsers, title: "Faites une recherche avancée parmis tous les profils:", notifs: notifs, count: count[0].count});				
								}
							});

						});
					}
					else {
						response.redirect('/');
					}
				});
			});
		});
	});
};