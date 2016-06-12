var exports = module.exports = {};

var db = require("../db");

exports.index = function (req, res) {
    if (req.user) {
        db.User.findOne({
            username: req.user.username
        })
        .exec(function(err, ent) {
            if (err) {
                console.log(err);
            } else {
                if ( (typeof ent.isAdmin != "undefined") && (ent.isAdmin) ) {
                    res.render("administrator", {
                        user: ent
                    });
                } else {
                    res.render("index", {
                        user: ent
                    });
                }
            }
        });
    } else {
        res.render("index");
    }
};

exports.login = function (req, res) {
    res.render("login");
};

exports.newHorse = function(req, res) {
    if ( (req.body.horseId != "undefined") && (req.body.horseId != "")) {
        db.Horse.findById(req.body.horseId, function(err, ent) {
            if (err) {
                console.log(err);
            } else {
                ent.horseName = req.body.horseName;
                ent.gender = req.body.gender;
                ent.owner = req.body.owner;
                ent.dateOfBirth = req.body.dateOfBirth;
                ent.save(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.render("administrator", {
                            message: "Poprawnie zaktualizowano konia w bazie danych"
                        });
                    }
                });
            }
        });
    } else {
        var horse = new db.Horse({
            horseName:   req.body.horseName,
            gender:      req.body.gender,
            owner:       req.body.owner,
            dateOfBirth: req.body.dateOfBirth
        });

        horse.save(function(err) {
            if (err) {
                console.log(err);
            } else {
                res.render("administrator", {
                    message: "Poprawnie zapisano konia w bazie danych"
                });
            }
        });
    }
}

exports.registerAdmin = function(req, res) {
    res.render("registerAdmin");
}

exports.newUser = function(req, res) {
    if ( (typeof req.body.userId != "undefined") && (req.body.userId != "")) {
        db.User.findById(req.body.userId, function(err, ent) {
            if (err) {
                console.log(err);
            } else {
                ent.username = req.body.username;
                ent.firstName = req.body.firstName;
                ent.lastName = req.body.lastName;
                ent.password = req.body.password;
                ent.isAdmin = ent.isAdmin;
                ent.save(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.render("administrator", {
                            message: "Poprawnie zaktualizowano użytkownika w bazie danych",
                            showJuries: true
                        });
                    }
                });
            }
        });
    } else {
//        var user = new db.User({
//            username : req.body.username,
//            firstName: req.body.firstName,
//            lastName : req.body.lastName,
//            password : req.body.password
//        });
        
        var user = new db.User({
            username: req.body.username,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            isAdmin: (req.body.isAdmin == 'on' ? true : false)
        });

        user.save(function(err) {
            if (err) {
                console.log(err);
            } else {
                if (req.user) {
                    res.render("administrator", {
                        message: "Poprawnie zapisano użytkownika w bazie danych",
                        showJuries: true
                    });
                } else {
                    res.render("login");
                }
            }
        });
    }
//    var user = new db.User({
//        username: req.body.username,
//        password: req.body.password,
//        firstName: req.body.firstName,
//        lastName: req.body.lastName,
//        isAdmin: (req.body.isAdmin == 'on' ? true : false)
//    });
//
//    //Create
//    user.save(function (err){
//        if(err){
//              console.log(err);
//          
//          
//        }else if(isAdmin = true){
//              res.redirect("/administrator");
//           
//        }else {
//             res.redirect("/login");
//        }
//    });
    
//    //Read
//    db.User.find({
//        username: "marek"
//    }, function (err, docs) {
//        if(err){
//            console.log(err);
//        }else{
//            console.log(docs); //tablica elementów
//        }
//    });
//    
//    db.User.findOne({
//        username: "marek"
//    }, function (err, docs) {
//        if(err){
//            console.log(err);
//        }else{
//            console.log(docs); //pojedyńczy element
//        }
//    });
//    
//    //Update
//    db.User.update(
//        {
//            username: "marek"
//        },
//        {
//            username: "marek1"
//        },
//        {
//            multi: true
//        },
//        function (err, numAffected) {
//            console.log("Zaktualizowano " + numAffected + " wierszy.");
//        }
//    );
//    
//    //Delete
//    db.User.remove({
//        username: "marek"
//    }, function (err, docs) {
//        if(err){
//            console.log(err);
//        }else{
//            console.log(docs); //pojedyńczy element
//        }
//    });
}

