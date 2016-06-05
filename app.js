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
        
        db.User.findOne({
            username: username,
            password: password
        }, function (err, ent) {
            if (err) {
                console.log(err);
                return done(err);
            } else {
                if (ent) {
                    console.log("Udane logowanie:");
                    console.log(ent);
                    return done(null, {
                        username: ent.username,
                        password: ent.password
                    });
                } else {
                    return done(null, false, {message: "Błąd logowania"});
                }
            }
        });
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
app.use(express.static('bower_components'));


var routes = require('./routes');
app.get('/', routes.index);
app.get('/login', routes.login);
app.post('/newUser', routes.newUser);
app.post('/newHorse', routes.newHorse)
app.get('/profile', routes.profile);
app.get('/administrator', routes.administrator);
app.get("/newCompetition", routes.newCompetition);
app.post("/newCompetitionStep2", routes.newCompetitionStep2);
app.get("/newCompetitionStep2/:competitionId", routes.GETnewCompetitionStep2);
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
                    res.render('jury', {
                        loggedUser: ent
                    });
                }
            }
        });
    }
);
app.get('/logout', routes.logout);
app.get("/jury/competition/:competitionId", routes.competition);
app.get("/horse/competition/:horseId/:competitionId", routes.horseCompetition);


var privateKey = fs.readFileSync( "cert/server-key.pem" );
var certificate = fs.readFileSync( "cert/server-cert.pem" );

var server = https.createServer({
    key: privateKey,
    cert: certificate
}, app).listen(port);

//var server = http.createServer(app);

var sio = socketIo.listen(server);


let onAuthorizeSuccess = function (data, accept) {
//    console.log('Udane połączenie z socket.io');
    accept(null, true);
};

