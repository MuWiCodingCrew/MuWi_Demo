'use strict';
var express = require('express');
var router = express.Router();
var dbh = require('./databaseHandler');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bodyParser = require('body-Parser');
var ContentAssociation = require('./ContentAssociation');
var User = require('../models/user');
var global = require('../global.js');

var sidebar;
dbh.generateSidebar(function (html) {
    sidebar = html;
});

/* GET home page. */
router.get('/', ensureAuthenticated, function (req, res) {
    var userData;

    dbh.sql("SELECT * FROM tuser WHERE email = '" + req.user.username + "';", function (data) {
        userData = data[0];
        dbh.getMyLists(userData.UserID, function (data2) {
          res.render('index', { title: 'Eigene Listen', msg: '', sidebar: sidebar, userData: userData, listData: data2 });
        });
    });
});

router.post('/contentlist', ensureAuthenticated, function (req, res) {
    dbh.generateContentList(req.body.searchstring, function (arr) {
        var clist = arr;
        res.render('ContentList', { sidebar: sidebar, clist: clist });
    });
});

router.get('/indexNoUser', function (req, res) {
    res.render('indexNoUser', { title: 'MuWi', sidebar: sidebar});
});

router.get('/modal', function (req, res) {
    res.render('ModalTest', { title: 'MuWI', msg: '', user: global.loggedUser, sidebar: sidebar });
});

router.get('/upload/:chapterID', function (req, res) {
    var chapterID = req.params.chapterID;
    dbh.sql('SELECT ChapterTitle, BookTitle FROM vchapterlist WHERE ChapterID =' + chapterID, function (data) {
        var bookTitle = data[0].BookTitle;
        var chapterTitle = data[0].ChapterTitle;
        dbh.generateChapterList(function (html) {
            res.render('upload_indirekt', {sidebar: sidebar, chapterList: html, chapterID: chapterID, chapterTitle: chapterTitle, bookTitle: bookTitle});
        });
    });
});

router.get('/Kontakt', function (req, res) {
    res.render('Kontakt', { sidebar: sidebar});
});

router.get('/myLists', ensureAuthenticated, function (req, res) {
    res.render('myLists', { title: 'Eigene Listen', sidebar: sidebar});
});

router.get('/favLists', ensureAuthenticated, function (req, res) {
    res.render('favLists', { title: 'Favorisierte Listen', sidebar: sidebar});
});

router.get('/Kapitel/:chapterID', ensureAuthenticated, function (req, res) {
    var id = req.params.chapterID;
    var author = '';
    var book = '';
    var chapterTitle = '';
    var chapterID = '';
    var isAuthor;
    var userData;
    dbh.sql("SELECT * FROM tuser WHERE email = '" + req.user.username + "';", function(data){
    	userData = data[0];
    });

    //anhand der chapterID Buch, Autor und Kapitelname ermitteln
    dbh.sql('SELECT ChapterID, ChapterTitle, BookTitle, Surname, Prename FROM vchapterList WHERE ChapterID=' + id, function (data) {
        book = data[0].BookTitle;
        chapterID = data[0].ChapterID;
        chapterTitle = data[0].ChapterTitle;
        author = data[0].Prename + ' ' + data[0].Surname;
        //prüfen, ob User Autor des geöffneten Kapitels oder ein Admin ist, um Bearbeitungs-Button aus- oder einzublenden
        dbh.sql("SELECT tu.EMail AS EMail FROM vchapterlist AS vcl INNER JOIN tuser AS tu ON tu.UserID=vcl.UserID WHERE vcl.ChapterID =" + chapterID, function (data) {
            if ((data[0].EMail == req.user.username)||(req.user.username == 'admin@admin')) {
                isAuthor = true;
            } else {
                isAuthor = false;
            }
            //kleines und großes Carousel erzeugen
            dbh.generateNetflix(id, true, function (data) {
                var dataBig = data;
                ContentAssociation.generateNetflixSmall(id, 0.4,function (data) {
                    var dataSmall = data;
                    //Kapiteltags ziehen
                    dbh.sql("SELECT DISTINCT tagTitle FROM vTagList WHERE chapterid = "+id+";",function(data) {
                        var tagData = data;
                        res.render('Kapitel', {
                            dataBig: dataBig,
                            dataSmall: dataSmall,
                            sidebar: sidebar,
                            author: author,
                            book: book,
                            chapterTitle: chapterTitle,
                            chapterID: chapterID,
                            isAuthor: isAuthor,
                            userData: userData,
                            tagData: tagData
                        });
                    });
                });
            });
        });
    });
});

