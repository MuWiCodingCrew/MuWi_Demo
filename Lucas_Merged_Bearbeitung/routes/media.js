'use strict';
var express = require('express');
var router = express.Router();
var fs = require('fs');
var dbh = require('./databaseHandler');
var upload = require('express-fileupload');

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

router.post('/uploadFile', function (req, res) {
    if (req.files) {
        var file = req.files.upfile;
        var filename = file.name;
        var title = filename.split('.')[0];
        var type = filename.split('.')[1];
        var comment = req.body.comment;
        var path = './upload/';
        file.mv(path + filename, function (err) {
            if (err) {
                console.log(err)
                res.send("error occured")
            }
            else {
                console.log("Datei hochgeladen.")
                if (comment == 'Comment...') {
                    comment = '';
                };
                var sqlStatement = "INSERT INTO tcontent (ContentID, Title, Description, ContentType, ContentData) VALUES (3, '" + title + "', '" + comment + "', '" + type + "', '" + path + filename + "')";
                dbh.sql(sqlStatement, function () {
                    if (err) throw err;
                    else {
                    console.log("1 record inserted");
                    }
                });
            }
        })
    }
    else {
        res.send('No Files selected.');
        console.log('No Files selected');
    }
});

module.exports = router;
