const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/users.db');

db.run("CREATE TABLE IF NOT EXISTS users (id TEXT, googleId TEXT, name TEXT, role TEXT)");

async function ensureAdmin(req, res, next) {
    try {
        const user = await new Promise((resolve, reject) => {
            db.get("SELECT * FROM users WHERE id = ?", req.user, function(err, user) {
                if (err) reject(err);
                resolve(user);
            });
        });

        if (user && user.role === 'Admin') {
            next();
        } else {
            res.status(404);
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'An error occurred' });
    }
}

router.use(ensureAdmin);

router.delete('/:id', ensureAdmin, async (req, res) => {
    try {
        await new Promise((resolve, reject) => {
            db.run("DELETE FROM users WHERE id = ?", req.params.id, function(err) {
                if (err) reject(err);
                resolve();
            });
        });
        res.status(204).json({ message: 'User deleted successfully' });
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
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'An error occurred' });
    }
});

router.get('/userRole', (req, res) => {
    db.get("SELECT role FROM users WHERE id = ?", req.user, function(err, row) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ role: row ? row.role : null });
    });
});

router.put('/:id', ensureAdmin, async (req, res) => {
    try {
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

module.exports = router;
module.exports.ensureAdmin = ensureAdmin;