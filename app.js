import dotenv from "dotenv";
import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser"
import mongoose from "mongoose";
import { User } from "./models/user.js";
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose"
import GoogleStrategy from "passport-google-oauth20"
import FacebookStrategy from "passport-facebook"

//import md5 from "md5";
//import bcrypt from "bcrypt"

dotenv.config();
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(session({
  secret: process.env.SECRET,
  resave: true,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

passport.use(User.createStrategy());
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

// const saltRounds = 10;
passport.use(new GoogleStrategy.Strategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: "http://localhost:3000/auth/google/secrets",
  userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
},
  function (accessToken, refreshToken, profile, cb) {
    console.log(profile)
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));

passport.use(new FacebookStrategy({
  clientID: process.env.APP_ID,
  clientSecret: process.env.APP_SECRET,
  callbackURL: "http://localhost:3000/auth/facebook/secrets",
  profileFields: ['id', 'displayName', 'photos', 'email']
},
function(accessToken, refreshToken, profile, cb) {
  console.log(profile)
  User.findOrCreate({facebookId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}
));


app.get("/", function (req, res) {
  res.render("home")
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect secrets.
    res.redirect('/secrets');
});

app.get('/auth/facebook',
passport.authenticate('facebook'));

app.get('/auth/facebook/secrets',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
});

app.get("/login", function (req, res) {
  res.render("login")
})

app.get("/register", function (req, res) {
  res.render("register")
})

app.get("/secrets",async function (req, res) {
  let foundUsers = await User.find({secret : {$ne:null}})
  console.log(foundUsers)
  if (req.isAuthenticated()) {
    res.render("secrets",{usersWithSecret : foundUsers})
  } else {
    res.redirect("/login")
  }
  

})

app.get("/submit",function(req,res){
  if (req.isAuthenticated()) {
    res.render("submit")
  } else {
    res.redirect("/login")
  }
})

app.post("/submit",async function(req,res){
  let foundUser = await User.findById(req.user.id);
  if(foundUser) {
    foundUser.secret = req.body.secret
    foundUser.save()
    res.redirect("secrets")
  }
})


app.post("/register", async function (req, res) {
  User.register({ username: req.body.username }, req.body.password, function (err, user) {
    if (err) {
      console.log(err)
      res.redirect("/register")
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets")
      })
    }
  })
});


app.post("/login", async function (req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });
  req.login(user, function (err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/secrets")
      });
    }
  })
})

app.get("/logout", function (req, res) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
})

app.listen(3000, function () {
  console.log("sever is started on port 3000");
})