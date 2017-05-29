module.exports = function(app, connection, htmlspecialchars, distance, extLib) {

	app.get('/home', function(request, response) {
		if (request.session.error) {
			response.locals.error = request.session.error;
			request.session.error = undefined;
		}

		function hobbieInSelec(hobbie, user, selec, i, j){
			var connection = require('../config/db');
			connection.query('SELECT * FROM hobbies INNER JOIN userdatas ON userdatas.login = hobbies.login WHERE hobbie = ? AND hobbies.login = ?', [hobbie, user.login], function(err, rows) {
				if (err) {
					throw err;
				}
				if (rows[0]) {
					selec.push(user);
				}
				if (i == j - 1) {
					if (selec[0]) {
						connection.query('SELECT COUNT(*) as count FROM notifs WHERE user2 = ? AND unread = ?', [request.session.user, "y"], function(err, count) {
							if (err) {
								throw err;
							}
							response.render('pages/home', {user: request.session.user, sessionUserDatas: sessionUserDatas, users: selec, title: "Les profils suggérés partageant ce hobbie:", notifs: notifs, count: count[0].count});
						});
					}
					else {
						request.session.error = "Aucun profil ne partage ce hobbie!";
						response.redirect('/');
					}
				}
			});
		}

		function getNotifs(user) {
			var connection = require('../config/db');
			connection.query('SELECT * FROM notifs WHERE user2 = ? AND unread = ? ORDER BY id DESC', [user, 'y'], function(err, rows) {
				if (err) {
					throw err;
				}
				if (rows[0]) {
					return (rows);
				}
			});
		}

		function commonHobbies (sessionUserDatas, user2Datas, selection, i, j, blockedUsers) {
			var connection = require('../config/db');
			connection.query('SELECT COUNT(*) as common FROM hobbies a INNER JOIN hobbies b ON a.hobbie = b.hobbie WHERE a.login = ? AND b.login = ?', [sessionUserDatas.login, user2Datas.login], function(err, res) {
				if (err) {
					throw err;
				}
				if (res[0].common >= 1) {
					selection.push(user2Datas);
					// console.log('hob: '+user2Datas.login)
				}
				if (i == j - 1) {
					connection.query('SELECT COUNT(*) as count FROM notifs WHERE user2 = ? AND unread = ?', [sessionUserDatas.login, "y"], function(err, count) {
						if (err) {
							throw err;
						}
						response.render('pages/home', {user: sessionUserDatas.login, sessionUserDatas: sessionUserDatas, users: selection, blockedUsers: blockedUsers, title: "Les profils suggérés:", notifs: getNotifs(sessionUserDatas.login), count: count[0].count});		
					});
				}
			});
		}

		var ts = new Date;
		var date = ts.toLocaleDateString();
		connection.query('UPDATE userdatas SET lastco = ? WHERE login = ?', [date, request.session.user], function(err, rows) {
			if (err) {
				throw err;
			}
		});


		var sessionUserDatas = '';
		var selection = [];

		connection.query('SELECT * FROM notifs WHERE user2 = ? ORDER BY id DESC LIMIT 100', [request.session.user], function(err, notifs) {
			if (err) {
				throw err;
			}
			connection.query('SELECT COUNT(*) as count FROM notifs WHERE user2 = ? AND unread = ?', [request.session.user, "y"], function(err, count) {
				if (err) {
					throw err;
				}
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
									response.render('pages/home', {user: request.session.user, sessionUserDatas: sessionUserDatas, users: rows, blockedUsers: blockedUsers, title: "Les profils partageant ce hobbie:", notifs: notifs, count: count[0].count});		
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
										response.render('pages/home', {user: request.session.user, sessionUserDatas: sessionUserDatas, users: rows, blockedUsers: blockedUsers, title: "Les profils qui m'ont matchés:", notifs: notifs, count: count[0].count});		
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
										response.render('pages/home', {user: request.session.user, sessionUserDatas: sessionUserDatas, users: rows, blockedUsers: blockedUsers, title: "Les profils que j'ai matchés:", notifs: notifs, count: count[0].count});		
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
											response.render('pages/home', {user: request.session.user, sessionUserDatas: sessionUserDatas, users: rows, blockedUsers: blockedUsers, title: "Les profils qui m'ont visités:", notifs: notifs, count: count[0].count});
										}
									});		
								}
								else if (rows[0] && (request.query.sort == "visitor")) {
									connection.query('SELECT * FROM visits INNER JOIN userdatas ON userdatas.login = visits.visited WHERE visits.visitor = ?', [request.session.user], function(err, rows) {
										if (err) {
											throw err;
										}
										if (rows[0]) {
											response.render('pages/home', {user: request.session.user, sessionUserDatas: sessionUserDatas, users: rows, blockedUsers: blockedUsers, title: "Les profils que j'ai visités:", notifs: notifs, count: count[0].count});
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
							connection.query('SELECT * FROM userdatas', function (err, users) {
								if (err) {
									throw err;
								}
								if (users[0]) {
									if (sessionUserDatas.loc) {
										var origLoc = JSON.parse(sessionUserDatas.loc);
										
										for (var i = 0; i < users.length; i++) {
											var destLoc = JSON.parse(users[i].loc);
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


											if (((sessionUserDatas.orientation == "Hetero") && (users[i].orientation != "Homo") && (sessionUserDatas.sex != users[i].sex) && ((sessionUserDatas.sex == "Femme") || (sessionUserDatas.sex == "Homme")) && ((users[i].sex == "Femme") || (users[i].sex == "Homme"))) 
												|| ((sessionUserDatas.orientation != "Hetero") && (sessionUserDatas.orientation != "Homo"))
												|| ((sessionUserDatas.orientation == "Homo") && (users[i].orientation != "Hetero") && (sessionUserDatas.sex == users[i].sex))
												|| ((sessionUserDatas.sex != "Femme") && (sessionUserDatas.sex != "Homme"))) {
												
												if (sessionUserDatas.login == users[i].login) {
													users.splice(i, 1);
													i--;
												}
												else {
													if ((users[i].distance = Math.round(distance(start, end))) < 50) {
														if ((users[i].orientation == "Homo") || (users[i].orientation == "Hetero")) {
															selection.unshift(users[i]);
														}
														else {
															selection.push(users[i])
														}
														// console.log('dist: '+users[i].login)
														users.splice(i, 1);
														i--;
													}
													else {
														// console.log('nodist: '+users[i].login)

													}
												}

											}
											else {
												// console.log('nosex: '+users[i].login)
												users.splice(i, 1);
												i--;
											}
										}

										for (var k = 0; k < users.length; k++) {
											if (users[k].popularity > 0) {
												selection.push(users[k]);
												// console.log('pop: '+users[k].login)
												users.splice(k, 1);
												k--;
											}
										}

										for (var j = 0; j < users.length; j++) {
											commonHobbies(sessionUserDatas, users[j], selection, j, users.length, blockedUsers);
										}


										if (!users.length) {
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
												response.render('pages/home', {user: request.session.user, sessionUserDatas: sessionUserDatas, users: selection, blockedUsers: blockedUsers, title: "Les profils suggérés par : "+request.query.sort, notifs: notifs, count: count[0].count});										
											}
											else {
												// console.log(blockedUsers)
												response.render('pages/home', {user: request.session.user, sessionUserDatas: sessionUserDatas, users: selection, blockedUsers: blockedUsers, title: "Les profils suggérés:", notifs: notifs, count: count[0].count});
											}
										}
									}
									else {
										selection = users;
										response.render('pages/home', {user: request.session.user, sessionUserDatas: sessionUserDatas, users: selection, blockedUsers: blockedUsers, title: "Les profils suggérés:", notifs: notifs, count: count[0].count});								
									}		
								}
								else {
									response.redirect('/');
								}
							});
						}

					});
				});
			});
		});
	});
	
}