module.exports = function(app, connection, htmlspecialchars, crypto, extLib, NodeGeocoder, geocoder) {
	
	app.get('/profile', function(request, response) {
		if (request.session.error) {
			response.locals.error = request.session.error;
			request.session.error = undefined;
		}
		var login = htmlspecialchars(request.query.login);
		var room = '';

		connection.query('SELECT * FROM notifs WHERE user2 = ? ORDER BY id DESC LIMIT 100', [request.session.user], function(err, notifs) {
			if (err) {
				throw err;
			}
			connection.query('SELECT COUNT(*) as count FROM notifs WHERE user2 = ? AND unread = ?', [request.session.user, "y"], function(err, count) {
				if (err) {
					throw err;
				}
				connection.query('SELECT * FROM userdatas WHERE login = ?', [login], function(err, rows) {
					if (err) {
						throw err;
					}
					if (rows[0]) {
						if (rows[0].loc == "") {
							var loc = undefined;
						}
						else {
							var loc = JSON.parse(rows[0].loc);
						}
						connection.query('SELECT * 	FROM likes WHERE login = ? AND liked = ?', [request.session.user, login], function(err, result) {
							if (err) {
								throw err;
							}
							var alreadylike = undefined;
							var matcha = undefined;
							var imliked = undefined;
							if (result[0]) {
								alreadylike = "yes";
							}
							connection.query('SELECT * 	FROM likes WHERE login = ? AND liked = ?', [login , request.session.user], function(err, result) {
								if (err) {
									throw err;
								}
								if (result[0]) {
									if (alreadylike == 'yes') {
										matcha = "yes";		
									}
									imliked = "yes";
								}
							});
							connection.query('SELECT * FROM photos WHERE login = ?', [request.session.user], function(err, photos) {
								if (err) {
									throw err;
								}
								var oklike = 'n';
								if (photos[0]) {
									oklike = 'y';
								}
								connection.query('SELECT * FROM hobbies WHERE login = ?', [login], function(err, res) {
									if (err) {
										throw err;
									}
									var hobbies = undefined;
									if (res[0]) {
										hobbies = res;
									}
									connection.query('SELECT * FROM blocks', function(err, blockedUsers) {
										if (err) {
											throw err;
										}
										connection.query('SELECT * FROM photos WHERE login = ?', [login], function(err, photos) {
											if (err) {
												throw err;
											}
											if (photos[0]) {
												var picpath = undefined;
												for (var i = 0; i < photos.length; i++) {
													if (photos[i].primpic === 'y') {
														picpath = photos[i].picpath;
													}
												}
												
												response.render('pages/profile', {user: request.session.user, blockedUsers: blockedUsers, hobbies: hobbies, oklike: oklike, matcha: matcha, imliked: imliked, alreadylike: alreadylike, photos: photos, primpic: picpath, loc: loc, lastco: rows[0].lastco, city: rows[0].city, popularity: rows[0].popularity, login: rows[0].login, firstname: rows[0].firstname, name: rows[0].name, email: rows[0].email, password: "********", sex: rows[0].sex, birthdate: rows[0].birthdate, age: rows[0].age, orientation: rows[0].orientation, bio: rows[0].bio, online: rows[0].online, notifs: notifs, count: count[0].count});							
											}
											else {
												response.render('pages/profile', {user: request.session.user, blockedUsers: blockedUsers, hobbies: hobbies, oklike: oklike, matcha: matcha, imliked: imliked, alreadylike: alreadylike, photos: photos, primpic: picpath, loc: loc, lastco: rows[0].lastco, city: rows[0].city, popularity: rows[0].popularity, login: rows[0].login, firstname: rows[0].firstname, name: rows[0].name, email: rows[0].email, password: "********", sex: rows[0].sex, birthdate: rows[0].birthdate, age: rows[0].age, orientation: rows[0].orientation, bio: rows[0].bio, online: rows[0].online, notifs: notifs, count: count[0].count});							
											}
										});
									});
								});
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


	app.post('/profile', function(request, response) {
		if (request.session.error) {
			response.locals.error = request.session.error;
			request.session.error = undefined;
		}
		var name = htmlspecialchars(request.body.name);
		var val = htmlspecialchars(request.body.value);
		var value = extLib.escapeQuotes(val);
		if (name == 'birthdate') {
			var now = new Date();
			var year = parseInt(value.substr(0, 4));
			var age = now.getFullYear() - year;
			connection.query('UPDATE userdatas SET age = ? WHERE login = ?', [age, request.session.user], function(err, rows) {
				if (err) {
					throw err;
				}		
			});
		}
		else if (name == 'password') {
				var hashpwd = crypto.createHash('whirlpool').update(value).digest('hex');
				value = hashpwd;
		}
		if (name == 'hobbie') {
				connection.query('INSERT INTO hobbies SET '+name+' = ?, login = ?', [value, request.session.user], function(err, rows) {
					if (err) {
						throw err;
					}
				});
		}
		else {
			if (name == 'city') {
				geocoder.geocode(value, function(err, res) {
		  			connection.query('UPDATE userdatas SET loc = ? WHERE login = ?', [JSON.stringify(res[0]), request.session.user], function(err, rows) {
						if (err) {
							throw err;
						}
					});
				});
			}
			connection.query('UPDATE userdatas SET '+name+' = ? WHERE login = ?', [value, request.session.user], function(err, rows) {
				if (err) {
					throw err;
				}
			});
		}
		if (name == 'login') {
			connection.query('UPDATE photos SET login = ? WHERE login = ?', [value, request.session.user], function(err, rows) {
				if (err) {
					throw err;
				}
			});
			connection.query('UPDATE likes SET login = ? WHERE login = ?', [value, request.session.user], function(err, rows) {
				if (err) {
					throw err;
				}
			});
			connection.query('UPDATE likes SET liked = ? WHERE liked = ?', [value, request.session.user], function(err, rows) {
				if (err) {
					throw err;
				}
			});
			request.session.user = value;
		}
		response.redirect('/profile?login='+request.session.user);
	});

}