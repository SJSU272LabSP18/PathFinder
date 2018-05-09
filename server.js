// See LICENSE.MD for license information.

'use strict';

/********************************
Dependencies
********************************/
var express = require('express'),// server middleware
    mongoose = require('mongoose'),// MongoDB connection library
    bodyParser = require('body-parser'),// parse HTTP requests
    passport = require('passport'),// Authentication framework
    LocalStrategy = require('passport-local').Strategy,
    expressValidator = require('express-validator'), // validation tool for processing user input
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    MongoStore = require('connect-mongo/es5')(session), // store sessions in MongoDB for persistence
    bcrypt = require('bcrypt'), // middleware to encrypt/decrypt passwords
    sessionDB,

    cfenv = require('cfenv'),// Cloud Foundry Environment Variables
    appEnv = cfenv.getAppEnv(),// Grab environment variables

    User = require('./server/models/user.model'),
    Jobseeker = require('./server/models/jobseeker.model'),
    Jobposter = require('./server/models/jobposter.model')


/********************************
Local Environment Variables
 ********************************/
if(appEnv.isLocal){
    require('dotenv').load();// Loads .env file into environment
}

/********************************
 MongoDB Connection
 ********************************/

//Detects environment and connects to appropriate DB
if(appEnv.isLocal){
    mongoose.connect(process.env.LOCAL_MONGODB_URL);
    sessionDB = process.env.LOCAL_MONGODB_URL;
    console.log('Your MongoDB is running at ' + process.env.LOCAL_MONGODB_URL);
}
// Connect to MongoDB Service on Bluemix
else if(!appEnv.isLocal) {
    var mongoDbUrl, mongoDbOptions = {};
    var mongoDbCredentials = appEnv.services["compose-for-mongodb"][0].credentials;
    var ca = [new Buffer(mongoDbCredentials.ca_certificate_base64, 'base64')];
    mongoDbUrl = mongoDbCredentials.uri;
    mongoDbOptions = {
      mongos: {
        ssl: true,
        sslValidate: true,
        sslCA: ca,
        poolSize: 1,
        reconnectTries: 1
      }
    };

    console.log("Your MongoDB is running at ", mongoDbUrl);
    mongoose.connect(mongoDbUrl, mongoDbOptions); // connect to our database
    sessionDB = mongoDbUrl;
}
else{
    console.log('Unable to connect to MongoDB.');
}




/********************************
Express Settings
********************************/
var app = express();
app.enable('trust proxy');
// Use SSL connection provided by Bluemix. No setup required besides redirecting all HTTP requests to HTTPS
if (!appEnv.isLocal) {
    app.use(function (req, res, next) {
        if (req.secure) // returns true is protocol = https
            next();
        else
            res.redirect('https://' + req.headers.host + req.url);
    });
}
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressValidator()); // must go directly after bodyParser
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'this_is_a_default_session_secret_in_case_one_is_not_defined',
    resave: true,
    store: new MongoStore({
        url: sessionDB,
        autoReconnect: true
    }),
    saveUninitialized : false,
    cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());



/********************************
 Passport Middleware Configuration
 ********************************/
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function (err, user) {
        done(err, user);
    });
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.findOne({ username: username }, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            }
            // validatePassword method defined in user.model.js
            if (!user.validatePassword(password, user.password)) {
                return done(null, false, { message: 'Incorrect password.' });
            }
            return done(null, user);
        });
    }
));

/********************************
 Routing
 ********************************/

// Home
app.get('/', function (req, res){
    res.sendfile('index.html');
});

// Account login
app.post('/account/login', function(req,res){

    // Validation prior to checking DB. Front end validation exists, but this functions as a fail-safe
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();

    var errors = req.validationErrors(); // returns an object with results of validation check
    if (errors) {
        res.status(401).send('Username or password was left empty. Please complete both fields and re-submit.');
        return;
    }

    // Create session if username exists and password is correct
    passport.authenticate('local', function(err, user) {
        if (err) { return next(err); }
        if (!user) { return res.status(401).send('User not found. Please check your entry and try again.'); }
        req.logIn(user, function(err) { // creates session
            if (err) { return res.status(500).send('Error saving session.'); }
            var userInfo = {
                username: user.username,
                firstname : user.firstname,
                lastname : user.lastname,
                email : user.email,
                role: user.role
            };
            return res.json(userInfo);
        });
    })(req, res);

});

