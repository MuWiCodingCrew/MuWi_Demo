﻿var mysql = require('mysql');
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

databaseHandler.generateNetflix = function (id, isBig, callback) {

    if (isBig == true) {
        var numberOfItems = 3;
    } else {
        var numberOfItems = 4;
    }

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

            if (i % numberOfItems == 0) {//html-code, der pro neuem Slide oder ganz am Anfang benötigt wird
                if (i == 0) {
                    if (isBig == true) { //öffnende Tags und Controls für das große Carousel
                        tmp += '<div id="multi-item-example" class="carousel slide carousel-multi-item" data-ride="carousel">';
                        tmp += '<div class="controls-top">';
                        tmp += '<a class="btn-floating" href="#multi-item-example" data-slide="prev"><i class="fa fa-chevron-left"></i></a>';
                        tmp += '<a class="btn-floating" href="#multi-item-example" data-slide="next"><i class="fa fa-chevron-right"></i></a>';
                        tmp += '</div>';
                        tmp += '<div class="carousel-inner" role="listbox">';
                    } else { //öffnende Tags und Überschrift für das kleine Carousel
                        tmp += '<div class="container">';
                        tmp += '<hr>';
                        tmp += '<div class="col-sm-12">';
                        tmp += '<h3>Diese Inhalte könnten Sie auch interessieren:</h3>';
                        tmp += '</div>';
                        tmp += '<div class="col-sm-12">';
                        tmp += '<div id="carouselExampleIndicators" class="carousel slide" data-ride="carousel">';
                        tmp += '<div class="carousel-inner" role="listbox">';
                    }

                    tmp += '<div class="carousel-item active">';
                    if (isBig == false) {
                        tmp += '<div class="row">';
                    }
                } else {
                    tmp += '<div class="carousel-item">';
                    if (isBig == false) {
                        tmp += '<div class="row">';
                    }
                }
                if (isBig == true) {
                    tmp += '<div class="col-md-4">';
                } else {
                    tmp += '<div class="col-sm-3">';
                }
            } else {
                if (isBig == true) {
                    tmp += '<div class="col-md-4 clearfix d-none d-md-block">';
                } else {
                    tmp += '<div class="col-sm-3">';
                }
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
            if (i % numberOfItems == numberOfItems - 1) {
                tmp += '</div>'
                if (isBig == false) {
                    tmp += '</div>';
                }
            } else if (i == data.length-1) {
                tmp += '</div>'
                if (isBig == false) {
                    tmp += '</div>';
                }
            }
            if (i == data.length - 1) {
                if (isBig == true) {//schließende Tags für das große Carousel
                    tmp += '</div>';
                    tmp += '</div>';
                } else {//schließende Tags und Controls für das kleine Carousel
                    tmp += '</div>';
                    tmp += '<a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">';
                    tmp += '<span class="carousel-control-prev-icon" aria-hidden="true"></span>';
                    tmp += '<span class="sr-only">Previous</span>';
                    tmp += '</a>';
                    tmp += '<a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">';
                    tmp += '<span class="carousel-control-next-icon" aria-hidden="true"></span>';
                    tmp += '<span class="sr-only">Next</span>';
                    tmp += '</a>';
                    tmp += '</div>';
                    tmp += '</div>';
                    tmp += '</div>';
                    tmp += '<hr>';
                }
            }
            arr.push(tmp);
            i++;
        }
        return callback(arr);
    });
}


module.exports = databaseHandler;