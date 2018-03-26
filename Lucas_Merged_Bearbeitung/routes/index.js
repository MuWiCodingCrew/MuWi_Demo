'use strict';
var express = require('express');
var router = express.Router();
var dbh = require('./databaseHandler');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');
var global = require('../global.js');

/* GET home page. */
router.get('/', function (req, res) {
    res.render('index', { title: 'MuWI', msg: '', user: global.loggedUser });
    //dbh.sql("Select * FROM tcontent", function (data) {
    //    console.log(data);
    //});
});

router.get('/upload', function (req, res) {
    res.render('upload');
});

router.get('/Kontakt', function (req, res) {
    res.render('Kontakt', { user: global.loggedUser });
});

router.get('/Dozenten/Lemke', function (req, res) {
    res.render('Dozenten/Lemke', { user: global.loggedUser });
});

router.post('/register', function(req, res){
	var nachname = req.body.nachname;
	var vorname = req.body.vorname;
	var username = req.body.email;
	//var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;
	//var radio = req.body.radio;

	

	var newUser = new User({
		username: username,
		password: password
	});
		
	// PW-DB User anlegen
	User.createUser(newUser, function(err, user){
		if(err) throw err;
		console.log(user);
	});
		
		/*
		//  MySQL-DB User anlegen
		if(radio=='stud'){
			isStudent = 1;
		}else{
			isStudent = 0;
		}
		let sql = `INSERT INTO tUser (EMAIL, Surname, Forename, IsStudent) VALUES ('${username}', '${nachname}', '${vorname}', '${isStudent}')`;
		let query = global.sqldb.query(sql, (err, result) => {
			if(err){
				throw err;
			}
			console.log('MYSQL-DB user created: \n', result);
			//res.send('line inserted...');
		});
		*/

		
	res.render('index', { title: 'MuWI', msg: 'Sie haben sich erfolgreich registriert und können sich nun einloggen.' });
});

//Login User
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
  //passport.authenticate('local', {successRedirect:'/', failureRedirect:'/login',failureFlash: true}),
		passport.authenticate('local', {failureFlash: true}),
  function(req, res) {
	//res.redirect('/');

	res.render('index', { title: 'MuWI', msg: 'Login erfolgreich', user: global.loggedUser });
});

//Logout
router.get('/logout', function(req, res){
	req.logout();
	//req.flash('success_msg', 'Sie wurden erfolgreich ausgeloggt.');
	//res.redirect('/users/login');
	global.loggedUser = '';
	res.render('index', { title: 'MuWI', msg: 'Sie wurden erfolgreich ausgeloggt.' });
});

module.exports = router;
