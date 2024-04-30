const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3');
const fs = require('fs');

if (!fs.existsSync('./db')){fs.mkdirSync('./db');}
const db = new sqlite3.Database('./db/users.db');
db.run("CREATE TABLE IF NOT EXISTS users (id TEXT, googleId TEXT, name TEXT, role TEXT)");

// Permissions middleware
async function ensureExists(req, res, next) {
    if (!req.user) {
        res.status(404).json();
        return;
    }
    try {
        const user = await new Promise((resolve, reject) => {
            db.get("SELECT * FROM users WHERE id = ?", req.user, function(err, user) {
                if (err) reject(err);
                resolve(user);
            });
        });

        if (user) {
            next();
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'An error occurred' });
    }
}

async function ensureInternal(req, res, next) {
    if (!req.user) {
        res.status(404).json();
        return;
    }
    try {
        const user = await new Promise((resolve, reject) => {
            db.get("SELECT * FROM users WHERE id = ?", req.user, function(err, user) {
                if (err) reject(err);
                resolve(user);
            });
        });

        const roles = ['Admin', 'Staff'];
        if (user && roles.includes(user.role)) {
            next();
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'An error occurred' });
    }
}

async function ensureAdmin(req, res, next) {
    if (!req.user) {
        res.status(404).json();
        return;
    }
    try {
        const user = await new Promise((resolve, reject) => {
            db.get("SELECT * FROM users WHERE id = ?", req.user, function(err, user) {
                if (err) reject(err);
                resolve(user);
            });
        });

        const roles = ['Admin'];
        if (user && roles.includes(user.role)) {
            next();
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'An error occurred' });
    }
}

// Admin routes
router.delete('/:id', ensureAdmin, async (req, res) => {
    try {
        if (req.user === req.params.id) {
            res.status(400).json({ message: 'You cannot delete your own user' });
            return;
        }

        await new Promise((resolve, reject) => {
            db.run("DELETE FROM users WHERE id = ?", req.params.id, function(err) {
                if (err) reject(err);
                resolve();
            });
        });
        res.status(200).send({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'An error occurred' });
    }
});

router.get('/', ensureAdmin, async (req, res) => {
    try {
        const users = await new Promise((resolve, reject) => {
            db.all("SELECT id, name, role FROM users", function(err, users) {
                if (err) reject(err);
                resolve(users);
            });
        });
        res.json({ users, requestingUserId: req.user });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'An error occurred' });
    }
});

router.put('/:id', ensureAdmin, async (req, res) => {
    try {
        if (req.user === req.params.id) {
            res.status(400).json({ message: 'You cannot update your own role' });
            return;
        }

        const validRoles = ['Shopper', 'Staff', 'Admin'];
        if (!validRoles.includes(req.body.role)) {
            res.status(400).json({ message: 'Invalid role' });
            return;
        }

        await new Promise((resolve, reject) => {
            db.run("UPDATE users SET role = ? WHERE id = ?", [req.body.role, req.params.id], function(err) {
                if (err) reject(err);
                resolve();
            });
        });
        res.json({ message: 'User updated successfully' });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'An error occurred' });
    }
});

// Internal Routes
router.get('/me', ensureInternal, async (req, res) => {
    try {
        const user = await new Promise((resolve, reject) => {
            db.get("SELECT id, name, role FROM users WHERE id = ?", req.user, function(err, user) {
                if (err) {
                    reject(err);
                } else {
                    resolve(user);
                }
            });
        });

        res.json({ user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Self routes
router.get('/self/userRole', ensureExists, async (req, res) => {
    try {
        const row = await new Promise((resolve, reject) => {
            db.get("SELECT role FROM users WHERE id = ?", req.user, function(err, row) {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });

        res.json({ role: row ? row.role : null });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
module.exports.ensureAdmin = ensureAdmin;
module.exports.ensureInternal = ensureInternal;
module.exports.ensureExists = ensureExists;