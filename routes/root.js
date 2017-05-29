module.exports = function(app, connection, htmlspecialchars, crypto, moment, nodemailer) {

	app.get('/', function(request, response) {
		if (request.session.user) {
			response.redirect('/home');
		}
		else {
			if (request.session.error) {
				response.locals.error = request.session.error;
				request.session.error = undefined;
			}
			response.render('pages/index', {user: undefined, notifs: ''});
		}
	});


	app.post('/', function(request, response) {
		request.session.error = undefined;
		for (var i = 0; i < request.body.length; i++) {
			if (request.body[i] === undefined || request.body[i] === '') {
				request.session.error = 'Veuillez remplir tous les champs!';
			}
			response.redirect('/');
		}
		if (request.body.submit !== 'forgotten') {
			if (request.body.login.length < 5 || request.body.login.length > 10) {
				request.session.error = "Le login doit comporter entre 5 et 10 caractères!";
			}
			if (request.body.password.length < 5) {
				request.session.error = "Le mot de passe doit comporter au moins 5 caractères!";
			}
			if (request.body.password.match(/[0-9]/) === null) {
				request.session.error = "Le mot de passe doit contenir au moins un chiffre!";
			}
		}

		if (request.session.error === undefined) {
			
			if (request.body.submit === 'create') {
				var login = htmlspecialchars(request.body.login);
				var name = htmlspecialchars(request.body.name);
				var firstname = htmlspecialchars(request.body.firstname);
				var email = htmlspecialchars(request.body.email);
				var password = htmlspecialchars(request.body.password);

				var token = Date.now();
				var hashpwd = crypto.createHash('whirlpool').update(password).digest('hex');
				connection.query('SELECT * FROM userdatas WHERE login = ?', [login], function(err, rows) {
					if (err) {
						throw err;
					}
					if (rows[0]) {
						request.session.error = "Ce login est déjà utilisé";
					}
					else {
						connection.query('INSERT INTO userdatas SET login = ?, firstname = ?, name = ?, email = ?, password = ?, token = ?, online = ?, sex = ?, birthdate = ?, age = ?, orientation = ?, bio = ?, city = ?', 
							[login, firstname, name, email, hashpwd, token, 'n', '?', '?', '?', '?', '?', '?'], function(err, result) {
								if (err) {
									throw err;
								}
							});
						var transporter = nodemailer.createTransport({
							service: 'Gmail',
							auth: {
								user: 'gdufeutr@gmail.com',
								pass: 'gdufeutr42'
							}
						});
						var mailOptions = {
						    from: '"Matcha" <googi@hotmail.fr>', // sender address 
						    to: email, // list of receivers 
						    subject: 'Activez votre compte Matcha!', // Subject line 
						    html: '<b><p>Bonjour '+ login +'!</p><p>Pour valider votre compte Matcha, veuillez cliquer sur le lien ci dessous ou le copier/coller dans votre navigateur internet.</p><p>http://localhost:8080/validate?login='+ login +'&key='+ token +'</p><p>---------------</p><p>Ceci est un mail automatique, Merci de ne pas y répondre.</p></b>'
						};
						transporter.sendMail(mailOptions, function(error, info){
						    if(error){
						        throw error;
						    }
							});
						request.session.error = "Finalisez la création de votre compte Matcha avec le mail que vous allez recevoir!";
					}
					response.redirect('/');
				});
			}
			else if (request.body.submit === 'connect') {
				var login = htmlspecialchars(request.body.login);
				var password = htmlspecialchars(request.body.password);
				var hashpwd = crypto.createHash('whirlpool').update(password).digest('hex');
				connection.query('SELECT * FROM userdatas WHERE login = ?', [login], function(err, rows) {
					if (err) {
						throw err;
					}
					if (rows[0]) {
						if (rows[0].password == hashpwd) {
							request.session.user = rows[0].login;
							connection.query('UPDATE userdatas SET online = ? WHERE login = ?', ['y', login], function(err, rows) {
								if (err) {
									throw err;
								}
								response.redirect('/home');
							});
						}
						else {
							request.session.error = "Mauvais mot de passe!";
							response.redirect('/');
						}
					}
					else {
						request.session.error = "Ce login n'existe pas!";
						response.redirect('/');
					}
				});
			}
			else if (request.body.submit === 'forgotten') {
				var email = htmlspecialchars(request.body.email);
				var token = Date.now().toString();
				var tempwd = crypto.createHash('whirlpool').update(token).digest('hex');
				connection.query('SELECT * FROM userdatas WHERE email = ?', [email], function(err, rows) {
					if (err) {
						throw err;
					}
					if (rows[0]) {
						var login = rows[0].login;
						connection.query('UPDATE userdatas SET password = ? WHERE login = ?', [tempwd, login], function(err, result) {
							if (err) {
								throw err;
							}
						});
						var transporter = nodemailer.createTransport({
							service: 'Gmail',
							auth: {
								user: 'gdufeutr@gmail.com',
								pass: 'gdufeutr42'
							}
						});
						var mailOptions = {
						    from: '"Matcha" <googi@hotmail.fr>', // sender address 
						    to: email, // list of receivers 
						    subject: 'Le mot de passe temporaire de votre compte Matcha!', // Subject line 
						    html: '<b><p>Bonjour '+ login +'!</p><p>Suite à votre demande de réinitialisation, voici votre mot de passe temporaire :</p><p>'+ token +'</p><p>Pensez à utiliser celui-ci la prochaine fois que vous vous connecterez!</p><p>Vous pourrez alors le personnaliser sur votre profil une fois connecté.</p><p>---------------</p><p>Ceci est un mail automatique, Merci de ne pas y répondre.</p></b>'
						};
						transporter.sendMail(mailOptions, function(error, info) {
						    if (error) {
						        throw error;
						    }
						});
						request.session.error = "Vous allez recevoir un email contenant votre mot de passe temporaire!";
						response.redirect('/');
					}
					else {
						request.session.error = "Aucun compte ne correspond à cet email!";
						response.redirect('/');
					}
				});
			}
		}
		else {
			response.redirect('/');
		}
	});
};