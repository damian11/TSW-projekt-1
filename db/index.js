var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/kittens', { 
  server: { 
    ssl: true,
    sslValidate: false //in case of self-generated certificate 
  }
});

var Cat = mongoose.model('Cat', { name: String });

var kitty = new Cat({ 
  name: 'Zildjian' 
});

kitty.save(function (err) {
  if (err) {
    console.log(err);
  } else {
    console.log('meow');
  }
});