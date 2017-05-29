module.exports = function(app, connection, htmlspecialchars) {
	
	app.get('/chat', function(request, response) {
		var dest = htmlspecialchars(request.query.dest);
	    connection.query('SELECT * FROM chat WHERE (user1 = ? AND user2 = ?) OR (user1 = ? AND user2 = ?)', [request.session.user, dest, dest, request.session.user], function(err, rows) {
	    	if (err) {
				throw err;
			}
			if (rows[0]) {
				var content = '';
				if (rows[0].content) {
					content = JSON.parse(rows[0].content);
				}
				connection.query('SELECT * FROM notifs WHERE user2 = ? ORDER BY id DESC LIMIT 100', [request.session.user], function(err, notifs) {
					if (err) {
						throw err;
					}
					connection.query('SELECT COUNT(*) as count FROM notifs WHERE user2 = ? AND unread = ?', [request.session.user, "y"], function(err, count) {
						if (err) {
							throw err;
						}
						response.render('pages/chat', {user: request.session.user, dest: dest, room: rows[0].room, chatDatas: content, notifs: notifs, count: count[0].count});
					});
				});
			}
	    });
	});
};