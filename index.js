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
app.use('/auth', require('./api/auth'));
app.use('/users', require('./api/users'));
<<<<<<< HEAD
app.use('/products', require('./api/products'));
app.use('/cart', require('./api/cart'));
app.use('/orders', require('./api/orders'));
app.use('/notifications', require('./api/notifications'));
=======
//app.use('/products', require('./api/products'));

// Shopping routes
const products = require('./api/products'); 
const cart = require('./api/cart'); 
const orders = require('./api/orders'); 
const notifications = require('./api/notifications');

app.use('/products', products);
app.use('/cart', cart);
app.use('/orders', orders);
app.use('/notifications', notifications);
>>>>>>> d5e0b42058731e97261a3a2510026b5ba991b476

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
<<<<<<< HEAD
app.get('/order-details', ensureExists, (req, res) => {res.send(addHF('./views/order-details.html'));});
app.get('/cart', ensureExists, (req, res) => {res.send(addHF('./views/cart.html'));});
app.get('/order', ensureExists, (req, res) => {res.send(addHF('./views/order.html'));});
app.get('/notifications-list', ensureExists, (req, res) => {res.send(addHF('./views/notifications.html'));});
=======
>>>>>>> d5e0b42058731e97261a3a2510026b5ba991b476

// Internal Routes
const { ensureInternal } = require('./api/users');
app.get('/internal', ensureInternal, (req, res) => {res.send(addHF('./views/internal/internal-landing.html'));});

// Stock Management Routes
app.get('/internal/stock-management', ensureInternal, (req, res) => {res.send(addHF('./views/internal/stock-management/stock-management.html'));});
app.get('/internal/stock-management/add-product', ensureInternal, (req, res) => {res.send(addHF('./views/internal/stock-management/add-product.html'));});

// Order Management Routes
app.get('/internal/order-management', ensureInternal, (req, res) => {res.send(addHF('./views/internal/order-management.html'));});
app.get('/internal/order-details', ensureInternal, (req, res) => {res.send(addHF('./views/internal/order-details.html'));});

// Notification Routes
app.get('/internal/notifications', ensureInternal, (req, res) => {res.send(addHF('./views/internal/notifications.html'));});

// Shopping routes
app.get('/internal/cart', /*ensureInternal,*/ (req, res) => {res.send(addHF('./views/internal/cart.html'));});
app.get('/order', /*ensureInternal,*/ (req, res) => {res.send(addHF('./views/order.html'));});

// Admin Routes
const { ensureAdmin } = require('./api/users');

app.get('/internal/user-management', ensureAdmin, (req, res) => {res.send(addHF('./views/internal/user-management.html'));});

port = process.env.PORT || 8080
app.listen(port, () => {
    console.log('Server is running on port ' + port);
});

module.exports = app;