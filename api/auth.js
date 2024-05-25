const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const MockStrategy = require('passport-mock-strategy');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const uuid = require('uuid');
require('dotenv').config();

const router = express.Router();
router.use(cookieParser());

/* istanbul ignore next */
if (!fs.existsSync('./db')){fs.mkdirSync('./db');}

const db = new sqlite3.Database('./db/espaza.db');
db.run("CREATE TABLE IF NOT EXISTS users (id TEXT, googleId TEXT, name TEXT, role TEXT)");

/* istanbul ignore next */ /*No tests on these as they are to setup test users for marking*/
db.get("SELECT * FROM users WHERE id = ?", 'shopperId', function(err, user) {
  if (err) throw err;
  if (!user) {
    const newUser = {
      id: 'shopperId',
      googleId: 'shopperGoogleId',
      name: 'Shopper Name',
      role: 'Shopper'
    };
    db.run("INSERT INTO users (id, googleId, name, role) VALUES (?, ?, ?, ?)", newUser.id, newUser.googleId, newUser.name, newUser.role, function(err) {
      if (err) throw err;
    });
  }
});

/* istanbul ignore next */ /*No tests on these as they are to setup test users for marking*/
db.get("SELECT * FROM users WHERE id = ?", 'staffId', function(err, user) {
  if (err) throw err;
  if (!user) {
    const newUser = {
      id: 'staffId',
      googleId: 'staffGoogleId',
      name: 'Staff Name',
      role: 'Staff'
    };
    db.run("INSERT INTO users (id, googleId, name, role) VALUES (?, ?, ?, ?)", newUser.id, newUser.googleId, newUser.name, newUser.role, function(err) {
      if (err) throw err;
    });
  }
});

/* istanbul ignore next */ /*No tests on these as they are to setup test users for marking*/
db.get("SELECT * FROM users WHERE id = ?", 'adminId', function(err, user) {
  if (err) throw err;
  if (!user) {
    const newUser = {
      id: 'adminId',
      googleId: 'adminGoogleId',
      name: 'Admin Name',
      role: 'Admin'
    };
    db.run("INSERT INTO users (id, googleId, name, role) VALUES (?, ?, ?, ?)", newUser.id, newUser.googleId, newUser.name, newUser.role, function(err) {
      if (err) throw err;
    });
  }
});

/* istanbul ignore next */
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.CALLBACK_URL
},
function(accessToken, refreshToken, profile, cb) {
  db.get("SELECT * FROM users WHERE googleId = ?", profile.id, function(err, user) {
    if (err) return cb(err);
    let role = 'Shopper';
    const developers = ['Bryan Smith', 'Gimbiya Sarki', 'Thato Mohajane', 'Yabiso Molefe'];
    if (developers.includes(profile.displayName)) {
      role = 'Admin';
    }
    if (!user) {
      user = {
        provider: profile.provider,
        id: uuid.v4(),
        googleId: profile.id,
        name: profile.displayName,
        role: role };
      db.run("INSERT INTO users (id, googleId, name, role) VALUES (?, ?, ?, ?)", user.id, user.googleId, user.name, user.role, function(err) {
        if (err) return cb(err);
        user.accessToken = accessToken;
        return cb(null, user);
      });
    } else {
      user.provider = profile.provider;
      user.name = profile.displayName;
      user.role = role;
      db.run("UPDATE users SET name = ? WHERE id = ?", user.name, user.id, function(err) {
        if (err) return cb(err);
        user.accessToken = accessToken;
        return cb(null, user);
      });
    }
  });
}
));

/* istanbul ignore next */
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

/* istanbul ignore next */
passport.deserializeUser(async function(id, done) {
  try {
      const user = await new Promise((resolve, reject) => {
          db.get("SELECT * FROM users WHERE id = ?", id, function(err, user) {
              if (err) reject(err);
              resolve(user);
          });
      });
      done(null, user);
  } catch (err) {
      done(err);
  }
});

/* istanbul ignore next */
router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

/* istanbul ignore next */
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  async (req, res) => {
    try {
      const user = await new Promise((resolve, reject) => {
        db.get("SELECT * FROM users WHERE googleId = ?", req.user.googleId, function(err, user) {
          if (err) {
            reject(err);
          } else {
            resolve(user);
          }
        });
      });

      if (user) {
        res.cookie('access_token', user.accessToken, { httpOnly: true, sameSite: 'strict' });
        res.redirect('/');
      } else {
        res.redirect('/');
      }
    } catch (err) {
      res.redirect('/');
    }
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

passport.use(new MockStrategy({
  name: 'bypassShopper',
  user: {
    id: 'shopperId',
    googleId: 'shopperGoogleId',
    name: 'Shopper Name',
    role: 'Shopper'
  }
}));

/* istanbul ignore next */ /*No tests on these as they are to setup test users for marking*/
router.get('/bypassShopper', passport.authenticate('bypassShopper'), (req, res) => {
  res.cookie('access_token', 'fakeShopperId', { httpOnly: true, sameSite: 'strict' });
  res.redirect('/');
});

passport.use(new MockStrategy({
  name: 'bypassStaff',
  user: {
    id: 'staffId',
    googleId: 'staffGoogleId',
    name: 'Staff Name',
    role: 'Staff'
  }
}));

/* istanbul ignore next */ /*No tests on these as they are to setup test users for marking*/
router.get('/bypassStaff', passport.authenticate('bypassStaff'), (req, res) => {
  res.cookie('access_token', 'fakeStaffId', { httpOnly: true, sameSite: 'strict' });
  res.redirect('/');
});

passport.use(new MockStrategy({
  name: 'bypassAdmin',
  user: {
    id: 'adminId',
    googleId: 'adminGoogleId',
    name: 'Admin Name',
    role: 'Admin'
  }
}));

/* istanbul ignore next */ /*No tests on these as they are to setup test users for marking*/
router.get('/bypassAdmin', passport.authenticate('bypassAdmin'), (req, res) => {
  res.cookie('access_token', 'fakeAdminId', { httpOnly: true, sameSite: 'strict' });
  res.redirect('/');
});

module.exports = router;
module.exports.passport = passport;