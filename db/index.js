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
    horseName: String,
    gender: String,
    owner: String,
    dateOfBirth: Date
});

var Competition = mongoose.model("Competition", {
    name: String,
    date: Date,
    comments: String,
    gender: String,
    isActive: Boolean
});

var JuryGroup = mongoose.model("JuryGroup", {
    name: String,
    competition: {
        type: String,
        ref: "Competition"
    },
    jury: {
        type: String,
        ref: "User"
    }
});

var HorseGroup = mongoose.model("HorseGroup", {
    name: String,
    competition: {
        type: String,
        ref: "Competition"
    },
    horse: {
        type: String,
        ref: "Horse"
    },
    isActive: Boolean
});

var HorseMark = mongoose.model("HorseMark", {
    type: Number,
    head: Number,
    body: Number,
    legs: Number,
    movement: Number,
    competition: {
        type: String,
        ref: "Competition"
    },
    horse: {
        type: String,
        ref: "Horse"
    },
    jury: {
        type: String,
        ref: "User"
    }
});

module.exports.User = User;
module.exports.Horse = Horse;
module.exports.Competition = Competition;
module.exports.JuryGroup = JuryGroup;
module.exports.HorseGroup = HorseGroup;
module.exports.HorseMark = HorseMark;