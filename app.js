require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express()
const port = 3000

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(session({
    secret: 'keyboard duck',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://127.0.0.1:27017/userDB');
mongoose.set('strictQuery', false);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model('User', userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', (req, res) => {
  res.render('home');
})

app.route('/login')
.get((req, res) => {
    res.render('login');
  })
.post((req, res) => {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if(err) {
            console.log(err);
        }
        else {
            passport.authenticate("local")(req, res, function(){
                res.redirect('/secrets');
            });
        }
    })
});

app.get('/logout', function(req, res){
    req.logout(function(err) {
        if (err) { 
            console.log(err);
        }
        else {

        }
        res.redirect('/');
      });
})

app.route('/register')
.get((req, res) => {
    res.render('register');
})
.post((req, res) => {
    User.register({username: req.body.username}, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            res.redirect('/register');
        }
        else {
            passport.authenticate("local")(req, res, function(){
                res.redirect('/secrets');
            });
        }
    });
});

app.route('/secrets')
.get((req, res) => {
    if(req.isAuthenticated()){
        res.render('secrets');
    }
    else {
        res.redirect('/login');
    }
  })
.post((req, res) => {

});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