let onAuthorizeFail = function (data, message, error, accept) {
    if (error) {
        throw new Error(message);
    }
//    console.log('Nieudane połączenie z socket.io:', message);
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
    
    socket.on('horsesReq', function(data) {
        db.Horse.find({}, function(err, ent) {
            if (err) {
                console.log(err);
            } else {
                socket.emit("horsesRes", ent)
            }
        });
    });

    socket.on('availableHorsesReq', function(data) {
        db.HorseGroup.find({
            competition: data.competitionId
        }, function (err, horseGroups) {
            var horseGroup = [];

            for (var i=0; i<horseGroups.length; i++) {
                horseGroup.push(horseGroups[i].horse);
            }

            db.Horse.find({
                _id: {$nin: horseGroup},
                gender: data.gender
            }, function(err, ent) {
                if (err) {
                    console.log(err);
                } else {
                    socket.emit("availableHorsesRes", ent)
                }
            });
        });
    });
    
    
    socket.on("availableJuryReq", function(data) {
        db.JuryGroup.find({
            competition: data.competitionId
        }, function (err, juryGroups) {
            var juryGroup = [];
            
            for (var i=0; i<juryGroups.length; i++) {
                juryGroup.push(juryGroups[i].jury);
            }
            
            db.User.find({
                isAdmin: false,
                _id: {$nin: juryGroup},
                
            }, function(err, ent) {
                if (err) {
                    console.log(err);
                } else {
                    socket.emit("availableJuryRes", ent)
                }
            });
        });
    });
    
    
    socket.on("horseDeleteByIDReq", function(data) {
        db.Horse.findById(data.horseId, function(err, ent) {
            if (err) {
                console.log(err);
            } else {
                ent.remove(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        socket.emit("horseDeleteByIDRes", {
                            status: "OK"
                        });
                    }
                });
            };
        });
    });
    
    socket.on("horseReadByIDReq", function(data) { 
        db.Horse.findById(data.horseId, function(err, ent) {
            if (err) {
                console.log(err);
            } else {
                socket.emit("horseReadByIDRes", {
                    data: ent
                });
            }
        });
    });
    
    socket.on("juryReadByIDReq", function(data) { 
        db.User.findById(data.juryId, function(err, ent) {
            if (err) {
                console.log(err);
            } else {
                socket.emit("juryReadByIDRes", {
                    data: ent
                });
            }
        });
    });
    
    socket.on("juryReq", function(){
        db.User.find({
            isAdmin: false
        },function(err, ent){
            if(err){
                console.log(err);
            }else{
               socket.emit("juryRes", ent)
            }
        });
    });
    
    
    
    socket.on("horsesByCompetitionIDReq", function(data) {
        db.HorseGroup.find({
            competition: data.competitionId
        }, function(err, data) {
            if(err){
                console.log(err);
            } else {
                if (data) {
                    var horsesIds = [];
                    
                    for(var i=0; i<data.length; i++) {
                        horsesIds.push(data[i].horse);
                    }
                    
//                    select *
//                        from horse
//                        where _id in ("54534", "543543", "543523412")
                    
                    db.Horse.find({
                        _id: {$in: horsesIds}
                    }, function(err, data) {
                        socket.emit("horsesByCompetitionIDRes", data);
                    });
                } else {
                    socket.emit("horsesByCompetitionIDRes");
                }
            }
        });
    });
    
    socket.on("horseAddToCompetitionReq", function(data) {
        var horseComp = new db.HorseGroup({
            competition:data.competitionId,
            horse: data.horseId,
            isActive: false
        });
        
        horseComp.save(function(err) {
            if(err){
                console.log(err);
            } else {
                socket.emit("horseAddToCompetitionRes", {
                    competitionId: data.competitionId,
                    horse: data.horseId
                });
            }
        });
    });
    
    socket.on("horseDeleteFromCompetitionReq", function(data) {
        db.HorseGroup.remove({
            competition: data.competitionId,
            horse: data.horseId
        }, function(err){
            if(err){
                console.log();
            }else{
                socket.emit("horseDeleteFromCompetitionRes", {
                    competitionId: data.competitionId
                });
            }
        });
    });
    
    socket.on("horseActivateInCompetitionReq", function(data) {
        db.HorseGroup.find({
            competition: data.competitionId,
            horse: data.horseId
        }, function (err, ent) {
            if (err) {
                console.log(err);
            } else {
                ent[0].isActive = true;
                ent[0].save(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        db.JuryGroup.find({
                            competition: data.competitionId
                        }, function (err, juriesInCompetition) {
                            if (err) {
                                console.log(err);
                            } else {
                                for (var i=0;i<juriesInCompetition.length; i++) {
                                    var horseMark = new db.HorseMark({
                                        type: 0,
                                        head: 0,
                                        body: 0,
                                        legs: 0,
                                        movement: 0,
                                        competition: data.competitionId,
                                        horse: data.horseId,
                                        jury: juriesInCompetition[i].jury
                                    });
                                    
                                    horseMark.save();
                                }
                                
                                socket.emit("horseActivateInCompetitionRes", {
                                    competitionId: data.competitionId,
                                    horse: ent[0]
                                });
                            }
                        });
                    }
                });
            }
        });
    });
    
    
       socket.on("juryAddToCompetitionReq", function(data) {
        var juryComp = new db.JuryGroup({
            competition:data.competitionId,
            jury: data.juryId
        });
        
        juryComp.save(function(err) {
            if(err){
                console.log(err);
            } else {
                socket.emit("juryAddToCompetitionRes", {
                    competitionId: data.competitionId,
                    jury: data.juryId
                });
            }
        });
    });
    
    socket.on("juryDeleteFromCompetitionReq", function(data) {
        db.JuryGroup.remove({
            competition: data.competitionId,
            jury: data.juryId
        }, function(err){
            if(err){
                console.log();
            }else{
                socket.emit("juryDeleteFromCompetitionRes", {
                    competitionId: data.competitionId
                });
            }
        });
    });
    
    
    
        
    socket.on("juriesByCompetitionIDReq", function(data) {
        db.JuryGroup.find({
            competition: data.competitionId
        }, function(err, dbJuries) {
            if(err){
                console.log(err);
            } else {
                if (dbJuries) {
                    var userIds = [];
                    
                    for(var i=0; i<dbJuries.length; i++) {
                        userIds.push(dbJuries[i].jury);
                    }
                    
                    db.User.find({
                        isAdmin: false,
                        _id: {$in: userIds}
                    }, function(err, data) {
                        socket.emit("juriesByCompetitionIDRes", data);
                    });
                } else {
                    socket.emit("juriesByCompetitionIDRes");
                }
            }
        });
    });
    
    
    
    socket.on("competitionActivateReq", function(data) {
        db.Competition.findById(data.competitionId, function(err, ent) {
            ent.isActive = true;
            ent.save(function(err) {
                if (err) {
                    console.log(err);
                } else {
                    socket.emit("competitionActivateRes", {
                        competitionId: ent._id
                    });
                }
            });
        });
    });
    
    socket.on("findCompetitionByUserIdReq", function(data) {
        db.JuryGroup.find({
            jury: data.userId
        }, function(err, juryGroup) {
            if (err) {
                console.log(err);
            } else {
                var competitionIds = [];
                
                for(var i=0; i< juryGroup.length; i++) {
                    competitionIds.push(juryGroup[i].competition);
                }
                
                db.Competition.find({
                    isActive: true,
                    _id: {$in: competitionIds}
                }, function(err, competitions) {
                    if (err) {
                        console.log(err);
                    } else {
                        socket.emit("findCompetitionByUserIdRes", {
                            competitions: competitions
                        });
                    }
                });
            }
        });
    });
    
    socket.on("horsesByCompetitionIdAndJuryIdReq", function(data) {
        db.HorseGroup.find({
            competition: data.competitionId
        })
        .populate("horse")
        .exec(function(err, horseGroup) {
            if (err) {
                console.log(err);
            } else {
                var horses = [];

                for (var i=0; i<horseGroup.length; i++) {
                    horses.push(horseGroup[i]);
                }
                
                socket.emit("horsesByCompetitionIdAndJuryIdRes", {
                    competitionId: data.competitionId,
                    horses: horses
                });
            }
        });
    });
    
    socket.on("horseMarkByCompetitionIdAndJuryIdAndHorseIdReq", function(data) {
        db.HorseMark.findOne({
            competition: data.competitionId,
            jury: data.juryId,
            horse: data.horseId
        })
        .populate("horse jury competition")
        .exec(function(err, ent) {
            if (err) {
                console.log(err);
            } else {
                socket.emit("horseMarkByCompetitionIdAndJuryIdAndHorseIdRes", {
                    horseMark: ent
                });
            }
        });
    });
    
    socket.on("changeTypeMarkReq", function(data) {
        db.HorseMark.findOne({
            competition: data.competitionId,
            jury: data.juryId,
            horse: data.horseId
        })
        .exec(function(err, ent) {
            if (err) {
                console.log(err);
            } else {
                ent.type = data.type;
                ent.save(function(err) {
                    socket.emit("changeMarkRes");
                });
            }
        });
    });
    
    socket.on("changeHeadMarkReq", function(data) {
        db.HorseMark.findOne({
            competition: data.competitionId,
            jury: data.juryId,
            horse: data.horseId
        })
        .exec(function(err, ent) {
            if (err) {
                console.log(err);
            } else {
                ent.head = data.head;
                ent.save(function(err) {
                    socket.emit("changeMarkRes");
                });
            }
        });
    });
    
    socket.on("changeBodyMarkReq", function(data) {
        db.HorseMark.findOne({
            competition: data.competitionId,
            jury: data.juryId,
            horse: data.horseId
        })
        .exec(function(err, ent) {
            if (err) {
                console.log(err);
            } else {
                ent.body = data.body;
                ent.save(function(err) {
                    socket.emit("changeMarkRes");
                });
            }
        });
    });
    
    socket.on("changeLegsMarkReq", function(data) {
        db.HorseMark.findOne({
            competition: data.competitionId,
            jury: data.juryId,
            horse: data.horseId
        })
        .exec(function(err, ent) {
            if (err) {
                console.log(err);
            } else {
                ent.legs = data.legs;
                ent.save(function(err) {
                    socket.emit("changeMarkRes");
                });
            }
        });
    });
    
    socket.on("changeMovementMarkReq", function(data) {
        db.HorseMark.findOne({
            competition: data.competitionId,
            jury: data.juryId,
            horse: data.horseId
        })
        .exec(function(err, ent) {
            if (err) {
                console.log(err);
            } else {
                ent.movement = data.movement;
                ent.save(function(err) {
                    socket.emit("changeMarkRes");
                });
            }
        });
    });
    
    
    
    socket.on("competitionByActivityReq", function(data) {
        db.Competition.find({
            isActive: data.isActive
        })
        .exec(function (err, competitions) {
            socket.emit("competitionByActivityRes", {
                competitions: competitions
            });
        });
    })
    
});

server.listen(3000, function () {
    console.log('Serwer pod adresem http://localhost:3000/');
});