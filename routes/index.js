var exports = module.exports = {};

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
    body += '</body></html>';
    res.send(body);
};

exports.logout = function (req, res) {
    console.log('Wylogowanie...');
    req.logout();
    res.redirect('/login');
};
