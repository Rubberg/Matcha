module.exports = function(app, connection, htmlspecialchars, crypto, distance, users, fs, busboy, extLib, NodeGeocoder, geocoder, moment, nodemailer) {



	require('./root.js')(app, connection, htmlspecialchars, crypto, moment, nodemailer);
	require('./chat.js')(app, connection, htmlspecialchars);
	require('./validate.js')(app, connection, htmlspecialchars);
	require('./search.js')(app, connection, htmlspecialchars, distance);
	require('./home.js')(app, connection, htmlspecialchars, distance, extLib);
	require('./profile.js')(app, connection, htmlspecialchars, crypto, extLib, NodeGeocoder, geocoder);
	require('./logout.js')(app, connection, htmlspecialchars, users);
	require('./visit.js')(app, connection, htmlspecialchars);
	require('./like.js')(app, connection, htmlspecialchars);
	require('./pic_select.js')(app, connection, htmlspecialchars);
	require('./upload.js')(app, connection, htmlspecialchars, fs, busboy);
}