// Account creation
app.post('/account/create', function(req,res){

    // 1. Input validation. Front end validation exists, but this functions as a fail-safe
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('firstname', 'First Name is required').notEmpty();
    req.checkBody('lastname',  'Last Name is required').notEmpty();
    req.checkBody('role', 'Role is required, must be a Jobseeker or Jobposter').notEmpty();
    req.checkBody('email', 'Email is required and must be in a valid form').notEmpty().isEmail();

    var errors = req.validationErrors(); // returns an array with results of validation check
    if (errors) {
        res.status(400).send(errors);
        return;
    }

    // 2. Hash user's password for safe-keeping in DB
    var salt = bcrypt.genSaltSync(10),
        hash = bcrypt.hashSync(req.body.password, salt);

    // 3. Create new object that store's new user data
    var user = new User({
        username: req.body.username,
        password: hash,
        email: req.body.email,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        role: req.body.role
    });

    // 4. Store the data in MongoDB
    User.findOne({ username: req.body.username }, function(err, existingUser) {
        if (existingUser) {
            return res.status(400).send('That username already exists. Please try a different username.');
        }
        user.save(function(err) {
            if (err) {
                console.log(err);
                res.status(500).send('Error saving new account (database error). Please try again.');
                return;
            }
            res.status(200).send('Account created! Please login with your new account.');
        });
    });

});

//Account deletion
app.post('/account/delete', authorizeRequest, function(req, res){

    User.remove({ username: req.body.username }, function(err) {
        if (err) {
            console.log(err);
            res.status(500).send('Error deleting account.');
            return;
        }
        req.session.destroy(function(err) {
            if(err){
                res.status(500).send('Error deleting account.');
                console.log("Error deleting session: " + err);
                return;
            }
            res.status(200).send('Account successfully deleted.');
        });
    });

});

// Account update
app.post('/account/update', authorizeRequest, function(req,res){

    // 1. Input validation. Front end validation exists, but this functions as a fail-safe
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('firstname', 'First Name is required').notEmpty();
    req.checkBody('lastname', 'Last Name is required').notEmpty();

    req.checkBody('email', 'Email is required and must be in a valid form').notEmpty().isEmail();

    var errors = req.validationErrors(); // returns an object with results of validation check
    if (errors) {
        res.status(400).send(errors);
        return;
    }

    // 2. Hash user's password for safe-keeping in DB
    var salt = bcrypt.genSaltSync(10),
        hash = bcrypt.hashSync(req.body.password, salt);

    // 3. Store updated data in MongoDB
    User.findOne({ username: req.body.username }, function(err, user) {
        if (err) {
            console.log(err);
            return res.status(400).send('Error updating account.');
        }
        user.username = req.body.username;
        user.password = hash;
        user.email = req.body.email;
        user.firstname = req.body.firstname;
        user.lastname = req.body.lastname;

        user.save(function(err) {
            if (err) {
                console.log(err);
                res.status(500).send('Error updating account.');
                return;
            }
            res.status(200).send('Account updated.');
        });
    });

});

// Account logout
app.get('/account/logout', function(req,res){

    // Destroys user's session
    if (!req.user)
        res.status(400).send('User not logged in.');
    else {
        req.session.destroy(function(err) {
            if(err){
                res.status(500).send('Sorry. Server error in logout process.');
                console.log("Error destroying session: " + err);
                return;
            }
            res.status(200).send('Success logging user out!');
        });
    }

});

// EXPLORE JOBS STUFFS


// Get All Jobs for non logged in user
app.get('/explore/jobs', function(req,res){


    console.log("Persona: " + req.query.persona);
    console.log("Industry: " + req.query.industry);
    Jobposter.find({ industry: req.query.industry, persona: req.query.persona }, function(err, jobs) {
        if (err) {
            console.log(err);
            return res.status(400).send('Error finding jobs.');
        }
        return res.json(jobs);
    });
});

// Get Specific Jobsfor non logged in user
app.get('/explore/job/view', function(req,res){

    Jobposter.findOne({ _id: req.query.job_id}, function(err, job) {
        if (err) {
            console.log(err);
            return res.status(400).send('Error finding job.');
        }
        return res.json(job);
    });
});

// JOB SEEKER STUFFS

