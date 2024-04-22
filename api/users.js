const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/users.db');

db.run("CREATE TABLE IF NOT EXISTS users (id TEXT, googleId TEXT, name TEXT, role TEXT)");

// function ensureAdmin(req, res, next) {
//     if (req.user && req.user.role === 'Admin') {
//         next();
//     } else {
//         res.status(403).json({ message: 'Forbidden: You do not have the necessary permissions' });
//     }
// }

// router.use(ensureAdmin);

router.delete('/:id', (req, res) => {
    db.run("DELETE FROM users WHERE id = ?", req.params.id, function(err) {
        if (err) {
            return console.error(err.message);
        }
        res.status(204).json({ message: 'User deleted successfully' });
    });
});

router.get('/', (req, res) => {
    db.all("SELECT id, name, role FROM users", function(err, users) {
        if (err) {
            return console.error(err.message);
        }
        res.json(users);
    });
});

router.put('/:id', (req, res) => {
    db.run("UPDATE users SET role = ? WHERE id = ?", [req.body.role, req.params.id], function(err) {
        if (err) {
            return console.error(err.message);
        }
        res.json({ message: 'User updated successfully' });
    });
});

module.exports = router;