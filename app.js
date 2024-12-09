import dotenv from "dotenv";
import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser"
import mongoose from "mongoose";
import { User } from "./models/user.js";
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose"
//import md5 from "md5";
//import bcrypt from "bcrypt"

dotenv.config();
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(session({
  secret:process.env.SECRET,
  resave : true,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// const saltRounds = 10;

app.get("/", function (req, res) {
  res.render("home")
})

app.get("/login", function (req, res) {
  res.render("login")
})

app.get("/register", function (req, res) {
  res.render("register")
})

app.get("/secrets",function(req,res){
  if(req.isAuthenticated()) {
    res.render("secrets")
  } else {
    res.redirect("/login")
  }
})

app.post("/register", async function (req, res){
  User.register({username: req.body.username},req.body.password, function(err, user){
    if (err) { 
      console.log(err)
      res.redirect("/register")
     } else {
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets")
      })
     }
})
});


app.post("/login", async function (req, res){
  const user = new User ({
    username : req.body.username,
    password : req.body.password
  });
  req.login(user,function(err){
    if(err){
      console.log(err);
    } else {
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets")
      });
    }
  })
})

app.get("/logout",function(req,res){
  req.logout(function(err) {
    if (err) { return next(err);
    }
    res.redirect('/');
  });
})

app.listen(3000, function () {
  console.log("sever is started on port 3000");
})