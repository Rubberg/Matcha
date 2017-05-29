module.exports = function(app, connection, htmlspecialchars, fs, busboy) {

	app.post('/upload', function(request, response) {
		connection.query('SELECT * FROM userdatas WHERE login = ?', [request.session.user], function(err, rows) {
			if (err) {
				throw err;
			}
			if (rows[0]) {
			    var fstream;
			    var id = rows[0].id;
			    var path = 'public/pictures/'+id+'/';
			    request.pipe(request.busboy);
			    request.busboy.on('file', function (fieldname, file, filename) {
			    	fs.access(path, fs.F_OK, function(err) {
					    if (err) {
					    	fs.mkdir(path);
					    } 
				        fstream = fs.createWriteStream(path+filename);
				        file.pipe(fstream);
				        fstream.on('close', function () {
				        	connection.query('SELECT * FROM photos WHERE login = ?', [request.session.user], function(err, rows) {
								if (err) {
									throw err;
								}
								var number = 1;
								if (rows[0]) {
									number = rows.length;
									if (number < 5) {
										number++;
									}
									else {
										request.session.error = "Vous ne pouvez avoir plus de 5 photos sur votre profil!";
										response.redirect('/profile?login='+request.session.user);
									}
								}
							    path = '../pictures/'+id+'/';
								connection.query('INSERT INTO photos SET login = ?, picpath = ?, primpic = ?', [request.session.user, path+filename, 'n'], function(err, rows) {
									if (err) {
										throw err;
									}		
								});
							});
						    response.redirect('/profile?login='+request.session.user);
				        });
					});
			    });	
			}
		});
	});
}