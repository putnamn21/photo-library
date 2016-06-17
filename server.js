// server.js

    // set up ========================
    var express  = require('express');
    var app      = express();                               // create our app w/ express
    var mongoose = require('mongoose');                     // mongoose for mongodb
    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
    var stylus = require('stylus');
    var nib = require('nib');
    var multer = require('multer');
    var fs = require('fs');
    var upload = multer({ dest: './public/img/',
                        limits: {files:1}
                        });
    var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
    var config = require('./config'); // get our config file

    var port = process.env.PORT || 8080; // used to create, sign, and verify tokens

    // Mongoose configuration =================
    var db = mongoose.connection;

      db.on('error', console.error);
      db.once('open', function() {
        // Create your schemas and models here
        console.log("Connected to DB!");

      });
    
    mongoose.connect('mongodb://localhost:27017');

    app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());

    app.set('superSecret', config.secret); // secret variable
   


//**************************************** APP SETUP ABOVE **************************************



// MODELS =================================================================================
   

   
var Photo = require('./app/models/photo'); // get our Photo model

var User = require('./app/models/user'); // get our User model



// ROUTES =========================================================================================



app.use(require('./app/controllers/routes'));




// END OF ROUTES ============================================================================================================================================================================================================================



// listen (start app with node server.js) ======================================

app.listen(process.env.PORT || 8080); 
console.log("App listening on port 8080");


