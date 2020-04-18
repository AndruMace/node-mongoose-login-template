if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')
const mongoose = require("mongoose");
const User = require("./models/User");

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://AMace:AndruMace98@techbox-ntoi8.mongodb.net/test?retryWrites=true&w=majority`,
      options
    );
    console.log("DB CONNECTED");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

connectDB();

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  // email => users.find(user => user.email === email),
  // id => users.find(user => user.id === id)
  email => User.findOne({ email: email }),
  async id => await User.findOne({ _id: id })
)

const users = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, async (req, res) => {
  try {
    user = await req.user;
    res.render('index.ejs', { user: user })
  } catch (err) {
    err = `Could not fetch user. Error::: ${err}`
    res.render('index.ejs', { user: err })
  }
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    // users.push({
    //   id: Date.now().toString(),
    //   name: req.body.name,
    //   email: req.body.email,
    //   password: hashedPassword
    // })
    User.create({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    }, (err, user) => {
      if (err) { return console.log(err) }
      console.log(`Created ${user}`)
    })
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.listen(3000)