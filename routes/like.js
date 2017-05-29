module.exports = function(app, connection, htmlspecialchars) {
	
	app.post('/like', function(request, response) {
		if (request.session.user && request.body.likeduser) {
			var liked = htmlspecialchars(request.body.likeduser);
			connection.query('SELECT * FROM likes WHERE login = ? AND liked = ?', [request.session.user, liked], function(err, res) {
				if (err) {
					throw err;
				}
				if (res == '') {
					connection.query('INSERT INTO likes SET login = ?, liked = ?', [request.session.user, liked], function(err, rows) {
						if (err) {
							throw err;
						}
						connection.query('SELECT popularity FROM userdatas WHERE login = ?', [liked], function(err, rows) {
							if (err) {
								throw err;
							}
							var popularity = rows[0].popularity + 1;
							connection.query('UPDATE userdatas SET popularity = ? WHERE login = ?', [popularity, liked], function(err, rows) {
								if (err) {
									throw err;
								}
								connection.query('SELECT * FROM likes WHERE login = ? AND liked = ?', [liked, request.session.user], function(err, res) {
									if (err) {
										throw err;
									}
									if (res[0]) {
										connection.query('INSERT INTO chat SET room = ?, user1 = ?, user2 = ?, content = ?', [request.session.user+liked, request.session.user, liked, ''], function(err, rows) {
											if (err) {
												throw err;
											}
										});
										connection.query('INSERT INTO notifs SET user1 = ?, user2 = ?, content = ?, unread = ?', [request.session.user, liked, request.session.user+" vous a matché en retour, vous pouvez chatter ensemble.", "y"], function(err, rows) {
											if (err) {
												throw err;
											}
										});
									}
									else {
										connection.query('INSERT INTO notifs SET user1 = ?, user2 = ?, content = ?, unread = ?', [request.session.user, liked, request.session.user+" vous a matché.", "y"], function(err, rows) {
											if (err) {
												throw err;
											}
										});
									}
								});					
							});
						});		
					});
				}
			});
		}
		else if (request.session.user && request.body.unlikeduser) {
			var unliked = htmlspecialchars(request.body.unlikeduser);
			connection.query('SELECT * FROM likes WHERE login = ? AND liked = ?', [request.session.user, unliked], function(err, res) {
				if (res[0]) {
					connection.query('DELETE FROM likes WHERE login = ? AND liked = ?', [request.session.user, unliked], function(err, rows) {
						if (err) {
							throw err;
						}
						connection.query('SELECT popularity FROM userdatas WHERE login = ?', [unliked], function(err, rows) {
							if (err) {
								throw err;
							}
							var popularity = rows[0].popularity - 1;
							connection.query('UPDATE userdatas SET popularity = ? WHERE login = ?', [popularity, unliked], function(err, rows) {
								if (err) {
									throw err;
								}					
							});
						});		
					});
					connection.query('DELETE FROM chat WHERE (user1 = ? AND user2 = ?) OR (user1 = ? AND user2 = ?)', [request.session.user, unliked, unliked, request.session.user], function(err, rows) {
						if (err) {
							throw err;
						}
					});
					connection.query('INSERT INTO notifs SET user1 = ?, user2 = ?, content = ?, unread = ?', [request.session.user, unliked, request.session.user+" ne vous matche plus.", "y"], function(err, rows) {
						if (err) {
							throw err;
						}
					});
				}
			});
		}
		response.redirect('/profile?login='+request.session.user);
	});
}
