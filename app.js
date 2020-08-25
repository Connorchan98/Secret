require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
var validate = require('mongoose-validator');

const app = express();

var validateEmail = function(email) {
    var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return re.test(email)
};

console.log(process.env.SECRET);

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.set('useCreateIndex', true);

mongoose.connect("mongodb://localhost:27017/userDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
  email:{
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
  password:{
    type: String,
    trim: true,
    uppercase: true,
    required: true,
    maxlength: 8
  }
});


userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]});

const User = new mongoose.model("User", userSchema);

app.route("/")
.get(function(req, res){
  res.render("home");
})
.post(function(req, res){
  console.log(1);
});

app.route("/login")
.get(function(req, res){
  res.render("login");
})
.post(function(req, res){
  const userEmail = req.body.username;
  const password = req.body.password;
  User.findOne({email: userEmail}, function(err, foundUser){
    if(err){
      console.log(err);
    }else{
      if(foundUser){
        console.log(foundUser);
        console.log(foundUser.password);
        if(foundUser.password === password){
          res.render("secrets");
        }
      }
    }
  })
});

app.route("/register")
.get(function(req, res){
  res.render("register");
})
.post(function(req, res){

console.log(req.body.username);

    const newUser = new User({
      email: req.body.username,
      password: req.body.password
    });

console.log(newUser);

    newUser.save(function(err){
      if(err){
        console.log(err);
      }else{
        console.log("Secrets successfully saved!");
      }
    });
});


app.listen(3000, function(){
  console.log("Server started on port 3000.");
});
