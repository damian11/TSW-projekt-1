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
    isAdmin: Boolean
});

//var user = new User({
//    username:'Jan',
//    password: 'jan',
//    isAsmin: true
//    
//});

//user.save(function (err){
//    if(err){
//        console.log(err);
//    }else{
//        console.log('aaa');
//    }
//});

module.exports.User = User;