router.post('/getSuggestion', function(req, res){
    var id = req.body.contentId;
    ContentAssociation.generateSuggestionCard(id, function (data) {
        res.send(JSON.stringify(data));
    })
});

router.post('/addContentToList', function(req, res){
  var oldList = (!req.body.oldList);
  var listName = req.body.listName;
  var userId = req.body.userId;
  var contentId = req.body.contentId;

  dbh.createNewListWithContent(oldList, listName, userId, contentId, function(data){
      res.send(JSON.stringify({success: true}));
  });
});

router.post("/getLists", function(req, res){
  var sqlStr = "SELECT DISTINCT listid, listtitle FROM vUserToContentViaList WHERE userid = '"+req.body.userid+"' AND listid NOT IN (SELECT listid FROM tcontentaffiliation WHERE contentid = '"+req.body.contentid+"')";
  dbh.sql(sqlStr,function(data){
    let obj = {
      success: true,
      result: []
    };
    if(data.length == 0){
      obj.success = false;
    } else {
      for(let e of data){
        obj.result.push({id:e.listid, title:e.ListTitle});
      }
    }
    res.send(JSON.stringify(obj));
  });
});

router.post("/saveRating",function(req, res){
	  dbh.rateContent(req.body.userid, req.body.contentid, req.body.comment, req.body.rating, function(){
	    var myObj = {
	      success: true
	    }
	    res.send(JSON.stringify(myObj));
	  });
});

router.post('/newList', function (req, res) {
    var listTitle = req.body.listTitle;
    var userID = req.body.userid;
    var success;

    // Check, ob der User bereits eine Liste mit dieser Bezeichnung angelegt hat
    dbh.sql("SELECT * FROM tlist WHERE userid = '" + userID + "' AND listtitle = '" + listTitle + "';", function (data) {
        if (data.length > 0) {
            success = 1;
            res.send(JSON.stringify({ title: 'Eigene Listen', msg: 'Es existiert bereits eine Liste mit der Bezeichnung "' + listTitle + '".', success: success, sidebar: sidebar }));
        } else {
            success = 0;
            var sqlStatement = "INSERT INTO tList (userid, listtitle) VALUES ('" + userID + "', '" + listTitle + "')";
            dbh.sql(sqlStatement);
            res.send(JSON.stringify({ title: 'Eigene Listen', msg: 'Die Liste "' + listTitle + '" wurde erstellt.', success: success, sidebar: sidebar }));
        }
    });
});

// Register
router.post('/register', function(req, res){
	var nachname = req.body.nachname;
	var vorname = req.body.vorname;
	var username = req.body.email;
	var password = req.body.password;
	var password2 = req.body.password2;
	var radio = req.body.isStudent;

	var newUser = new User({
		username: username,
		password: password
	});

	// Mongo-DB User anlegen
	User.createUser(newUser, function(err, user){
		if(err) throw err;
		console.log(user);
	});

	// MySQL-DB User anlegen
	var isStudent;
	if(radio=='stud'){
		isStudent = 1;
	}else{
		isStudent = 0;
	};
	var sqlStatement = "INSERT INTO tUser (EMail, Surname, Prename, IsStudent) VALUES ('" + username + "', '" + nachname + "', '" + vorname + "', '" + isStudent + "')";
	dbh.sql(sqlStatement);
	res.render('indexNoUser', { title: 'MuWI', msg: 'Sie haben sich erfolgreich registriert und können sich nun einloggen.', sidebar: sidebar });
});

// Login
passport.use(new LocalStrategy(
 function(username, password, done) {
	 User.getUserByUsername(username, function(err, user){
		 if(err) throw err;
		 if(!user){
			 return done(null, false, {message: 'Unbekannte Mailadresse.'});
		 }
		 global.loggedUser = user;
		 User.comparePassword(password, user.password, function(err, isMatch){
			 if(err) throw err;
			 if(isMatch){
				 return done(null, user);
			 } else {
				 return done(null, false, {message: 'Passwort ist inkorrekt.'});
			 }
		 });
	 });
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
		passport.authenticate('local', {successRedirect:'/', failureRedirect:'/indexNoUser',failureFlash: true}),
		function(req, res) {
	res.redirect('/');
});

// Logout
router.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

//Check, ob User angemeldet ist
function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('success_msg','Bitte loggen Sie sich ein, um Zugriff auf MuWi zu erhalten.');
		res.redirect('/indexNoUser');
	}
}

module.exports = router;
