var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/wyscigiDB', { 
  server: { 
    ssl: true,
    sslValidate: false //in case of self-generated certificate 
  }
});

var User = mongoose.model('User', { 
    username: String,
    password: String,
    firstName: String,
    lastName: String,
    isAdmin: Boolean
});

var Horse = mongoose.model("Horse", {
    name: String,
    gender: String,
    owner: String
});

module.exports.User = User;