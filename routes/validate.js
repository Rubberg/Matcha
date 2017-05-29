module.exports = function(app, connection, htmlspecialchars) {

	app.get('/validate', function(request, response) {
		if (request.session.user) {
			response.redirect('/home');
		}
		if (request.session.error) {
			response.locals.error = request.session.error;
			request.session.error = undefined;
		}
		
		if (request.query.login && request.query.key) {
			var login = htmlspecialchars(request.query.login);
			var key = htmlspecialchars(request.query.key);
			connection.query('SELECT * FROM userdatas WHERE login = ?', [login], function(err, rows) {
				if (err) {
					throw err;
				}
				if (rows[0].token == key) {
					connection.query('UPDATE userdatas SET token = ? WHERE login = ?', ['validate', login], function(err, rows) {
						if (err) {
							throw err;
						}
					});
				}
			});
		}
		request.session.error = "Votre compte est maintenant validé, connectez vous!";
		response.redirect('/');
	});
};