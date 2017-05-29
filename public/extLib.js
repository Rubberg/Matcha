function escapeQuotes(string) {
    return string
         .replace(/&#039;/g, "'")
         .replace(/&quot;/g, "\"");
}

// function getNotifs(user) {
// 	var connection = require('./config/db');
// 	connection.query('SELECT * FROM notifs WHERE user2 = ? AND unread = ? ORDER BY id DESC', [user, 'y'], function(err, rows) {
// 		if (err) {
// 			throw err;
// 		}
// 		if (rows[0]) {
// 			return (rows);
// 		}
// 	});
// }

// function commonHobbies (userLogin, user2Datas, selection, i, j) {
// 	var connection = require('../config/db');
// 	connection.query('SELECT COUNT(*) as common FROM hobbies a INNER JOIN hobbies b ON a.hobbie = b.hobbie WHERE a.login = ? AND b.login = ?', [userLogin, user2Datas.login], function(err, res) {
// 		if (err) {
// 			throw err;
// 		}
// 		if (res[0].common >= 1) {
// 			selection.push(user2Datas);
// 			console.log('hob: '+user2Datas.login)
// 		}
// 		if (i == j - 1) {
// 			connection.query('SELECT COUNT(*) as count FROM notifs WHERE user2 = ? AND unread = ?', [userLogin, "y"], function(err, count) {
// 				if (err) {
// 					throw err;
// 				}
// 				response.render('pages/home', {user: userLogin, users: selection, title: "Les profils suggérés:", notifs: getNotifs(userLogin), count: count[0].count});		
// 			});
// 		}
// 	});
// }


exports.escapeQuotes = escapeQuotes;
// exports.getNotifs = getNotifs;
// exports.commonHobbies = commonHobbies;