// Persona Update
app.post('/quiz/persona', authorizeRequest, function(req,res){

    // 1. Input validation. Front end validation exists, but this functions as a fail-safe
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('firstname', 'Email is required').notEmpty();
    req.checkBody('lastname', 'Email is required').notEmpty();
    req.checkBody('persona', 'Persona is required').notEmpty();

    var errors = req.validationErrors(); // returns an object with results of validation check
    if (errors) {
        res.status(400).send(errors);
        return;
    }

    // 2. Store updated data in MongoDB
    Jobseeker.findOne({ username: req.body.username }, function(err, user) {
        if (err) {
            console.log(err);
            return res.status(400).send('Error updating account.');
        }

        if (user == null){
          // Create new object that store's new user data
          var user = new Jobseeker({
              username: req.body.username,
              email: req.body.email,
              firstname: req.body.firstname,
              lastname: req.body.lastname,
              persona: req.body.persona
          });
        }

        user.persona = req.body.persona;

        user.save(function(err) {
            if (err) {
                console.log(err);
                res.status(500).send('Error updating account.');
                return;
            }
            res.status(200).send('Persona updated!');
        });
    });

});

// Get Persona
app.get('/quiz/persona', authorizeRequest, function(req,res){

    // 1. Get data in MongoDB
    Jobseeker.findOne({ username: req.query.username}, function(err, user) {

        if (user == null){
          return res.json("intern");
        }

        return res.json(user.persona);
    });

});

// Industry Update
app.post('/quiz/industry', authorizeRequest, function(req,res){

    // 1. Input validation. Front end validation exists, but this functions as a fail-safe
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('industry', 'Industry is required').notEmpty();

    var errors = req.validationErrors(); // returns an object with results of validation check
    if (errors) {
        res.status(400).send(errors);
        return;
    }

    // 2. Store updated data in MongoDB
    Jobseeker.findOne({ username: req.body.username }, function(err, user) {
        if (err) {
            console.log(err);
            return res.status(400).send('Error updating account.');
        }
        user.industry = req.body.industry;

        user.save(function(err) {
            if (err) {
                console.log(err);
                res.status(500).send('Error updating account.');
                return;
            }
            res.status(200).send('Industry updated!');
        });
    });

});

// Get Industry
app.get('/quiz/industry', authorizeRequest, function(req,res){

    // 1. Get data in MongoDB
    Jobseeker.findOne({ username: req.query.username}, function(err, user) {

        if (user == null){
          return;
        }

        return res.json(user.industry);
    });

});

// Personality Update
app.post('/quiz/personality', authorizeRequest, function(req,res){

    // 1. Input validation. Front end validation exists, but this functions as a fail-safe
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('q1', 'Q1 is required').notEmpty();
    req.checkBody('q2', 'Q2 is required').notEmpty();
    req.checkBody('q3', 'Q3 is required').notEmpty();
    req.checkBody('q4', 'Q4 is required').notEmpty();
    req.checkBody('q5', 'Q5 is required').notEmpty();
    req.checkBody('q6', 'Q6 is required').notEmpty();

    var errors = req.validationErrors(); // returns an object with results of validation check
    if (errors) {
        res.status(400).send(errors);
        return;
    }

    // 2. Store updated data in MongoDB
    Jobseeker.findOne({ username: req.body.username }, function(err, user) {
        if (err) {
            console.log(err);
            return res.status(400).send('Error updating account.');
        }

        user.username = req.body.username;
        user.q1 = req.body.q1;
        user.q2 = req.body.q2;
        user.q3 = req.body.q3;
        user.q4 = req.body.q4;
        user.q5 = req.body.q5;
        user.q6 = req.body.q6;

        // TODO:
        // Put logic here to get watson insights, need to update model to store result
        //

        user.save(function(err) {
            if (err) {
                console.log(err);
                res.status(500).send('Error updating account.');
                return;
            }
            res.status(200).send('Personality questions updated!');
        });
    });

});

// Get Personality
app.get('/quiz/personality', authorizeRequest, function(req,res){

    // 1. Get data in MongoDB
    Jobseeker.findOne({ username: req.query.username}, function(err, user) {

        if (user == null){
          return res.json(undefined);
        }

        return res.json({
          'q1': user.q1,
          'q2': user.q2,
          'q3': user.q3,
          'q4': user.q4,
          'q5': user.q5,
          'q6': user.q6}
        );
    });

});


