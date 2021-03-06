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
                    res.render("admin", {
                        user: ent
                    });
                } else {
                    res.render("horseCompetition", {
                        loggedUser: ent
                    });
                }
            }
        });
    } else {
        res.render("showCompetitionNew", {
            competitionMasterArchId: req.params.competitionMasterArchId
        });
    }
};


exports.competitionMasterArch = function (req, res){
    res.render("competitionMasterArch");
}


exports.guzik = function (req, res){
    res.render("guzik");
};



exports.login = function (req, res) {
    res.render("login");
};

exports.newHorse = function(req, res) {
    if (req.body.dateOfBirth === "") {
        res.render("admin", {
            message: "Nie zapisano konia w bazie danych - brak daty urodzenia",
            showHorses: true
        });
    } else {
        if ( (req.body.horseId != "undefined") && (req.body.horseId !== "")) {
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
                            res.render("admin", {
                                message: "Poprawnie zaktualizowano konia w bazie danych",
                                showHorses: true
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
                    res.render("admin", {
                        message: "Poprawnie zapisano konia w bazie danych",
                        showHorses: true
                    });
                }
            });
        }
    }
};

exports.registerAdmin = function(req, res) {
    if(req.session.loggedUser !== null){
    if(req.session.loggedUser.isAdmin === true){
         res.render("registerAdmin");
    }else{
        res.render("unauthorized",{
             loggedUser: req.session.loggedUser,
             message:"Nie masz uprawnień do tej strony"
            });
        }
    }else{
        res.render("unauthorized",{
             loggedUser: req.session.loggedUser,
             message:"Nie masz uprawnień do tej strony"
            });
        
    }
   
};

exports.editCompetitionManager = function(req, res){ console.log("req.body: \n" + req.body); console.log(req.body);
        if( (typeof req.body.competitionId != "undefined")  && (req.body.competitionId !== "")){
       
        db.Competition.findById(req.body.competitionId, function(err,ent) {
            if(err){
                console.log(err);
            } else {
                ent.name = req.body.name;
                ent.date = req.body.date;
                ent.comments = req.body.comments;
                ent.save(function(err){
                    if(err){
                        console.log(err);
                    } else{
                        console.log(ent);
                        
                        db.CompetitionMaster.findById(req.body.competitionMasterId, function(err, competitionMaster) {
                            res.render("newCompetitionMasterStep2",{
                                competitionMaster: competitionMaster,
                                
                                message: "Poprawnie zaktualizowano grupę w bazie danych"
                            });
                            
                        });                        
                    }
                });
            }
        });
    }
    
    
}



exports.newCompetitionMasterManager = function(req, res) {
    if( (typeof req.body.competitionMasterId != "undefined")  && (req.body.competitionMasterId !== "")){
        db.CompetitionMaster.findById(req.body.competitionMasterId, function(err,ent) {
            if(err){
                console.log(err);
            } else {
                ent.name = req.body.name;
                ent.date = req.body.date;
                ent.comments = req.body.comments;
                ent.save(function(err){
                    if(err){
                        console.log(err);
                    } else{
                        console.log(ent);
                        res.render("competitionMasterManager",{
                            message: "Poprawnie zaktualizowano zawody w bazie danych"
                        });
                    }
                })
            }
        });
    }
}


exports.newUser = function(req, res) {
    if ( (typeof req.body.userId != "undefined") && (req.body.userId !== "")) {
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
                        console.log(ent.isAdmin);
                        if(ent.isAdmin == true){
                                
                                res.render("admin", {
                                    message: "Poprawnie zaktualizowano użytkownika w bazie danych",
                                   // showJuries: true
                                });
                        
                        }else{
                            res.render("juryManager")
                        }
                        
                        
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
                    res.render("juryManager");
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
};

exports.profile = function (req, res) {
    res.render("profile", {
        loggedUser: req.session.loggedUser
    });
};

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
};

exports.logout = function (req, res) {
    console.log('Wylogowanie...');
    req.session.loggedUser = null;
    req.logout();
    res.redirect('/login');
};


exports.admin = function (req, res) {
    if( (typeof req.session.loggedUser != "undefined") && (req.session.loggedUser !== null) ) {
        if( (typeof req.session.loggedUser.isAdmin != "undefined") && (req.session.loggedUser.isAdmin !== null) ) {
            if(req.session.loggedUser.isAdmin){
                res.render("admin",{
                    loggedUser: req.session.loggedUser
                });
            } else {
                res.render("unauthorized",{
                  loggedUser: req.session.loggedUser  
                });
            }
        }else {
            res.render("unauthorized",{
                loggedUser: req.session.loggedUser
            });
        }
    }else {
        res.render("unauthorized", {
            loggedUser: req.session.loggedUser
        });
    }
}

