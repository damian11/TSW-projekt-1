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
    body += '<a href="/registerAdmin.html">Utwórz administratora<br/></a>';
    body += '<a href="/register.html">Utwórz sędziego</a>';
    body += '</body></html>';
    res.send(body);
};

exports.newUser = function(req, res) {
    var user = new db.User({
        username: req.body.username,
        password: req.body.password,
        isAdmin: (req.body.isAdmin == 'on' ? true : false)
    });

    user.save(function (err){
        if(err){
            console.log(err);
        }else{
            res.redirect("/login");
        }
    });
}

exports.logout = function (req, res) {
    console.log('Wylogowanie...');
    req.logout();
    res.redirect('/login');
};
