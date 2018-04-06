'use strict';
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
    res.render('index', { title: 'Eigene Listen', msg: '', sidebar: sidebar});
});

router.get('/indexNoUser', function (req, res) {
    res.render('indexNoUser', { title: 'MuWi', sidebar: sidebar});
});

router.get('/modal', function (req, res) {
    res.render('ModalTest', { title: 'MuWI', msg: '', user: global.loggedUser, sidebar: sidebar });
});

router.get('/upload', function (req, res) {
    res.render('upload_neu', {sidebar: sidebar});
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
    var chapter = '';
    //anhand der chapterID Buch, Autor und Kapitelname ermitteln
    dbh.generateNetflix(id, true, function (data) {
        var dataBig = data;
        dbh.generateNetflix(id, false, function (data) {
            var dataSmall = data;
            res.render('Kapitel', { dataBig: dataBig, dataSmall: dataSmall, sidebar: sidebar });
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
