var mysql = require('mysql');
var databaseHandler = {};

databaseHandler.dbConn = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "test",
    database: "muwi"
});

databaseHandler.pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    user: 'admin',
    password: 'test',
    database: 'muwi',
    debug: false
});

databaseHandler.sql = function (sqlString, callback) {
    databaseHandler.pool.getConnection(function (err, con) {
        if (typeof callback === 'function') {
            con.query(sqlString, function (err, result, fields) {
                if (err) {
                    throw err;
                } else {
                    return callback(result);
                }
            });
        } else {
            databaseHandler.dbConn.query(sqlString, function (err, result) {
                if (err) {
                    throw err;
                }
            });
        }
    });
}

module.exports = databaseHandler;