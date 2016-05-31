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
    isAdmin: Boolean,
    juryGroup: {
        type: String,
        ref: "JuryGroup"
    }
});

var Horse = mongoose.model("Horse", {
    name: String,
    gender: String,
    owner: String,
    dateOfBirth: Date
});

var Competition = mongoose.model("Competition", {
    name: String,
    date: Date,
    comments: String
});

var JuryGroup = mongoose.model("JuryGroup", {
    name: String,
    competition: {
        type: String,
        ref: "Competition"
    }
});

//var comp1 = new Competition({
//    name: "comp1"
//});
//comp1.save(function(err) {
//    var jg1 = new JuryGroup({
//        name: "jg1",
//        competition: comp1
//    });
//    
//    jg1.save(function(err) {
//        console.log(err);
//    });
//});
//> db.jurygroups.find()
//{ "_id" : ObjectId("574de4bd6e5582844b5a5496"), "name" : "jg1", "competition" : ObjectId("574de4bd6e5582844b5a5495"), "__v" : 0 }
//{ "_id" : ObjectId("574de679f41baf7c1cc71f8a"), "name" : "jg1", "competition" : "574de679f41baf7c1cc71f89", "__v" : 0 }
//{ "_id" : ObjectId("574de6d82420e2682a1125ba"), "name" : "jg1", "competition" : ObjectId("574de6d82420e2682a1125b9"), "__v" : 0 }
//{ "_id" : ObjectId("574de74fcfebe3ac41663a51"), "name" : "jg1", "competition" : { "__v" : 0, "name" : "comp1", "_id" : ObjectId("574de74fcfebe3ac41663a50") }, "__v" : 0 }
//{ "_id" : ObjectId("574de7719177ef7038924b88"), "name" : "jg1", "competition" : ObjectId("574de7719177ef7038924b87"), "__v" : 0 }
//> db.competitions.findOne({_id: ObjectId("574de7719177ef7038924b87")})
//{
//        "_id" : ObjectId("574de7719177ef7038924b87"),
//        "name" : "comp1",
//        "__v" : 0
//}
//> db.competitions.findOne({_id: ObjectId("574de7719177ef7038924b87")}).name
//comp1
//>

module.exports.User = User;