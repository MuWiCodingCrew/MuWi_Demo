﻿'use strict';
var express = require('express');
var router = express.Router();
var dbh = require('./databaseHandler');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
var global = require('../global.js');

var sidebar;
dbh.generateSidebar(function (html) {
    sidebar = html;
});

/* GET home page. */
router.get('/', ensureAuthenticated, function (req, res) {
    res.render('index', { title: 'Eigene Listen', msg: '', sidebar: sidebar });
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

router.get('/myLists', function (req, res) {
    res.render('myLists', { title: 'Eigene Listen', sidebar: sidebar});
});

router.get('/favLists', function (req, res) {
    res.render('favLists', { title: 'Favorisierte Listen', sidebar: sidebar});
});

router.get('/Kapitel/:chapterID', function (req, res) {
    var id = req.params.chapterID;
    var author = '';
    var book = '';
    var chapterTitle = '';
    var chapterID = '';
    var isAuthor;
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
                dbh.generateNetflix(id, false, function (data) {
                    var dataSmall = data;
                    res.render('Kapitel', { dataBig: dataBig, dataSmall: dataSmall, sidebar: sidebar, author: author, book: book, chapterTitle: chapterTitle, chapterID: chapterID, isAuthor: isAuthor });
                });
            }); 
        });
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
	res.render('index', { title: 'MuWI', msg: 'Sie haben sich erfolgreich registriert und können sich nun einloggen.', sidebar: sidebar });
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
		passport.authenticate('local', {successRedirect:'/', failureRedirect:'/',failureFlash: true}),
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