// Perk Update
app.post('/quiz/perks', authorizeRequest, function(req,res){

    // 1. Input validation. Front end validation exists, but this functions as a fail-safe
    req.checkBody('username', 'Username is required').notEmpty();

    var errors = req.validationErrors(); // returns an object with results of validation check
    if (errors) {
        res.status(400).send(errors);
        return;
    }

    // 2. Store updated data in MongoDB
    Jobseeker.findOne({ username: req.body.username }, function(err, user) {
        if (err) {
            console.log(err);
            return res.status(400).send('Error updating account.');
        }

        user.username = req.body.username;
        user.perks = req.body.perks;

        user.save(function(err) {
            if (err) {
                console.log(err);
                res.status(500).send('Error updating account.');
                return;
            }
            res.status(200).send('Personality questions updated!');
        });
    });

});

// Get Personality
app.get('/quiz/perks', authorizeRequest, function(req,res){


    console.log("Username: " + req.query.username);
    console.log("Persona: " + req.query.persona);
    console.log("Industry: " + req.query.industry);

    // 1. Get data in MongoDB
    Promise.all(
      [
        Jobseeker.findOne({ username: req.query.username}, {perks: 1}),
        Jobposter.find({persona:req.query.persona, industry: req.query.industry}, {perks:1})
      ]
    ).then( ([ jobseeker_perks, jobposts ]) => {

      // Get list of perks from jobseeker
      console.log(jobseeker_perks);

      // Get list of perks from Job Posts
      var unique_perks = {};

      for (var job in jobposts){
        var perks = jobposts[job].perks;
        for (var i=0; i < perks.length; i++){
          unique_perks[perks[i].value] = perks[i].value;
        }
      }

      var finalperks = [];
      for ( var key in unique_perks )
          finalperks.push({ id: unique_perks[key], perk: unique_perks[key], checked: false} );

      console.log("Final Perks");
      console.log(finalperks);

      // Intersect perks from jobs and user
      var perks = jobseeker_perks.perks;
      for ( var i = 0; i < perks.length; i++){
        console.log(perks[i])

        for (var j = 0; j < finalperks.length; j++){
          if (finalperks[j].perk == perks[i].perk){
            console.log("FOUND MATCH");
            finalperks[j].checked = perks[i].checked;
          }
        }
      }

      return res.json(finalperks);

    });

});


// Resume Update
app.post('/quiz/resume', authorizeRequest, function(req,res){

    // 1. Input validation. Front end validation exists, but this functions as a fail-safe
    req.checkBody('username', 'Username is required').notEmpty();

    var errors = req.validationErrors(); // returns an object with results of validation check
    if (errors) {
        res.status(400).send(errors);
        return;
    }

    // 2. Store updated data in MongoDB
    Jobseeker.findOne({ username: req.body.username }, function(err, user) {
        if (err) {
            console.log(err);
            return res.status(400).send('Error updating account.');
        }

        user.username = req.body.username;
        user.experience = req.body.experience;
        user.education = req.body.education;
        user.skills = req.body.skills;

        user.save(function(err) {
            if (err) {
                console.log(err);
                res.status(500).send('Error updating account.');
                return;
            }
            res.status(200).send('Personality questions updated!');
        });
    });

});

// Get Resume
app.get('/quiz/resume', authorizeRequest, function(req,res){

    // 1. Get data in MongoDB
    Jobseeker.findOne({ username: req.query.username}, function(err, user) {

        if (user == null){
          return res.json(undefined);
        }

        return res.json({
          'experience': user.experience,
          'education': user.education,
          'skills': user.skills}
        );
    });

});

// Get Jobs
app.get('/jobseeker/jobs', authorizeRequest, function(req,res){


    console.log("Username: " + req.query.username);
    // 1. Get data in MongoDB
    Promise.all(
      [
        Jobseeker.findOne({ username: req.query.username}),
      ]
    ).then( ([ jobseeker]) => {

      // Get list of jobs in same industry and persona

      console.log("Looking for jobs for " + jobseeker.industry + " " + jobseeker.persona);
      Jobposter.find({ industry: jobseeker.industry, persona:jobseeker.persona }, function(err, jobs) {
          if (err) {
              console.log(err);
              return res.status(400).send('Error finding jobs.');
          }

          // TODO:
          // Here we have a list of jobs and the jobseeker
          // Put the logic to rank the jobseeker and jobposts
          //
          console.log(jobs);
          return res.json(jobs);

      });
    });
});

