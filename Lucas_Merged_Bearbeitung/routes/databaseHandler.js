var mysql = require('mysql');
var databaseHandler = {};

databaseHandler.dbConn = mysql.createConnection({
    host: "localhost",
    user: "Admin",
    password: "NodeJS-SQL",
    database: "muwi"
});

databaseHandler.pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    user: 'Admin',
    password: 'NodeJS-SQL',
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

databaseHandler.generateChapterList = function (callback) {
    userID = 5; // muss angepasst und durch einen Parameter gespeist werden
    html = '<option value="" disabled selected>Wähle Buch, Kapitel</option>\n';
    databaseHandler.sql('SELECT ChapterID, ChapterTitle, BookTitle FROM vchapterlist WHERE UserID =' + userID, function (data) {
        for (var i = 0; i < data.length; i++) {
            html += '<option value="' + data[i].ChapterID + '">' + data[i].BookTitle + ', ' + data[i].ChapterTitle + '</option>\n';
        }
    return callback(html);
    });
};

databaseHandler.generateNetflix = function (id, isBig, callback) {

    if (isBig == true) {
        var numberOfItems = 3;
    } else {
        var numberOfItems = 4;
    }

    databaseHandler.sql("SELECT * FROM vcontent WHERE chapterid = " + id + ";", function (data) {
        var tmp = "";
        var arr = [];
        var modalhtml = "";
        var modalarr = [];
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
                        tmp += '<div id="multi-item-example" class="carousel slide carousel-multi-item" data-ride="carousel" data-interval="false">';
                        tmp += '<div class="controls-top">';
                        tmp += '<a class="btn-floating" href="#multi-item-example" data-slide="prev"><i class="fa fa-chevron-left"></i></a>';
                        tmp += '<a class="btn-floating" href="#multi-item-example" data-slide="next"><i class="fa fa-chevron-right"></i></a>';
                        tmp += '</div>';
                        tmp += '<div class="carousel-inner" role="listbox">';
                    } else { //öffnende Tags und Überschrift für das kleine Carousel
                        //tmp += '<div class="container">';
                        //tmp += '<hr>';
                        //tmp += '<div class="col-sm-12">';
                    	tmp += '<hr/>'
                        tmp += '<h3>Diese Inhalte könnten Sie auch interessieren:</h3>';
                    	tmp += '<br/>'
                    	tmp += '<br/>'
                        //tmp += '</div>';
                        //tmp += '<div class="col-sm-12">';
                        tmp += '<div id="carouselExampleIndicators" class="carousel slide" data-ride="carousel" data-interval="false">';
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
                    tmp += '<img style="cursor:pointer" class="img-fluid" src="' + route + path + '" alt="' + e.Title + '" data-toggle="modal" data-target="#' + e.ContentID + 'Modal"/>';

                    modalhtml += '<div id="' + e.ContentID + 'Modal" class="modal fade" role="dialog" style="text-align:center">\n';
                    modalhtml += '<div class="modal-dialog modal-lg" style="display:inline-block">\n';
                    modalhtml += '<div class="modal-content">\n';
                    modalhtml += '<div class="modal-header">\n';
                    modalhtml += '<h4 class="modal-title">' + e.Title + '</h4>\n';
                    modalhtml += '<button type="button" class="close" data-dismiss="modal">&times;</button>\n';
                    modalhtml += '</div>\n';
                    modalhtml += '<div class="modal-body">\n';
                    modalhtml += '<img class="img-fluid" src="' + route + path + '" alt="' + e.Title + '"/>\n';
                    modalhtml += '</div>\n';
                    modalhtml += '<div class="modal-footer">\n';
                    modalhtml += '<h6>' + e.Description + '</h6>\n';
                    modalhtml += '</div>\n';
                    modalhtml += '</div>\n';
                    modalhtml += '</div>\n';
                    modalhtml += '</div>\n';
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
                    tmp += '<div style="height:300px" width="auto">';
                    tmp += '<iframe style="height:100%;width:100%" src="' + route + path + '"></iframe>';
                    tmp += '<button style="position:relative;float:left;bottom:60%;opacity:0.8;width:90%" type="button" class="btn btn-info btn-lg" data-toggle="modal" data-target="#' + e.ContentID + 'Modal">Open Fullscreen</button>';
                    tmp += '</div>';

                    modalhtml += '<div id="' + e.ContentID + 'Modal" class="modal fade" role="dialog" style="text-align:center">\n';
                    modalhtml += '<div class="modal-dialog modal-lg" style="display:inline-block">\n';
                    modalhtml += '<div class="modal-content">\n';
                    modalhtml += '<div class="modal-header">\n';
                    modalhtml += '<h4 class="modal-title">' + e.Title + '</h4>\n';
                    modalhtml += '<button type="button" class="close" data-dismiss="modal">&times;</button>\n';
                    modalhtml += '</div>\n';
                    modalhtml += '<div class="modal-body">\n';
                    modalhtml += '<iframe width="1000" height="700" src="' + route + path + '#zoom=75"></iframe>';
                    modalhtml += '</div>\n';
                    modalhtml += '<div class="modal-footer">\n';
                    modalhtml += '<h6>' + e.Description + '</h6>\n';
                    modalhtml += '</div>\n';
                    modalhtml += '</div>\n';
                    modalhtml += '</div>\n';
                    modalhtml += '</div>\n';
                    break;
                default:
            }

            tmp += '<div class="card-body">';
            tmp += '<h4 class="card-title"> ' + e.Title + ' </h4>';
            tmp += '<p class="card-text">' + e.Description + '</p>';
            tmp += '<a class="btn btn-primary" href="' + route + path + '" download="' + e.Title + '">Download</a>';
            tmp += '<button class="btn btn-primary btn-rate-content" onclick="openRateModal(this)" data-contentid="'+e.ContentID+'" data-chapterid="'+e.ChapterID+'">Rate Me</button>';
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
                    //tmp += '</div>';
                    //tmp += '</div>';
                    tmp += '</div>';
                    tmp += '<hr>';
                }
            }
            modalarr.push(modalhtml);
            arr.push(tmp);
            i++;
        }
        arr = arr.concat(modalarr);
        return callback(arr);
    });
};

