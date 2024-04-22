const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const path = require('path');
const fs = require('fs');
const passport = require('./passport-config'); 
require('dotenv').config();

dir = __dirname || '/home/site/wwwroot';
const app = express();

// Middleware
db_dir = './db'
if (!fs.existsSync(db_dir)){
  fs.mkdirSync(db_dir);
}

app.use(session({
  store: new SQLiteStore({
    dir: path.join(dir, 'db'),
    db: 'session.db'
  }),
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

function setUser(req, res, next) {
  // console.log(req.session);
  if (req.session && req.session.passport && req.session.passport.user) {
    req.user = req.session.passport.user;
  }
  next();
}

app.use(setUser);

app.use(express.json());

function addHF(filePath) {
    const head = fs.readFileSync(path.join(dir, 'views', 'head.html'), 'utf8');
    const header = fs.readFileSync(path.join(dir, 'views', 'header.html'), 'utf8');
    const footer = fs.readFileSync(path.join(dir, 'views', 'footer.html'), 'utf8');
    const originalContent = fs.readFileSync(filePath, 'utf8');
    return head + header + originalContent + footer;
}

app.use(express.static(path.join(dir)));

// Routes
app.get('/', (req, res) => {res.send(addHF(path.join(dir, 'views', 'index.html')));});
app.get('/login', (req, res) => {res.send(addHF(path.join(dir, 'views', 'login.html')));});
app.get('/user-management', setUser, (req, res) => {res.send(addHF(path.join(dir, 'views', 'internal', 'user-management.html')));});

// API routes

const auth = require('./api/auth');
app.use('/auth', auth);

const users = require('./api/users');
app.use('/users', setUser, users);

port = process.env.PORT || 8080
app.listen(port, () => {
    console.log('Server is running on port ' + port);
});

module.exports = app;