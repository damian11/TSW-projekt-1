/*jshint node: true */

"use strict";

var https = require('https');
var http = require('http');
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var session = require('express-session');
var app = express();
var redisStore = require('connect-redis')(session);
var client  = require('redis').createClient();
var sessionStore = new redisStore();
var port = process.env.PORT || 3000;
var env = process.env.NODE_ENV || 'development';
var sessionSecret = 'wielkiSekret44';
var sessionKey = 'express.sid';

var socketIo = require('socket.io');
var passport = require('passport');
var passportSocketIo = require('passport.socketio');
var LocalStrategy = require('passport-local').Strategy;


app.set('views', __dirname + '/view');
app.set('view engine', 'ejs');


// Konfiguracja passport.js
passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (obj, done) {
    done(null, obj);
});


var db = require("./db");


passport.use(new LocalStrategy(
    function (username, password, done) {
        
        db.User.find({
            username: username,
            password: password
        }, function (err, user) {
            if (err) {
                console.log(err);
            } else {
                console.log("Znaleziono uzytkownika:");
                console.log(user);
                console.log("Udane logowanie...");
                done(null, {
                    username: user[0].username,
                    password: user[0].password
                });
            }
        });
        
//        if ((username === 'admin') && (password === 'tajne')) {
//            console.log("Udane logowanie administratora...");
//            return done(null, {
//                username: username,
//                password: password,
//                isAdmin: true
//            });
//        } else if ((username === 'user') && (password === 'tajne')) {
//            console.log("Udane logowanie zwykłego użytkownika ...");
//            return done(null, {
//                username: username,
//                password: password,
//                isAdmin: false
//            });
//        } else {
//            return done(null, false);
//        }
    }
));

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
    resave: true,
    saveUninitialized: true,
    key: sessionKey,
    secret: sessionSecret,
    store: sessionStore
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));


var routes = require('./routes');
app.get('/', routes.index);
app.get('/login', routes.login);
app.post('/newUser', routes.newUser);
app.post('/newHorse', routes.newHorse)
app.get('/profile', routes.profile);
app.get('/administrator', routes.administrator);
app.post("/editProfile", routes.editProfile);
app.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/login'
    }),
    function (req, res) {
        db.User.findOne({
            username: req.user.username
        }, function (err, ent) {
            req.session.loggedUser = ent;
            
            if (err) {
                    res.redirect('/login');
            } else {
                if(req.session.loggedUser.isAdmin) {
                    res.redirect('/administrator');
                } else {
                    res.redirect('/authorized.html');
                }
            }
        });
    }
);
app.get('/logout', routes.logout);


var privateKey = fs.readFileSync( "cert/server-key.pem" );
var certificate = fs.readFileSync( "cert/server-cert.pem" );

var server = https.createServer({
    key: privateKey,
    cert: certificate
}, app).listen(port);

//var server = http.createServer(app);

var sio = socketIo.listen(server);


let onAuthorizeSuccess = function (data, accept) {
    console.log('Udane połączenie z socket.io');
    accept(null, true);
};

let onAuthorizeFail = function (data, message, error, accept) {
    if (error) {
        throw new Error(message);
    }
    console.log('Nieudane połączenie z socket.io:', message);
    accept(null, false);
};
sio.use(passportSocketIo.authorize({
  cookieParser: cookieParser,       // the same cookieParser middleware as registered in express
  key:          sessionKey,         // the name of the cookie storing express/connect session_id
  secret:       sessionSecret,      // the session_secret used to parse the cookie
  store:        sessionStore,       // sessionstore – should not be memorystore!
  success:      onAuthorizeSuccess, // *optional* callback on success
  fail:         onAuthorizeFail     // *optional* callback on fail/error
}));

sio.sockets.on('connection', function (socket) {
    socket.emit('news', {
        ahoj: 'od serwera'
    });
    socket.on('reply', function (data) {
        console.log(data);
    });
});

server.listen(3000, function () {
    console.log('Serwer pod adresem http://localhost:3000/');
});