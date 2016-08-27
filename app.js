/*jshint node: true, loopfunc: true */

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
var sessionStore = new redisStore();
var port = process.env.PORT || 3000;
var env = process.env.NODE_ENV || 'development';
var sessionSecret = 'wielkiSekret44';
var sessionKey = 'express.sid';

var socketIo = require('socket.io');
var passport = require('passport');
var passportSocketIo = require('passport.socketio');
var LocalStrategy = require('passport-local').Strategy;

var hurryUpTab = [];

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
                    console.log("passport - przed wybieraniem z bazy");
                    console.log("passport - username: " + username);
                    console.log("passport - password: " + password);
        db.User.findOne({
            username: username,
            password: password
        }, function (err, ent) {
                    console.log("passport - po zapytaniu do bazy");
            if (err) {
                    console.log("passport - błą - " + err);
                console.log(err);
                return done(err);
            } else {
                    console.log("passport - poprawnie zapytanie do bazy");
                if (ent) {
                    console.log("Udane logowanie:");
                    console.log(ent);
                    return done(null, {
                        username: ent.username,
                        password: ent.password
                    });
                } else {
                    console.log("passport - błąd logowania");
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
app.get('/registerAdmin', routes.registerAdmin);
app.post('/newUser', routes.newUser);
app.post('/newHorse', routes.newHorse);
app.get('/profile', routes.profile);
app.get('/administrator', routes.administrator);
app.get("/newCompetition", routes.newCompetition);
app.post("/newCompetitionStep2", routes.newCompetitionStep2);
app.get("/newCompetitionStep2/:competitionId", routes.GETnewCompetitionStep2);
app.post("/editProfile", routes.editProfile);
app.get("/newCompetition/:competitionMasterId", routes.GETnewCompetitionMaster);
app.get("/competitionMasterManager", routes.competitionMasterManager);
app.get("/admin", routes.admin);

app.get('/guzik', routes.guzik);
app.get("/showCompetitionNew", function(req, res) {res.render("showCompetitionNew");});


app.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/login'
    }),
    function (req, res) {
//    console.log("przed zapytaniem");
        db.User.findOne({
            username: req.user.username
        }, function (err, ent) {
//    console.log("wykoanne zapytanie w bazie");
            req.session.loggedUser = ent;
            
            if (err) {
//    console.log("błąd wybierania użytkownika z bazy");
                res.redirect('/login');
            } else {
//    console.log("znaleziony użytkownik");
                if(req.session.loggedUser.isAdmin) {
//    console.log("przekierowanie administrator");
                    res.redirect('/administrator');
                } else {
//    console.log("przekierowanie jury");
                    res.redirect('/');
                }
            }
        });
    }
);
app.get('/logout', routes.logout);
app.get("/jury/competition/:competitionId", routes.competition);
app.get("/horse/competition/:horseId/:competitionId", routes.horseCompetition);
app.get("/showCompetition/:competitionId", routes.showCompetition);
app.post("/editCompetition", routes.editCompetition);
app.get("/juryManager", routes.juryManager);
app.get("/newCompetitionMaster", routes.newCompetitionMaster);
app.post("/newCompetitionMasterStep2", routes.newCompetitionMasterStep2);
app.get("/newCompetitionMasterStep2/:competitionMasterId", routes.GETnewCompetitionMasterStep2);
app.get("/horseManager", routes.horseManager);
app.get("/competitionManager", routes.competitionManager);

var privateKey = fs.readFileSync( "cert/server-key.pem" );
var certificate = fs.readFileSync( "cert/server-cert.pem" );

var server = https.createServer({
    key: privateKey,
    cert: certificate
}, app).listen(port);



var sio = socketIo.listen(server);


var onAuthorizeSuccess = function (data, accept) {
//    console.log('Udane połączenie z socket.io');
    accept(null, true);
};

var onAuthorizeFail = function (data, message, error, accept) {
    if (error) {
//        throw new Error(message);
        console.log(message);
    }
    console.log("");
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

var marks = {};
app.set("marks", marks);

sio.sockets.on('connection', function (socket) {  
    
    socket.on('guzikReq', function(data){
        console.log(data);
        var liczba1 = parseInt(data.liczba1);
        var liczba2 = parseInt(data.liczba2);
        socket.emit('guzikRes', liczba1 + liczba2);
//         db.Guzik.find({}, function(err, ent){
//            if(err){
//                console.log(err);
//                
//            }else{
//                socket.emit("guzikRes", ent);
//            }
//         })
        
        });

    
    
    socket.on('horsesReq', function(data) {
        db.Horse.find({}, function(err, ent) {
            if (err) {
                console.log(err);
            } else {
                socket.emit("horsesRes", ent);
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
                    socket.emit("availableHorsesRes", ent);
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
                    socket.emit("availableJuryRes", ent);
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
            }
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
    
    
    socket.on("competitionMasterReadByIDReq", function(data){
       db.CompetitionMaster.findById(data.competitionMasterId, function(err,ent){
          if(err) {
              console.log(err);
          } else{
              socket.emit("competitionMasterReadByIDRes",{
                 data: ent 
              });
          }
       }); 
    });
    
    socket.on("juryDeleteByIDReq", function(data) {
        db.User.findById(data.userId, function(err, ent) {
            if (err) {
                console.log(err);
            } else {
                ent.remove(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        socket.emit("juryDeleteByIDRes", {
                            status: "OK"
                        });
                    }
                });
            }
        });
    });
    
    
    socket.on("competitionMasterDeleteByIDReq", function(data) {
        db.CompetitionMaster.findById(data.competitionMasterId, function(err, ent) { console.log(ent);
            if(err) {
                console.log(err);
            } else {
                ent.remove(function(err){
                    if(err) {
                        console.log(err);
                    } else {
                        socket.emit("competitionMasterDeleteByIDRes",{
                            status: "OK"
                         });
                    }
                });
            }
        });
    });
    
    socket.on("competitionDeleteByIDReq", function(data){
        db.Competition.findById(data.competitionId, function(err,ent) {
            if(err) {
                console.log(err);
            }else {
                ent.remove(function(err){
                    if(err){
                        console.log(err);
                    }else{
                        socket.emit("competitionDeleteByIDRes",{
                           status: "OK" 
                        });
                    }
                });
            }
        });
    });
    
    
    socket.on("juryReadByIDReq", function(data) { 
        db.User.findById(data.userId, function(err, ent) {
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
//                console.log("ent");
//                console.log(ent);
                socket.emit("juryRes", ent);
            }
        });
    });
    
    
    
    socket.on("horsesByCompetitionIDReq", function(data) {
        db.HorseGroup.find({
            competition: data.competitionId
        })
        .populate("horse")
        .exec(function(err, data) {
            if(err){
                console.log(err);
            } else {
                if (data !== null) {
                    socket.emit("horsesByCompetitionIDRes", data);
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
            isActive: false,
            startNumber: 0
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
                console.log(err);
            }else{
                socket.emit("horseDeleteFromCompetitionRes", {
                    competitionId: data.competitionId
                });
            }
        });
    });
    
    function findNotMarkedHorseAndDeactivate(competitionId, horseId, horseEnt) {
        db.HorseMark.find({
            competition: competitionId,                // select * from horsemark where competition=... and horse=... and (type=0 or head=0 orbody=0 ...)
            horse: horseId,
            $or: [
                { type: 0     },
                { head: 0     },
                { body: 0     },
                { legs: 0     },
                { movement: 0 }
            ]
        })
        .exec(function(err, undoneHorseMarks) {
            if (err) {
                console.log(err);
            } else {
                if (undoneHorseMarks.length !== 0) {
                    socket.emit("horseActivateInCompetitionRes", {
                        competitionId: competitionId,
                        horse: horseEnt,
                        message: "Nie można jeszcze zdeaktywować konia - brak wszystkich wystawionych ocen"
                    });
                } else {
                    horseEnt.isActive = false;
                    horseEnt.save(function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            socket.emit("horseActivateInCompetitionRes", {
                                competitionId: competitionId,
                                horse: horseEnt
                            });
                        }
                    });
                }
            }
        });
    }
    
    function regenerateHorseMarks(competitionId, horseId, horseEnt) {
        console.log("competitionId: " + competitionId);
        console.log("horseId: " + horseId);
        console.log("horseEnt: " + horseEnt);
        db.JuryGroup.find({
            competition: competitionId
        }, function (err, juriesInCompetition) {
        console.log("juriesInCompetition: " + juriesInCompetition);
            if (err) {
                console.log(err);
            } else {
                db.HorseMark.find({
                    horse: horseId,
                    competition: competitionId
                })
                .remove()
                .exec(function(err, data) {
        console.log("remove: ");

                    for (var i=0;i<juriesInCompetition.length; i++) {
                        var horseMark = new db.HorseMark({
                            type: 0,
                            head: 0,
                            body: 0,
                            legs: 0,
                            movement: 0,
                            competition: competitionId,
                            horse: horseId,
                            jury: juriesInCompetition[i].jury
                        });

                        horseMark.save();
            console.log("save: ");
                    }
                });

                socket.emit("horseActivateInCompetitionRes", {
                    competitionId: competitionId,
                    horse: horseEnt
                });
            }
        });
    }
    
    socket.on("horseActivateInCompetitionReq", function(data) {
        db.HorseGroup.findOne({
            competition: data.competitionId,
            horse: data.horseId
        }, function (err, ent) {
            if (err) {
                console.log(err);
            } else {
                if (ent.isActive === true) {
                    findNotMarkedHorseAndDeactivate(data.competitionId, data.horseId, ent);
                } else {
                    db.HorseGroup.find({
                        competition: data.competitionId,
                        isActive: true
                    })
                    .exec(function(err, activeHorseGroup) {
                        if (err) {
                            console.log(err);
                        } else {
                            if (activeHorseGroup.length !== 0) {
                                socket.emit("horseActivateInCompetitionRes", {
                                    competitionId: data.competitionId,
                                    horse: ent,
                                    message: "Nie można jeszcze aktywować konia - są jeszcze inne aktywne konie w tych zawodach"
                                });
                                return;
                            } else {
                                ent.isActive = true;
                                db.HorseGroup.find({
                                    competition: data.competitionId,
                                    startNumber: { $gt: 0 }
                                })
                                .exec(function(err, horsesWithStartNumber) {
                                    ent.startNumber = horsesWithStartNumber.length + 1;
                                    ent.save(function(err) {
                                        if (err) {
                                            console.log(err);
                                        } else {
                                            regenerateHorseMarks(data.competitionId, data.horseId, ent);
                                        }
                                    });
                                });
                            }
                        }
                    });
                }
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
                console.log(err);
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
    
    
    
    socket.on("competitionStartReq", function(data) {
       
        db.Competition.findById(data.competitionId, function(err, ent) {
            ent.isActive = true;
            ent.save(function(err) {
                if (err) {
                    console.log(err);
                } else {
                    socket.emit("competitionStartRes", {
                        competitionId: ent._id
                    });
                }
            });
        });
    });
    
    socket.on("competitionStopReq", function(data) {
        db.Competition.findById(data.competitionId, function(err, ent) {
            db.HorseGroup.find({
                competition: data.competitionId,
                isActive: true
            })
            .exec(function(err, horseGroup) {
                if(horseGroup.length != 0) {
                    socket.emit("competitionStopRes", {
                        status: "NOK",
                        message: "Nie można zakończyć zawodów, gdyż istnieją w nich aktywne konie"
                    });
                } else {
                    ent.isActive = false;
                    ent.save(function(err) {
                        if (err) {
                            console.log(err);
                        } else {
                            socket.emit("competitionStopRes", {
                                status: "OK",
                                competitionId: ent._id
                            });
                        }
                    });
                }
            })
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
            competition: data.competitionId,
            isActive: true
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
//        console.log(data);
        db.HorseGroup.findOne({
            competition: data.competitionId,
            horse: data.horseId,
            isActive: true
        })
        .exec(function(err, horseGroup) {
//            console.log("//" + horseGroup);
            if (err) {
                console.log(err);
            } else {
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
                        if (horseGroup === null) {
                            socket.emit("horseMarkByCompetitionIdAndJuryIdAndHorseIdRes", {
                                horseMark: ent,
                                status: "NOK"
                            });
                        } else {
                            socket.emit("horseMarkByCompetitionIdAndJuryIdAndHorseIdRes", {
                                horseMark: ent,
                                status: "OK"
                            });
                        }
                    }
                });
            }
        });
    });
    
//    socket.on("adminSaveMarksReq", function(data) {
//         var marks = app.get("marks");
//        for(var key in marks){
//            marks[key].save();
//            delete marks[key];
//
//        }
//    });
    
    
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
    });
    
    
    
    socket.on("competitionMasterActivateReq",function(data){
       db.CompetitionMaster.findById(data.competitionMasterId, function(err, competitionMaster){
           if(err){
               console.log(err);
           } else{
               if(competitionMaster.isActive == true){
                   competitionMaster.isActive = false;
               }else {
                   competitionMaster.isActive = true;
               }
               competitionMaster.save(function(err){
                   socket.emit("competitionMasterActivateRes");
               });
           }
       }); 
    });
    
    socket.on("horseMarkByCompetitionIdReq", function(data) {
        db.HorseMark.find({
            competition: data.competitionId,
            type: {$ne: 0},
            head: {$ne: 0},
            body: {$ne: 0},
            legs: {$ne: 0},
            movement: {$ne: 0}
        })
        .populate("horse competition jury")
        .exec(function(err, horseMarks) {
            var doneHorseMarks = [];
            var horsesIds = [];
            
            for(var i=0;i<horseMarks.length; i++) {
                horsesIds.push(horseMarks[i].horse._id);
            }
            
            db.HorseGroup.find({
                competition: data.competitionId,
                horse: {$in: horsesIds},
                isActive: false
            })
            .exec(function(err, horses) {
                if (err) {
                    console.log(err);
                } else {
                    for(var i=0;i<horses.length; i++) {
                        for(var j=0;j<horseMarks.length; j++) {
                            if ( (horses[i].horse == horseMarks[j].horse._id) ){
                                doneHorseMarks.push(horseMarks[j]);
                            }
                        }
                    }
                }

                socket.emit("horseMarkByCompetitionIdRes", {
                    competitionId: data.competitionId,
                    horseMarks: doneHorseMarks
                });
            });
        });
    });
    
    socket.on("horseMarkByCompetitionIdAdminReq", function(data) {
        db.HorseMark.find({
            competition: data.competitionId
        })
        .populate("horse competition jury")
        .exec(function(err, horseMarks) {
            var doneHorseMarks = [];
            var horsesIds = [];
            
            for(var i=0;i<horseMarks.length; i++) {
                horsesIds.push(horseMarks[i].horse._id);
            }
            
            db.HorseGroup.find({
                competition: data.competitionId,
                horse: {$in: horsesIds},
                isActive: true
            })
            .exec(function(err, horses) {
                if (err) {
                    console.log(err);
                } else {
                    for(var i=0;i<horses.length; i++) {
                        for(var j=0;j<horseMarks.length; j++) {
                            if ( (horses[i].horse == horseMarks[j].horse._id) ){
                                doneHorseMarks.push(horseMarks[j]);
                            }
                        }
                    }
                }

                socket.emit("horseMarkByCompetitionIdAdminRes", {
                    horseMarks: doneHorseMarks
                });
            });
        });
    });
    
   socket.on("competitionListReq", function(data){
       db.Competition
       .find()
       .exec(function(err, competitions) {
           if(err) {
               console.log(err);
           }else {
               socket.emit("competitionListRes", {
                   competitions: competitions
               });
           }
           
       });
   }); 
    
  socket.on("competitionMasterListReq", function(data){
      db.CompetitionMaster
      .find()
      .exec(function(err, competitionsmasters){
          if(err){
              console.log(err);
          }else {
              socket.emit("competitionMasterListRes",{
                 
                  competitionmasters: competitionsmasters
                  
              });
          }
      });
  });    
    
    socket.on("juryHurryUpReq", function(data) {
        hurryUpTab.push({
            competitionId: data.competitionId,
            juryId: data.juryId
        });
    });
    
    socket.on("shouldIHurryUpReq", function(data) {
        for (var i in hurryUpTab) {
            if ( (hurryUpTab[i].competitionId == data.competitionId) && (hurryUpTab[i].juryId == data.juryId) ) {
                hurryUpTab.splice(hurryUpTab.indexOf(i));
                db.HorseMark.findOne({
                    competition: data.competitionId,
                    horse: data.horseId,
                    jury: data.juryId
                })
                .exec(function(err, ent) {
                    if (err) {
                        console.log(err);
                    } else {
                        socket.emit("shouldIHurryUpRes", {
                            horseMark: ent
                        });
                    }
                });
            }
        }
    
    });
    
    socket.on("competitionsByCompetitionMasterIdReq",function(data) {
        db.Competition.find({
            competitionMaster: data.competitionMasterId
        })
        .exec(function(err, competitions){
            socket.emit("competitionsByCompetitionMasterIdRes",{
               competitions: competitions 
            });
        });
    });
    
    
    
    socket.on("getActiveCompetitionHorseJuryReq",function(data){
        db.JuryGroup.find({
            jury: data.loggedUserId
        })
        .populate({
            path: "competition",
            match: { isActive: true}
        })
        .exec(function(err,ent){
            var competition = null;
            
            for (var i in ent) {
                if(ent[i].competition != null) {
                    competition = ent[i].competition;
                    break;
                }
            }
            if(competition == null){
                   socket.emit("getActiveCompetitionHorseJuryRes", {
                       status: "NODATA"
                   });
            }
            else{
                db.HorseGroup.find({
                    competition: competition._id,
                    isActive: true
                })
                .exec(function(err, horseGroup) {
                    if(horseGroup[0] === null || typeof horseGroup[0] == "undefined"){
                       socket.emit("getActiveCompetitionHorseJuryRes", {
                           status: "NODATA"
                       });
                    } else {
                        socket.emit("getActiveCompetitionHorseJuryRes", {
                            juryId: data.loggedUserId,
                            horseId: horseGroup[0].horse,
                            competitionId: competition._id,
                            horseGroup: horseGroup[0],
                            competition: competition,
                            status: "OK"
                        });
                    }
                });
            }
        });
        
    });
    
    socket.on("getActiveCompetitionMasterAndCompetitionReq", function(data) {
        db.Competition.find()
        .populate({
            path: "competitionMaster",
            match: {isActive: true}
        })
        .exec(function(err, competitions) {
            if (err) {
                console.log(err);
            } else {
                for (var i in competitions) {
                    if (competitions[i].competitionMaster == null) {
                        competitions.splice(i);
                    }
                }
                socket.emit("getActiveCompetitionMasterAndCompetitionRes", {
                    competitions: competitions
                });
            }
        });
    });
    
    socket.on("getHorseStartNumberByCompetitionReq", function(data) {
        db.HorseGroup.find({
            horse: data.horseId,
            competition: data.competitionId
        })
        .exec(function(err, horseGroupsTable) {
            socket.emit("getHorseStartNumberByCompetitionRes", {
                horseGroup: horseGroupsTable[0]
            });
        });
    });
        
    
});


    

server.listen(3000, function () {
    console.log('Serwer pod adresem http://localhost:3000/');
});