exports.profile = function (req, res) {
    res.render("profile", {
        loggedUser: req.session.loggedUser
    });
}

exports.editProfile = function (req, res) {
    db.User.findOne({
        username: req.body.username
    }, function(err, ent) {
        
        if (err) {
            
        } else {
            ent.username = req.body.username;
//            ent.password = req.body.password;
            ent.firstName = req.body.firstName;
            ent.lastName = req.body.lastName;
            ent.isAdmin = ent.isAdmin;
            ent.save();
            
            console.log("Zaktualizowano użytkownika: " + ent.username);
            
            res.redirect("/");
        }
    });
}

exports.logout = function (req, res) {
    console.log('Wylogowanie...');
    req.session.loggedUser = null;
    req.logout();
    res.redirect('/login');
};

exports.administrator = function (req, res) {
    if ( (typeof req.session.loggedUser != "undefined") && (req.session.loggedUser != null) ) {
        if ( (typeof req.session.loggedUser.isAdmin != "undefined") && (req.session.loggedUser.isAdmin != null) ) {
            if (req.session.loggedUser.isAdmin) {
                res.render("administrator", {
                    loggedUser: req.session.loggedUser
                });
            } else {
                res.render("unauthorized", {
                    loggedUser: req.session.loggedUser
                });
            }
        } else {
            res.render("unauthorized", {
                loggedUser: req.session.loggedUser
            });
        }
    } else {
        res.render("unauthorized", {
            loggedUser: req.session.loggedUser
        });
    }
}

exports.newCompetition = function (req, res) {
    if (req.session.loggedUser.isAdmin) {
        res.render("newCompetitionStep1");
    } else {
        res.render("unauthorized", {
            loggedUser: req.session.loggedUser
        });
    }
}

exports.newCompetitionStep2 = function (req, res) {
    if (req.session.loggedUser.isAdmin) {
        var competition = new db.Competition({
            name: req.body.name,
            date: req.body.date,
            comments: req.body.comments,
            gender: req.body.gender,
            isActive: false
        });
        
        competition.save(function(err) {
            if (err) {
                console.log(err);
            } else {
                res.render("newCompetitionStep2", {
                    loggedUser: req.session.loggedUser,
                    competition: competition
                });
            }
        });
    } else {
        res.render("unauthorized", {
            loggedUser: req.session.loggedUser
        });
    }
}

exports.GETnewCompetitionStep2 = function (req, res) {
    if (req.session.loggedUser.isAdmin) {
        db.Competition.findById(req.params.competitionId, function(err, ent) {
            if (err) {
                console.log(err);
            } else {
                res.render("newCompetitionStep2", {
                    loggedUser: req.session.loggedUser,
                    competition: ent
                });
            }
        });
    } else {
        res.render("unauthorized", {
            loggedUser: req.session.loggedUser
        });
    }
}

exports.competition = function(req, res) {
    if (req.session.loggedUser) {
        res.render("juryCompetition", {
            competitionId: req.params.competitionId,
            juryId: req.session.loggedUser._id
        });
    } else {
        res.render("unauthorized", {
            loggedUser: req.session.loggedUser
        });
    }
}

exports.horseCompetition = function(req, res) {
    if (req.session.loggedUser) {
        db.HorseMark.find({
            competition: req.params.competitionId,
            horse: req.params.horseId,
            jury: req.session.loggedUser._id
        })
        .populate("horse competition jury")
        .exec(function (err, ent) {
            res.render("horseCompetition", {
                competitionId: req.params.competitionId,
                horseId: req.params.horseId,
                horseMark: ent[0]
            });
        });
    } else {
        res.render("unauthorized", {
            loggedUser: req.session.loggedUser
        });
    }
}

exports.showCompetition = function(req, res) {
    res.render("showCompetition", {
        competitionId: req.params.competitionId
    });
}

exports.editCompetition = function(req, res) {
    db.Competition.findById(req.body.competitionId, function (err, ent) {
        ent.name = req.body.name;
        ent.date = req.body.date;
        ent.comments = req.body.comments;
        ent.save(function (err) {
            if (err) {
                console.log(err);
            }
        });
    })
}

