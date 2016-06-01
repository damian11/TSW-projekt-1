var exports = module.exports = {};

var db = require("../db");

exports.index = function (req, res) {
    var body = '<html><body>';
    var username;
    if (req.user) {
        username = req.user.username;
        body += '<p>Jesteś zalogowany jako „' + username + '”</p>';
        body += '<a href="/logout">Wyloguj</a>';
    } else {
        body += '<a href="/login">Zaloguj</a>';
    }
    body += '</body></html>';
    res.send(body);
};

exports.login = function (req, res) {
    var body = '<html><body>';
    body += '<form action="/login" method="post">';
    body += '<div><label>Użytkownik:</label>';
    body += '<input type="text" name="username"/><br/></div>';
    body += '<div><label>Hasło:</label>';
    body += '<input type="password" name="password"/></div>';
    body += '<div><input type="submit" value="Zaloguj"/></div></form>';
    body += '<a href="/registerAdmin.html">Utwórz administratora</a>';

    body += '</body></html>';
    res.send(body);
};

exports.newHorse = function(req, res) {
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

exports.newUser = function(req, res) {
    var user = new db.User({
        username: req.body.username,
        password: req.body.password,
        isAdmin: (req.body.isAdmin == 'on' ? true : false)
    });

    //Create
    user.save(function (err){
        if(err){
              console.log(err);
          
          
        }else if(isAdmin = true){
              res.redirect("/administrator");
           
        }else {
             res.redirect("/login");
          
            
        }
        
    });
    
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
            ent.isAdmin = req.body.isAdmin == 'on' ? true : false;
            ent.save();
            
            console.log("Zaktualizowano użytkownika: " + ent.username);
            
            res.redirect("authorized.html");
        }
    });
}

exports.logout = function (req, res) {
    console.log('Wylogowanie...');
    req.logout();
    res.redirect('/login');
};
exports.administrator = function (req, res) {
    if (req.user.isAdmin) {
        res.render("administrator", {
            loggedUser: req.session.loggedUser
        });
    } else {
        res.render("unauthorized", {
            loggedUser: req.session.loggedUser
        });
    }
}

