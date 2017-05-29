module.exports = function(app, connection, htmlspecialchars) {

	app.post('/pic_select', function(request, response) {
		if (request.session.error) {
			response.locals.error = request.session.error;
			request.session.error = undefined;
		}
		request.body.primpic = htmlspecialchars(request.body.primpic)
		request.body.selected_pic = htmlspecialchars(request.body.selected_pic)
		if (request.body.selected_pic) {
			connection.query('UPDATE photos SET primpic = ? WHERE primpic = ? AND login = ?', ['n', 'y', request.session.user], function(err, rows) {
				if (err) {
					throw err;
				}
			});
			connection.query('UPDATE photos SET primpic = ? WHERE id = ?', ['y', request.body.primpic], function(err, rows) {
				if (err) {
					throw err;
				}
			});
			connection.query('SELECT picpath FROM photos WHERE id = ?', [request.body.primpic], function(err, rows) {
				if (err) {
					throw err;
				}
				var primpicpath = rows[0].picpath;
				connection.query('UPDATE userdatas SET primpicpath = ? WHERE login = ?', [primpicpath, request.session.user], function(err, rows) {
					if (err) {
						throw err;
					}
				});
			});
		}
		else if (request.body.deleted_pic) {
			connection.query('DELETE FROM photos WHERE id = ? AND login = ?', [request.body.primpic, request.session.user], function(err, rows) {
				if (err) {
					throw err;
				}
			});
		}
		response.redirect('/profile?login='+request.session.user);
	});

}