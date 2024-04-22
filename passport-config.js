const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const uuid = require('uuid');
require('dotenv').config();

const dir = './db';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

const db = new sqlite3.Database(path.join(dir, 'users.db'));

db.run("CREATE TABLE IF NOT EXISTS users (id TEXT, googleId TEXT, name TEXT, role TEXT)");

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL
  },
  function(accessToken, refreshToken, profile, cb) {
    db.get("SELECT * FROM users WHERE googleId = ?", profile.id, function(err, user) {
      let role = profile.id == 118139987500403906696 ? 'Admin' : 'Shopper';
      if (!user) {
        user = {
          provider: profile.provider,
          id: uuid.v4(),
          googleId: profile.id,
          name: profile.displayName,
          role: role };
        db.run("INSERT INTO users (id, googleId, name, role) VALUES (?, ?, ?, ?)", user.id, user.googleId, user.name, user.role);
      } else {
        user.provider = profile.provider;
        user.name = profile.displayName;
        user.role = role;
        db.run("UPDATE users SET name = ?, role = ? WHERE id = ?", user.name, user.role, user.id);
      }
      user.accessToken = accessToken;
      return cb(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    db.get("SELECT * FROM users WHERE id = ?", id, function(err, user) {
      done(err, user);
    });
});

module.exports = passport;