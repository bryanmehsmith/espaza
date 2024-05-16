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
    db: 'espaza.db'
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
app.use('/auth', require('./api/auth'));
app.use('/users', require('./api/users'));
app.use('/products', require('./api/products'));
app.use('/cart', require('./api/cart'));
app.use('/orders', require('./api/orders'));
app.use('/notifications', require('./api/notifications'));

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
app.get('/order-details', ensureExists, (req, res) => {res.send(addHF('./views/order-details.html'));});
app.get('/cart', ensureExists, (req, res) => {res.send(addHF('./views/cart.html'));});
app.get('/order', ensureExists, (req, res) => {res.send(addHF('./views/order.html'));});
app.get('/notifications-list', ensureExists, (req, res) => {res.send(addHF('./views/notifications.html'));});

// Internal Routes
const { ensureInternal } = require('./api/users');
app.get('/internal', ensureInternal, (req, res) => {res.send(addHF('./views/internal/internal-landing.html'));});
app.get('/internal/stock-management', ensureInternal, (req, res) => {res.send(addHF('./views/internal/stock-management/stock-management.html'));});
app.get('/internal/stock-management/add-product', ensureInternal, (req, res) => {res.send(addHF('./views/internal/stock-management/add-product.html'));});
app.get('/internal/order-management', ensureInternal, (req, res) => {res.send(addHF('./views/internal/order-management.html'));});

// Admin Routes
const { ensureAdmin } = require('./api/users');
app.get('/internal/user-management', ensureAdmin, (req, res) => {res.send(addHF('./views/internal/user-management.html'));});

port = process.env.PORT || 8080
app.listen(port, () => {
    console.log('Server is running on port ' + port);
});

module.exports = app;