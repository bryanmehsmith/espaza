const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(express.json());

dir = __dirname || '/home/site/wwwroot';

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

// API routes
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

const auth = require('./api/auth');
app.use('/auth', auth);

port = process.env.PORT || 8080
app.listen(port, () => {
    console.log('Server is running on port ' + port);
});

module.exports = app;