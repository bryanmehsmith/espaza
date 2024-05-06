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
    CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY, 
        userId INTEGER, 
        itemId INTEGER, 
        quantity INTEGER,
        FOREIGN KEY(userId) REFERENCES users(id),
        FOREIGN KEY(itemId) REFERENCES items(id)
    )
`);

// Routes
router.post('/add', ensureLoggedIn, async (req, res) => {
    const { userId, itemId, quantity } = req.body;
    db.run("INSERT INTO cart (userId, itemId, quantity) VALUES (?, ?, ?)", [userId, itemId, quantity], function(err) {
        if (err) {
            return console.error(err.message);
        }
        res.json({ message: 'Item added to cart' });
    });
});

router.post('/remove', ensureLoggedIn, async (req, res) => {
    const { userId, itemId } = req.body;
    db.run("DELETE FROM cart WHERE userId = ? AND itemId = ?", [userId, itemId], function(err) {
        if (err) {
            return console.error(err.message);
        }
        res.json({ message: 'Item removed from cart' });
    });
});

router.get('/:userId', /*ensureLoggedIn,*/ async (req, res) => {
    const { userId } = req.params;
    db.all("SELECT * FROM cart WHERE userId = ?", [userId], (err, rows) => {
        if (err) {
            throw err;
        }
        res.json(rows);
    });
});

module.exports = router;
module.exports.ensureLoggedIn = ensureLoggedIn;