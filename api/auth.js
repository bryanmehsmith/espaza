const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const router = express.Router();
router.use(cookieParser());

const usersFilePath = path.join(__dirname, '../db/users.json');
if (!fs.existsSync(usersFilePath)) {
    fs.writeFileSync(usersFilePath, JSON.stringify([]));
}
const users = require(usersFilePath);

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, cb) {
    let user = users.find(user => user.id === profile.id);
    console.log(profile);
    let role = profile.id == 118139987500403906696 ? 'Admin' : 'Shopper';
    if (!user) {
      user = {
        provider: profile.provider,
        id: profile.id,
        name: profile.displayName,
        role: role };
      users.push(user);
    } else {
      user.provider = profile.provider;
      user.name = profile.displayName;
      user.role = role;
    }
    fs.writeFileSync(usersFilePath, JSON.stringify(users));
    user.accessToken = accessToken;
    return cb(null, user);
  }
));

router.get('/google',
  passport.authenticate('google', { scope: ['profile'] }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.cookie('access_token', req.user.accessToken, { httpOnly: true, sameSite: 'strict' });
    res.redirect('/');
  });

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    const user = users.find(user => user.id === id);
    done(null, user);
  });

router.get('/isLoggedIn', (req, res) => {
    if (req.cookies.access_token) {
      res.json({ loggedIn: true });
    } else {
      res.json({ loggedIn: false });
    }
  });

router.get('/logout', (req, res) => {
    res.clearCookie('access_token');
    res.json({ loggedOut: true });
  });

module.exports = router;