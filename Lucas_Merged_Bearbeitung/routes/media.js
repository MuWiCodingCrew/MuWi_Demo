'use strict';
var express = require('express');
var router = express.Router();
var fs = require('fs');
var dbh = require('./databaseHandler');
var upload = require('express-fileupload');

var User = require('../models/user');

router.use(upload());

router.get('/document/:path', function (req, res) {
    const path = req.params.path;
    const file = fs.createReadStream(path);
    res.writeHead(200, { 'Content-type': 'application/pdf' });
    file.pipe(res);
});

router.get('/image/:path', function (req, res) {
    const path = req.params.path;
    const file = fs.createReadStream(path);
    res.writeHead(200, { 'Content-type': 'image' });
    file.pipe(res);
});

router.get('/stream/:path', function (req, res) {
    const path = req.params.path;
    const stat = fs.statSync(path);
    const fileFormat = path.split('.')[path.split('.').length - 1];
    var contentType;
    if (fileFormat == 'mp4') {
        contentType = 'video/mp4';
    }
    else if (fileFormat == 'mp3') {
        contentType = 'audio/mpeg';
    }
    else {
        contentType = 'unkown';
    }
    const fileName = stat.fileName
    const fileSize = stat.size
    const range = req.headers.range
    if (range) {
        //console.log('range bekannt')
        const parts = range.replace(/bytes=/, "").split("-")
        const start = parseInt(parts[0], 10)
        const end = parts[1]
            ? parseInt(parts[1], 10)
            : fileSize - 1

        const chunksize = (end - start) + 1
        const file = fs.createReadStream(path, { start, end })
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': contentType,
        }

        res.writeHead(206, head)
        file.pipe(res)
    } else {
        //console.log('range unbekannt')
        const head = {
            'Content-Length': fileSize,
            'Content-Type': 'audio/mpeg',
        }
        res.writeHead(200, head)
        fs.createReadStream(path).pipe(res)
    }
});

router.post('/uploadFile/:chapterID', function (req, res) {
    var listID = req.params.chapterID;
    if (req.files) {
        var file = req.files.upfile;
        var filename = file.name;
        var title = filename.split('.')[0];
        var type = filename.split('.')[1];
        var comment = req.body.comment;
        var contentID;
        var path = './upload/';
                
        var sqlInserttcontent = "INSERT INTO tcontent (Title, Description, ContentType, ContentData) VALUES ('" + title + "', '" + comment + "', '" + type + "', '" + path + filename + "')"; 
        dbh.sql(sqlInserttcontent, function (result) {
            contentID = result.insertId;

            dbh.sql('UPDATE tcontent SET ContentData="' + path + contentID + '_' + filename +'" WHERE ContentID ='+contentID, function () {
            });

            dbh.sql("SELECT UserID FROM tuser WHERE EMail ='"+req.user.username+"'", function (data) {
                var userID = data[0].UserID;   
                var sqlInserttcontentaffiliation = "INSERT INTO tcontentaffiliation (ListID, ContentID) VALUES (" + listID + ", " + contentID + ")";
                var sqlInserttcontentmanagement = "INSERT INTO tcontentmanagement (ContentID, UserID, IsCreator, UserComent) VALUES (" + contentID + ", " + userID + ", 1, '')";

                dbh.sql(sqlInserttcontentaffiliation, function () {
                });

                dbh.sql(sqlInserttcontentmanagement, function () {

                    file.mv(path + contentID + '_' + filename, function (err) {
                        if (err) {
                            console.log(err)
                            res.send("error occured")
                        }
                        else {
                            console.log("Datei hochgeladen.")
                        }
                    })
                });
            });
        });
            
        
    }
    else {
        res.send('No Files selected.');
        console.log('No Files selected');
    }
});

module.exports = router;
