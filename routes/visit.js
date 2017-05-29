module.exports = function(app, connection, htmlspecialchars) {

	app.post('/visit', function(request, response) {
		var visited = htmlspecialchars(request.body.visited);
		if (visited !== request.session.user) {
			var date = Date.now();
			connection.query('SELECT * FROM visits WHERE visitor = ? AND visited = ?', [request.session.user, visited], function(err, rows) {
				if (rows[0]) {
					connection.query('UPDATE visits SET date = ? WHERE visitor = ? AND visited = ?', [date, request.session.user, visited], function(err, res) {
						if (err) {
							throw err;
						}
					});
				}
				else {
					connection.query('INSERT INTO visits SET visitor = ?, visited = ?, date = ?', [request.session.user, visited, date], function(err, res) {
						if (err) {
							throw err;
						}
					});
				}
				connection.query('INSERT INTO notifs SET user1 = ?, user2 = ?, content = ?, unread = ?', [request.session.user, visited, request.session.user+" a visité votre profil.", "y"], function(err, rows) {
					if (err) {
						throw err;
					}
				});
			});
		}
	});
}