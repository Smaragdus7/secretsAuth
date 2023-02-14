const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express()
const port = 3000

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect('mongodb://127.0.0.1:27017/userDB');
mongoose.set('strictQuery', false);

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const secret = "Thisismylittlesecret";
userSchema.plugin(encrypt, {secret: secret, encryptedFields: ['password']});

const User = new mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.render('home');
})

app.route('/login')
.get((req, res) => {
    res.render('login');
  })
.post((req, res) => {
    const userName = req.body.username;
    const password = req.body.password;

    User.findOne({email: userName}, function(err, foundUser) {
        if(!err) {
            if(foundUser.password === password) {
                res.render('secrets');
            }
            else {
                res.send('Incorrect password!');
            } 
        }
        else {
          res.send(err);
        }  
    });
});

app.route('/register')
.get((req, res) => {
    res.render('register');
})
.post((req, res) => {
    const newUser = new User({
        email:req.body.username,
        password: req.body.password
    });

    newUser.save(function(err){
        if(!err) {
            res.render('secrets');
        }
        else {
            res.send(err);
        }
    })
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