databaseHandler.generateContentList = function (searchstring, callback) {

    databaseHandler.sql("SELECT distinct ContentID, Description, Title, ContentType, ContentData FROM vtaglist WHERE Description LIKE '" + searchstring + "' OR Title LIKE '" + searchstring + "' OR tagTitle LIKE '" + searchstring + "' OR ContentType LIKE '" + searchstring + "';", function (data) {
        var tmp = "";
        var arr = [];
        var modalhtml = "";
        var modalarr = [];
        var i = 0;
        var path = "";
        var route = "";

        for (let e of data) {

            path = e.ContentData.replace('./', '%2E%2F');
            path = path.replace('/', '%2F');

            tmp = "";

            if (i % 3 == 0) {
                tmp += '<div class="col-md-12">\n';
                tmp += '<div class="row">\n';
            }

            tmp += '<div class="col-md-4">';
            tmp += '<div class="card mb-2">';

            switch (e.ContentType.toLowerCase()) {
                case 'png':
                case 'jpg':
                    route = "../media/image/";
                    tmp += '<img style="cursor:pointer" class="img-fluid" src="' + route + path + '" alt="' + e.Title + '" data-toggle="modal" data-target="#' + e.ContentID + 'Modal"/>\n';

                    modalhtml += '<div id="' + e.ContentID + 'Modal" class="modal fade" role="dialog" style="text-align:center">\n';
                    modalhtml += '<div class="modal-dialog modal-lg" style="display:inline-block">\n';
                    modalhtml += '<div class="modal-content">\n';
                    modalhtml += '<div class="modal-header">\n';
                    modalhtml += '<h4 class="modal-title">' + e.Title + '</h4>\n';
                    modalhtml += '<button type="button" class="close" data-dismiss="modal">&times;</button>\n';
                    modalhtml += '</div>\n';
                    modalhtml += '<div class="modal-body">\n';
                    modalhtml += '<img class="img-fluid" src="' + route + path + '" alt="' + e.Title + '"/>\n';
                    modalhtml += '</div>\n';
                    modalhtml += '<div class="modal-footer">\n';
                    modalhtml += '<h6>' + e.Description + '</h6>\n';
                    modalhtml += '</div>\n';
                    modalhtml += '</div>\n';
                    modalhtml += '</div>\n';
                    modalhtml += '</div>\n';
                    break;
                case 'mp4':
                    route = "../media/stream/";
                    tmp += '<video class="img-fluid" onmouseover="play()" onmouseout="pause()" onclick="webkitRequestFullscreen()">\n';
                    tmp += '<source src="' + route + path + '" type="video/mp4">\n';
                    tmp += '</video>\n';
                    break;
                case 'mp3':
                    route = "../media/stream/";
                    tmp += '<img class="img-fluid" src="../media/image/%2E%2Fupload%2F3_MP3ICON.png" />\n';
                    tmp += '<audio style="width:auto" class="img-audio" controls>\n';
                    tmp += '<source src="' + route + path + '" type="audio/mp3">\n';
                    tmp += '</audio>';
                    break;
                case 'pdf':
                    route = "../media/document/";
                    tmp += '<div style="height:300px" width="auto">\n';
                    tmp += '<iframe style="height:100%;width:100%" src="' + route + path + '"></iframe>\n';
                    tmp += '<button style="position:relative;float:left;bottom:60%;opacity:0.8;width:90%" type="button" class="btn btn-info btn-lg" data-toggle="modal" data-target="#' + e.ContentID + 'Modal">Open Fullscreen</button>\n';
                    tmp += '</div>\n';

                    modalhtml += '<div id="' + e.ContentID + 'Modal" class="modal fade" role="dialog" style="text-align:center">\n';
                    modalhtml += '<div class="modal-dialog modal-lg" style="display:inline-block">\n';
                    modalhtml += '<div class="modal-content">\n';
                    modalhtml += '<div class="modal-header">\n';
                    modalhtml += '<h4 class="modal-title">' + e.Title + '</h4>\n';
                    modalhtml += '<button type="button" class="close" data-dismiss="modal">&times;</button>\n';
                    modalhtml += '</div>\n';
                    modalhtml += '<div class="modal-body">\n';
                    modalhtml += '<iframe width="1000" height="700" src="' + route + path + '#zoom=75"></iframe>\n';
                    modalhtml += '</div>\n';
                    modalhtml += '<div class="modal-footer">\n';
                    modalhtml += '<h6>' + e.Description + '</h6>\n';
                    modalhtml += '</div>\n';
                    modalhtml += '</div>\n';
                    modalhtml += '</div>\n';
                    modalhtml += '</div>\n';
                    break;
                default:
            }

            tmp += '<div class="card-body">';
            tmp += '<h4 class="card-title"> ' + e.Title + ' </h4>';
            tmp += '<p class="card-text">' + e.Description + '</p>';
            tmp += '<a class="btn btn-primary" href="' + route + path + '" download="' + e.Title + '">Download</a>';
            tmp += '<button class="btn btn-primary btn-rate-content" onclick="openRateModal(this)" data-contentid="' + e.ContentID + '" data-chapterid="' + e.ChapterID + '">Rate Me</button>';
            tmp += '</div>';
            tmp += '</div>';
            tmp += '</div>';

            if (i % 3 == 2) {
                tmp += '</div>\n';
                tmp += '</div>\n';
                tmp += '<hr/>';
            }

            modalarr.push(modalhtml);
            arr.push(tmp);
            i++;
        }
        arr = arr.concat(modalarr);
        return callback(arr);
    });
};

