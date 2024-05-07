const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const fs = require('fs');
const { passport } = require('./api/auth')
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static('.'));

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

// API routes
const auth = require('./api/auth')
app.use('/auth', auth);
app.use('/users', require('./api/users'));

// Shopping routes
const products = require('./api/product'); 
const cart = require('./api/cart'); 
const orders = require('./api/order'); 

app.use('/products', products);
app.use('/cart', cart);
app.use('/orders', orders);

// Routes
function addHF(filePath) {
  const head = fs.readFileSync('./views/head.html', 'utf8');
  const header = fs.readFileSync('./views/header.html', 'utf8');
  const footer = fs.readFileSync('./views/footer.html', 'utf8');
  const originalContent = fs.readFileSync(filePath, 'utf8');
  return head + header + originalContent + footer;
}

// Public Routes
app.get('/', (req, res) => {res.send(addHF('./views/index.html'));})

// Logged in Routes
const { ensureExists } = require('./api/users');

// Internal Routes
const { ensureInternal } = require('./api/users');
app.get('/internal', ensureInternal, (req, res) => {res.send(addHF('./views/internal/internal-landing.html'));});
app.get('/internal/stock-management', ensureInternal, (req, res) => {res.send(addHF('./views/internal/stock-management.html'));});

// Shopping routes
app.get('/internal/cart', /*ensureInternal,*/ (req, res) => {res.send(addHF('./views/internal/cart.html'));});
app.get('/internal/checkout', /*ensureInternal,*/ (req, res) => {res.send(addHF('./views/internal/checkout.html'));});

// Admin Routes
const { ensureAdmin } = require('./api/users');

app.get('/internal/user-management', ensureAdmin, (req, res) => {res.send(addHF('./views/internal/user-management.html'));});

port = process.env.PORT || 8080
app.listen(port, () => {
    console.log('Server is running on port ' + port);
});

module.exports = app;