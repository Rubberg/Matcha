var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'mysql-gdufeutr.alwaysdata.net',
  user     : 'gdufeutr',
  password : 'gdufeutr',
  database : 'gdufeutr_matcha',
});
 
connection.connect();

module.exports = connection;