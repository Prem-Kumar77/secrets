import dotenv from "dotenv";
import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser"
import mongoose from "mongoose";
import { User } from "./models/user.js";
import md5 from "md5";
import bcrypt from "bcrypt"

dotenv.config();
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs")

mongoose.connect("mongodb://localhost:27017/userDB");

const saltRounds = 10;

app.get("/", function (req, res) {
  res.render("home")
})

app.get("/login", function (req, res) {
  res.render("login")
})

app.get("/register", function (req, res) {
  res.render("register")
})

app.post("/register", async function (req, res) {
  bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
    const user = new User({
      email: req.body.username,
      password: hash
    })
    try {
      user.save();
      res.render("secrets")
    } catch (err) {
      res.send("please Enter your Email and Password");
    }
  })
});


app.post("/login", async function (req, res) {
  let foundUser = await User.findOne({ email: req.body.username })
  if (foundUser) {
    bcrypt.compare(req.body.password, foundUser.password, function (err, result) {
      if(result==true){
        res.render("secrets");
      }
    });
    
  }

})

app.listen(3000, function () {
  console.log("sever is started on port 3000");
})