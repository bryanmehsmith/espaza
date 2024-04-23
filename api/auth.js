const passport = require('passport');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cookieParser = require('cookie-parser');
const fs = require('fs');
require('dotenv').config();

const router = express.Router();
router.use(cookieParser());

if (!fs.existsSync('./db')){
    fs.mkdirSync('./db');
}

const db = new sqlite3.Database('./db/users.db');
db.run("CREATE TABLE IF NOT EXISTS users (id TEXT, googleId TEXT, name TEXT, role TEXT)");

router.get('/google',
  passport.authenticate('google', { scope: ['profile'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    db.get("SELECT * FROM users WHERE googleId = ?", req.user.googleId, function(err, user) {
      if (user) {
        res.cookie('access_token', user.accessToken, { httpOnly: true, sameSite: 'strict' });
        res.redirect('/');
      } else {
        res.redirect('/login');
      }
    });
  });

router.get('/isLoggedIn', (req, res) => {
  res.set('X-Robots-Tag', 'noindex');
  if (req.cookies.access_token) {
    res.json({ loggedIn: true });
  } else {
    res.json({ loggedIn: false });
  }
});

router.get('/logout', (req, res) => {
  res.set('X-Robots-Tag', 'noindex');
  res.clearCookie('access_token');
  res.json({ loggedOut: true });
  req.session.destroy();
});

module.exports = router;