// Get a specific jobs
app.get('/jobseeker/job/view', authorizeRequest, function(req,res){


    console.log("Username: " + req.query.username);
    console.log("Job ID: " + req.query.job_id)
    // 1. Get data in MongoDB
    Promise.all(
      [
        Jobseeker.findOne({ username: req.query.username}),
        Jobposter.findOne({ _id: req.query.job_id})
      ]
    ).then( ([jobseeker, job]) => {

      console.log("FOUND JOB");
      console.log(job);

      console.log("FOUND JOBSEEKER");
      console.log(jobseeker);


      // TODO:
      // Here we have the jobseeker and job information
      // Put the logic for finding the skill gaps here and trainings

      var skill_gap = [];
      // Get Skills Needed
      for(var i = 0; i < job.skills.length; i++){
        skill_gap.push({'skill': job.skills[i].value, 'trainings': []});
      }

      // Remove Skills that Jobseeker already has
      for(var i  = 0; i < jobseeker.skills.length; i++){
        for(var j = 0; j < skill_gap.length; j++){
          if (jobseeker.skills[i].value == skill_gap[j]){
            skill_gap.splice(j,1);
          }
        }
      }

      // Iterate through skill gaps, execute rest call to get google cse results
      job.skill_gap = skill_gap;
      console.log("Skill Gap");
      console.log(job.skill_gap);

      return res.json(job);
    });
});


// JOB POSTER STUFFS

// Post Job
app.post('/post/job', authorizeRequest, function(req,res){

    // 1. Input validation. Front end validation exists, but this functions as a fail-safe
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('company', 'Company is required').notEmpty();
    req.checkBody('summary', 'Summary is required').notEmpty();
    req.checkBody('city', 'City is required').notEmpty();
    req.checkBody('state', 'State is required').notEmpty();
    req.checkBody('persona', 'Persona is required').notEmpty();
    req.checkBody('industry', 'Industry is required').notEmpty();

    req.checkBody('emotionalSlider', 'emotionalSlider is required').notEmpty();
    req.checkBody('extrovertSlider', 'extrovertSlider is required').notEmpty();
    req.checkBody('unplannedSlider', 'unplannedSlider is required').notEmpty();
    req.checkBody('orgSlider', 'orgSlider is required').notEmpty();
    req.checkBody('growthSlider', 'growthSlider is required').notEmpty();
    req.checkBody('challengeSlider', 'challengeSlider is required').notEmpty();
    req.checkBody('noveltySlider', 'noveltySlider is required').notEmpty();
    req.checkBody('helpSlider', 'helpSlider is required').notEmpty();


    var errors = req.validationErrors(); // returns an object with results of validation check
    if (errors) {
        res.status(400).send(errors);
        return;
    }
    // 2. Create new object that store's new user data
    var jobpost = new Jobposter({
        username: req.body.username,
        email: req.body.email,
        title: req.body.title,
        company: req.body.company,
        logourl: req.body.logourl,
        summary: req.body.summary,
        description: req.body.description,
        city: req.body.city,
        state: req.body.state,
        persona: req.body.persona,
        industry: req.body.industry,
        skills: req.body.skills,
        perks: req.body.perks,
        emotionalSlider: req.body.emotionalSlider,
        extrovertSlider: req.body.extrovertSlider,
        unplannedSlider: req.body.unplannedSlider,
        orgSlider: req.body.orgSlider,
        growthSlider: req.body.growthSlider,
        challengeSlider: req.body.challengeSlider,
        noveltySlider: req.body.noveltySlider,
        helpSlider: req.body.helpSlider
    });

    jobpost.save(function(err) {
        if (err) {
            console.log(err);
            res.status(500).send('Error saving post.');
            return;
        }
        res.status(200).send('Job post saved!');
    });


});

// Get Jobs for jobposter
app.get('/jobposter/jobs', authorizeRequest, function(req,res){


    console.log("Username: " + req.query.username);
    // 1. Get data in MongoDB
    Promise.all(
      [
        Jobposter.find({ username: req.query.username}),
      ]
    ).then( ([jobs]) => {

      return res.json(jobs);

    });
});


