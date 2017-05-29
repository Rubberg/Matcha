module.exports = function(app, connection, htmlspecialchars, users) {

	app.get('/logout', function(request, response) {
		if (request.session.user) {
			connection.query('UPDATE userdatas SET online = ? WHERE login = ?', ['n', request.session.user], function(err, rows) {
				if (err) {
					throw err;
				}		
			});
			for (var i = 0; i < users.length; i++) {
				if (users[i].login == request.session.user) {
					users.splice(i, 1);
				}
			}
			request.session.user = undefined;

		}
		response.redirect('/');
	});
}