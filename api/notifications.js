// notifications.js
const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database('./db/espaza.db');


async function ensureLoggedIn(req, res, next) {
    if (!req.user) {
        res.status(404).json();
        return;
    }
    next();
}


db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY,
        userId INTEGER,
        orderId INTEGER,
        message TEXT,
        isRead INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id),
        FOREIGN KEY(orderId) REFERENCES orders(id)
    )
`);


router.post('/', ensureLoggedIn, async (req, res) => {
    const { userId, orderId, message } = req.body;
    db.run("INSERT INTO notifications (userId, orderId, message) VALUES (?, ?, ?)", [userId, orderId, message], function(err) {
        if (err) {
            return console.error(err.message);
        }
        res.json({ message: 'Notification created' });
    });
});


router.get('/', ensureLoggedIn, async (req, res) => {
    let userId = req.user;
    db.all("SELECT * FROM notifications WHERE userId = ?", [userId], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
});


router.put('/:id/read', ensureLoggedIn, async (req, res) => {
    const { id } = req.params;
    db.run("UPDATE notifications SET isRead = 1 WHERE id = ?", [id], function(err) {
        if (err) {
            return console.error(err.message);
        }
        res.json({ message: 'Notification marked as read' });
    });
});


module.exports = router;