databaseHandler.generateSidebar = function (callback) {
    databaseHandler.sql("SELECT * FROM vchapterlist ORDER BY BookID, ChapterID", function (data) {
        var tmp = -1;
        var book = new Object();
        var chapter = new Object();
        var bookArr = [];

        var html = '';
        for (var i = 0; i < data.length; i++) { // Schreiben der Bücher und Kapitel in ein Bucharray, bei dem jedes Buch eine Kapitelliste als Attribut hat
            if (tmp != data[i].BookID) {
                if (i > 0) {
                    bookArr.push({ id: book.id, bookTitle: book.bookTitle, author: book.author, aSurname: book.aSurname, aPrename: book.aPrename, chList: book.chList });
                }
                tmp = data[i].BookID;
                book.id = data[i].BookID;
                book.bookTitle = data[i].BookTitle;
                book.author = data[i].UserID;
                book.aSurname = data[i].Surname;
                book.aPrename = data[i].Prename;

                chapter.id = data[i].ChapterID;
                chapter.chapterTitle = data[i].ChapterTitle;

                book.chList = new Array(0);
                book.chList.push({id: chapter.id, chapterTitle: chapter.chapterTitle});
            } else {
                chapter.id = data[i].ChapterID;
                chapter.chapterTitle = data[i].ChapterTitle;
                book.chList.push({ id: chapter.id, chapterTitle: chapter.chapterTitle });
                if (i == data.length - 1) {
                    bookArr.push({id: book.id, bookTitle: book.bookTitle, author: book.author, aSurname: book.aSurname, aPrename: book.aPrename, chList: book.chList});
                }
            }
        }

        //console.log(bookArr.length);//Ausgabe BookArray
        //for (var h = 0; h < bookArr.length; h++) {
        //    console.log(bookArr[h]);
        //}

        for (let e1 of bookArr) { //Erzeugen des HTML-Codes
            html += '<li>\n';
            html += '<ul class="collapsible collapsible-accordion">\n';
            html += '<li>\n';
            html += '<a style="height:100%; line-height:1.5em" class="collapsible-header waves-effect arrow-r"><i class="fa fa-book"></i>' + e1.bookTitle + '<i class="fa fa-angle-down rotate-icon"></i></a>\n';
            html += '<div class="collapsible-body">\n';
            html += '<ul class="list-unstyled">\n';
            for (let e2 of e1.chList) {
                html += '<li class="custom-li">\n';
                html += '<a style="height:100%; line-height:1.5em; background-color:rgba(0,0,0,0); margin-top:5px; margin-right:5px" id="testelement" class="waves-effect" href="/Kapitel/' + e2.id + '">' + e2.chapterTitle + '</a>\n';
                html += '</li>\n';
            }
            html += '</ul>\n';
            html += '</div>\n';
            html += '</li>\n';
            html += '</ul>\n';
            html += '</li>\n';
        }
        return callback(html);
    });
};

databaseHandler.rateContent = function(userid, contentid, comment, rating, func){
	  databaseHandler.sql("INSERT INTO tcontentmanagement (userid, contentid, iscreator, usercoment, rating) VALUES ("+userid+", "+contentid+", 0, '"+comment+"', "+rating+");");
	  func();
}

module.exports = databaseHandler;