app.post('/update/job', authorizeRequest, function(req,res){

    // 1. Input validation. Front end validation exists, but this functions as a fail-safe
    req.checkBody('id', 'id is required').notEmpty();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('company', 'Company is required').notEmpty();
    req.checkBody('summary', 'Summary is required').notEmpty();
    req.checkBody('city', 'City is required').notEmpty();
    req.checkBody('state', 'State is required').notEmpty();
    req.checkBody('persona', 'Persona is required').notEmpty();
    req.checkBody('industry', 'Industry is required').notEmpty();

    req.checkBody('emotionalSlider', 'emotionalSlider is required').notEmpty();
    req.checkBody('extrovertSlider', 'extrovertSlider is required').notEmpty();
    req.checkBody('unplannedSlider', 'unplannedSlider is required').notEmpty();
    req.checkBody('orgSlider', 'orgSlider is required').notEmpty();
    req.checkBody('growthSlider', 'growthSlider is required').notEmpty();
    req.checkBody('challengeSlider', 'challengeSlider is required').notEmpty();
    req.checkBody('noveltySlider', 'noveltySlider is required').notEmpty();
    req.checkBody('helpSlider', 'helpSlider is required').notEmpty();


    var errors = req.validationErrors(); // returns an object with results of validation check
    if (errors) {
        res.status(400).send(errors);
        return;
    }

    // 2. Fetch job in MongoDB and update
    Jobposter.findOne({ _id: req.body.id}, function(err, job) {
        if (err) {
            console.log(err);
            return res.status(400).send('Error updating job.');
        }

        console.log("JOB");
        console.log(job);

        job.title = req.body.title;
        job.company = req.body.company;
        job.logourl = req.body.logourl;
        job.summary = req.body.summary;
        job.description = req.body.description;
        job.city = req.body.city;
        job.state = req.body.state;
        job.persona = req.body.persona;
        job.industry = req.body.industry;
        job.skills = req.body.skills;
        job.perks = req.body.perks;
        job.emotionalSlider = req.body.emotionalSlider;
        job.extrovertSlider = req.body.extrovertSlider;
        job.unplannedSlider = req.body.unplannedSlider;
        job.orgSlider = req.body.orgSlider;
        job.growthSlider = req.body.growthSlider;
        job.challengeSlider = req.body.challengeSlider;
        job.noveltySlider = req.body.noveltySlider;
        job.helpSlider = req.body.helpSlider;

        job.save(function(err) {
            if (err) {
                console.log(err);
                res.status(500).send('Error updating job.');
                return;
            }
            res.status(200).send('Job posting updated!');
        });
    });

});


// Get Candidates for Specific Job Posting
app.get('/jobposter/jobs/candidates', authorizeRequest, function(req,res){

    // 1. Input validation. Front end validation exists, but this functions as a fail-safe
    req.checkQuery('job_id', 'Job ID is required').notEmpty();

    var errors = req.validationErrors(); // returns an object with results of validation check
    if (errors) {
        res.status(400).send(errors);
        return;
    }

    // 2. Get data in MongoDB
    Promise.all(
      [
        Jobposter.findOne({ _id: req.query.job_id})
      ]
    ).then( ([job]) => {

      console.log("Looking for jobseeker for: " + job.persona + " and " + job.industry);
      Jobseeker.find({ industry: job.industry, persona:job.persona }, function(err, jobseekers) {
          if (err) {
              console.log(err);
              return res.status(400).send('Error finding jobseekers');
          }

          //
          //TODO: Here we have jobpost and list of possible jobseeker_jobs
          // Put logic here to rank jobseekers with jobpost
          //
          console.log(jobseekers);
          return res.json(jobseekers);

        });
    });
});


// Get Candidate
app.get('/jobposter/jobs/candidate', authorizeRequest, function(req,res){

    // 1. Input validation. Front end validation exists, but this functions as a fail-safe
    req.checkQuery('candidate_id', 'Candidate ID is required').notEmpty();

    var errors = req.validationErrors(); // returns an object with results of validation check
    if (errors) {
        res.status(400).send(errors);
        return;
    }

    // 2. Get data in MongoDB
    Promise.all(
      [
        Jobseeker.findOne({ _id: req.query.candidate_id})
      ]
    ).then( ([jobseeker]) => {

      console.log(jobseeker);
      return res.json(jobseeker);

    });
});


// Custom middleware to check if user is logged-in
function authorizeRequest(req, res, next) {

    if (req.user) {
        next();
    } else {
        res.status(401).send('Unauthorized. Please login.');
    }
}

// Protected route requiring authorization to access.
app.get('/protected', authorizeRequest, function(req, res){
    res.send("This is a protected route only visible to authenticated users.");
});

/********************************
Ports
********************************/
app.listen(appEnv.port, appEnv.bind, function() {
  console.log("Node server running on " + appEnv.url);
});
