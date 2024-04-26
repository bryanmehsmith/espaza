const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const fs = require('fs');
const passport = require('./passport-config');
require('dotenv').config();

const app = express();

// Middleware
if (!fs.existsSync('./db')){
  fs.mkdirSync('./db');
}

app.use(session({
  store: new SQLiteStore({
    dir: './db',
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
  if (req.session && req.session.passport && req.session.passport.user) {
    req.user = req.session.passport.user;
  }
  next();
}

app.use(setUser);
app.use(express.json());
<<<<<<< HEAD

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
app.get('/internal-home', (req, res) => {res.send(addHF(path.join(dir, 'views', 'internal','internal-home.html')));});
app.get('/stock-management', (req, res) => {res.send(addHF(path.join(dir, 'views', 'internal','stock-management.html')));});

=======
app.use(express.static('.'));
>>>>>>> d1c01817ffae7a134da701ff081011dc40b12ac7

// API routes
app.use('/auth', require('./api/auth'));
app.use('/users', setUser, require('./api/users'));

// Routes
function addHF(filePath) {
  const head = fs.readFileSync('./views/head.html', 'utf8');
  const header = fs.readFileSync('./views/header.html', 'utf8');
  const footer = fs.readFileSync('./views/footer.html', 'utf8');
  const originalContent = fs.readFileSync(filePath, 'utf8');
  return head + header + originalContent + footer;
}

app.get('/', setUser, (req, res) => {res.send(addHF('./views/index.html'));});
// Admin Routes
const { ensureAdmin } = require('./api/users');
app.get('/internal/user-management', setUser, ensureAdmin, (req, res) => {res.send(addHF('./views/internal/user-management.html'));});

port = process.env.PORT || 8080
app.listen(port, () => {
    console.log('Server is running on port ' + port);
});

module.exports = app;