exports.administrator = function (req, res) {
    if ( (typeof req.session.loggedUser != "undefined") && (req.session.loggedUser !== null) ) {
        if ( (typeof req.session.loggedUser.isAdmin != "undefined") && (req.session.loggedUser.isAdmin !== null) ) {
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
};

exports.newCompetition = function (req, res) {
    if (req.session.loggedUser.isAdmin) {
        res.render("newCompetitionStep1");
    } else {
        res.render("unauthorized", {
            loggedUser: req.session.loggedUser
        });
    }
};

exports.newCompetitionStep2 = function (req, res) {
   
    if (req.session.loggedUser !== null) {
        if (req.session.loggedUser.isAdmin) {
            var competition = new db.Competition({
                name: req.body.name,
                date: req.body.date,
                comments: req.body.comments,
                gender: req.body.gender,
                isActive: false,
                competitionMaster: req.body.competitionMasterId
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
    } else {
        res.render("unauthorized", {
            loggedUser: req.session.loggedUser
        });
    }
};


exports.GETnewCompetitionStep2 = function (req, res) {
    if (req.session.loggedUser !== null) {
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
    } else {
        res.render("unauthorized", {
            loggedUser: req.session.loggedUser
        });
    }
};

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
};

exports.horseCompetition = function(req, res) {
    if (req.session.loggedUser) {
        db.HorseMark.find({
            competition: req.params.competitionId,
            horse: req.params.horseId,
            jury: req.session.loggedUser._id
        })
        .populate("horse competition jury")
        .exec(function (err, ent) {
            if (err) {
                console.log(err);
            } else {
                console.log("ent[0]");
                console.log(ent[0]);
                res.render("horseCompetition", {
                    competitionId: req.params.competitionId,
                    horseId: req.params.horseId,
                    horseMark: ent[0]
                });
            }
        });
    } else {
        res.render("unauthorized", {
            loggedUser: req.session.loggedUser
        });
    }
};

exports.showCompetition = function(req, res) {
    db.Competition.findById(req.params.competitionId)
    .exec(function(err, ent) {
        if (err) {
            console.log(err);
        } else {
            res.render("showCompetition", {
                competitionId: req.params.competitionId,
                competition: ent
            });
        }
    });
};

exports.editCompetition = function(req, res) {
    db.Competition.findById(req.body.competitionId, function (err, ent) {
        ent.name = req.body.name;
        ent.date = req.body.date;
        ent.comments = req.body.comments;
        ent.save(function (err) {
            if (err) {
                console.log(err);
            } else {
                res.render("newCompetitionStep2", {
                    loggedUser: req.session.loggedUser,
                    competition: ent
                });
            }
        });
    });
};

exports.juryManager = function (req, res) {
   if (req.session.loggedUser !== null) {
        if (req.session.loggedUser.isAdmin) {
          res.render("juryManager");
          
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

exports.competitionManager = function (req, res) {
    if (req.session.loggedUser !== null){
        if(req.session.loggedUser.isAdmin) {
            res.render("competitionManager");
            }else {
            res.render("unauthorized", {
                loggedUser: req.session.loggedUser
                
            });
        }
    }      else{
        res.render("unauthorized", {
            loggedUser: req.session.loggedUser
        });
    }
}



exports.competitionMasterManager = function(req, res) {
    if (req.session.loggedUser !== null) {
        if(req.session.loggedUser.isAdmin) {
            res.render("competitionMasterManager");
            }else {
               res.render("unauthorized",{
                   loggedUser: req.session.loggedUser
               }); 
            }
    }   else{
        res.render("unauthorized",{
            loggedUser: req.session.loggedUser
        });
    }
}


exports.horseManager = function (req, res) {
    if (req.session.loggedUser !== null){
        if(req.session.loggedUser.isAdmin) {
            res.render("horseManager");
            
        }else{
            res.render("unauthorized", {
                loggedUser: req.session.loggedUser
            });
        }
    }else {
        res.render("unauthorized", {
            loggedUser: req.session.loggedUser
        });
    }
}

exports.newCompetitionMaster = function (req, res) {
   if (req.session.loggedUser !== null) {
        if (req.session.loggedUser.isAdmin) {
          res.render("newCompetitionMaster");
          
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

exports.newCompetitionMasterStep2 = function (req, res) {
    if (req.session.loggedUser !== null) {
        if (req.session.loggedUser.isAdmin) {
            var competitionMaster = new db.CompetitionMaster({
                name: req.body.name,
                date: req.body.date,
                comments: req.body.comments,
                isActive: false
            });

            competitionMaster.save(function(err) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("newCompetitionMasterStep2", {
                        loggedUser: req.session.loggedUser,
                        competitionMaster: competitionMaster
                    });
                }
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
};

exports.GETnewCompetitionMaster = function(req, res) {
    if (req.session.loggedUser !== null){
        if (req.session.loggedUser.isAdmin) {
            db.CompetitionMaster.findById(req.params.competitionMasterId, function(err,ent){
               if(err){
                   console.log(err);
               }  else{
                    res.render("newCompetitionStep1", {
                        loggedUser: req.session.loggedUser,
                        competitionMasterId: req.params.competitionMasterId,
                        competitionMaster: ent    
                    });
                  }      
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
};

exports.GETnewCompetitionMasterStep2 = function(req, res) {
     if (req.session.loggedUser !== null){
        if (req.session.loggedUser.isAdmin) {
            db.CompetitionMaster.findById(req.params.competitionMasterId, function(err, ent){
                db.Competition.find({
                    competitionMaster: req.params.competitionMasterId
                })
                .exec(function(err, competitions){
                        res.render("newCompetitionMasterStep2", {
                        loggedUser: req.session.loggedUser,
                        competitionMaster: ent,
                        competitions: competitions    
                    });
                });
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
};


exports.showCompetitionNew = function(req, res) {
    res.render("showCompetitionNew", {
        competitionMasterArchId: req.params.competitionMasterArchId
    });
};
