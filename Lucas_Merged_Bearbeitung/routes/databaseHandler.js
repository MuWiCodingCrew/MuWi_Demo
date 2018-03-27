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

databaseHandler.generateNetflix = function (id, callback) {
    databaseHandler.sql("SELECT * FROM vcontent WHERE chapterid = " + id + ";", function (data) {
        var tmp = "";
        var arr = [];
        var i = 0;
        var path = "";
        var route = "";

        for (let e of data) {

            path = e.ContentData.replace('./', '%2E%2F');
            path = path.replace('/', '%2F');

            tmp = "";

            if (i % 3 == 0) {
                if (i == 0) {
                    tmp += '<div class="carousel-item active">';
                } else {
                    tmp += '<div class="carousel-item">';
                }
                tmp += '<div class="col-md-4">';
            } else {
                tmp += '<div class="col-md-4 clearfix d-none d-md-block">';
            }

            tmp += '<div class="card mb-2">';

            switch (e.ContentType.toLowerCase()) {
                case 'png':
                case 'jpg':
                    route = "../media/image/";
                    tmp += '<img class="img-fluid" src="' + route + path + '" alt="' + e.Title + '">';
                    break;
                case 'mp4':
                    route = "../media/stream/";
                    tmp += '<video class="img-fluid" onmouseover="play()" onmouseout="pause()" onclick="webkitRequestFullscreen()">';
                    tmp += '<source src="' + route + path + '" type="video/mp4">';
                    tmp += '</video>';
                    break;
                case 'mp3':
                    route = "../media/stream/";
                    tmp += '<img class="img-fluid" src="../media/image/%2E%2Fupload%2F3_MP3ICON.png" />';
                    tmp += '<audio style="width:auto" class="img-audio" controls>';
                    tmp += '<source src="' + route + path + '" type="audio/mp3">';
                    tmp += '</audio>';
                    break;
                case 'pdf':
                    route = "../media/document/";
                    tmp += '<object height="300" style="width:auto" type="application/pdf" data="' + route + path + '"></object>';
                    break;
                default:
            }

            tmp += '<div class="card-body">';
            tmp += '<h4 class="card-title"> ' + e.Title + ' </h4>';
            tmp += '<p class="card-text">' + e.Description + '</p>';
            tmp += '<a class="btn btn-primary" href="' + route + path + '" download="' + e.Title + '">Download</a>';
            tmp += '</div>';
            tmp += '</div>';
            tmp += '</div>';
            if (i % 3 == 2) {
                tmp += '</div>'
            }
            arr.push(tmp);
            i++;
        }
        return callback(arr);
    });
}


module.exports = databaseHandler;