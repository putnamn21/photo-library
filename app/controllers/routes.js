var express = require('express');
var app = express();
var multer = require('multer');
var upload = multer({ dest: './public/img/',
                        limits: {files:1}
                        });
   
// User Authentification Routes +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

      // get an instance of the router for api routes
      var authRoutes = express.Router(); 


      // Login Route, does not need JWT

      authRoutes.post('/', function(req, res) {
       
        
        // find the user
        User.findOne({
          name: req.body.userName
        }, function(err, user) {

          if (err) throw err;

          if (!user) {
            res.json({ success: false, message: 'User not found.' });
          } else if (user) {

            // check if password matches
            if (user.password != req.body.password) {
              res.json({ success: false, message: 'Wrong password.' });
            } else {

              // if user is found and password is right
              // create a token
              var tokenBody = {userName: user.name,
                               userId: user._id}

              var token = jwt.sign(tokenBody, app.get('superSecret'), {
                expiresInMinutes: 1440 // expires in 24 hours
              });

              // return the information including token as JSON
              res.json({
                success: true,
                user: tokenBody,
                token: token
              });
            }   
          }
        });
      });


      //Register new user Route, does not need JWT **************

      authRoutes.post('/newUser', function(req, res) {

        // find the user
        User.create({
          name: req.body.name,
          password: req.body.password,
          admin: false
        }, function(err, user) {

          if (err) throw err;

              // create a token
              var tokenBody = {userName: user.name,
                               userId: user._id}

              var token = jwt.sign(tokenBody, app.get('superSecret'), {
                expiresInMinutes: 1440 // expires in 24 hours
              });

              // return the information including token as JSON
              res.json({
                success: true,
                user: tokenBody,
                token: token
              }); 
          });
        });


      // apply the routes to our application with the prefix /login
      app.use('/login', authRoutes);

//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++




// API Routes ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

    var apiRouter = express.Router();

    // route to get all photoes, does not need to be an authenticated user

    apiRouter.get('/photos', function(req, res) {

        // use mongoose to get all todos in the database
        Photo.find(function(err, data) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(data); // return all todos in JSON format
        });
    });



    // route middleware to only grant access to valid tokens

    apiRouter.use(function(req, res, next) {

      // check header or url parameters or post parameters for token
      var token = req.headers.authorization;
      
      // decode token
      if (token) {

        // verifies secret and checks exp
        jwt.verify(token, app.get('superSecret'), function(err, decoded) {      
          if (err) {
            return res.json({ success: false, message: 'Failed to authenticate token.' });    
          } else {
            // if everything is good, save to request for use in other routes
            req.decodedUser = decoded;    
            next();
          }
        });

      } else {

        // if there is no token
        // return an error
        return res.status(403).send({ 
            success: false, 
            message: 'No token provided.' 
        });

      }
    });


    

    // delete a photo, requires valid JWT

    apiRouter.delete('/photos/:photo_id/:photo_fileName', function(req, res) {
        Photo.remove({
            _id : req.params.photo_id
        }, function(err, photo) {
            if (err)
                res.send(err);
          fs.unlink('./public/img/'+req.params.photo_fileName, function(err){
            if (err) throw err;
            console.log('successfully deleted '+req.params.photo_fileName);
          });

            // get and return all the photos
            Photo.find(function(err, data) {
                if (err)
                    res.send(err)
                res.json(data);
            });
        });
    });


    // upload a photo, requires valid JWT

    apiRouter.post('/upload', upload.single('file'), function (req, res, err) {

      var coordinates = [parseFloat(req.body.lat), parseFloat(req.body.long)];
      
      console.log(req.file);

      Photo.create({
              coordinates : coordinates,
              location : req.body.location,
              camera : req.body.camera,
              fileName: req.file.filename, 
            }, function(err, photo) {
                if (err){res.send(err);}
                res.json(photo);
          });
    });


    // all routes above need the prefix /api
    app.use('/api', apiRouter);

//END API Routes ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++


// if any of the above routes aren't triggered with a get request, respond with the home page
app.get('*', function(req, res) {
    res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
});

module.exports = app;